// Filling the lineup from a music app: Spotify, Apple Music, and optionally Last.fm.
(function () {
  const RV = (window.RV = window.RV || {});

  function b64url(bytes) {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  const redirectUri = () => location.origin + '/callback/';

  // Spotify sign-in using PKCE: no client secret is needed or used anywhere.
  RV.spotifyLogin = async function () {
    const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    sessionStorage.setItem('rv-verifier', verifier);
    const q = new URLSearchParams({
      client_id: RV.config.spotifyClientId,
      response_type: 'code',
      redirect_uri: redirectUri(),
      scope: 'user-top-read',
      code_challenge_method: 'S256',
      code_challenge: b64url(new Uint8Array(hash)),
    });
    location.href = 'https://accounts.spotify.com/authorize?' + q;
  };

  RV.spotifyFinish = async function (code) {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: RV.config.spotifyClientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri(),
        code_verifier: sessionStorage.getItem('rv-verifier') || '',
      }),
    });
    if (!res.ok) throw new Error('Spotify sign-in did not complete.');
    const { access_token } = await res.json();
    const top = await fetch('https://api.spotify.com/v1/me/top/artists?limit=30&time_range=medium_term', {
      headers: { Authorization: 'Bearer ' + access_token },
    });
    if (!top.ok) throw new Error('Spotify would not share your top artists.');
    const data = await top.json();
    return (data.items || []).map((a) => a.name);
  };

  // ----- Apple Music -----
  // The developer token is signed on the host (api/apple-token.js) so the private key never reaches the browser.
  RV.appleToken = async function () {
    try {
      const res = await fetch('/api/apple-token');
      if (!res.ok) return null;
      return (await res.json()).token || null;
    } catch (e) { return null; }
  };
  function script(src) {
    return new Promise((resolve, reject) => {
      if (window.MusicKit) return resolve();
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => reject(new Error('Could not reach Apple Music.'));
      document.head.append(el);
    });
  }
  // Collects artist names from anywhere inside an Apple Music response, in the order they appear.
  function artistNames(node, out) {
    if (!node || typeof node !== 'object') return out;
    if (/artists$/.test(node.type || '') && node.attributes && node.attributes.name) out.push(node.attributes.name);
    for (const k in node) artistNames(node[k], out);
    return out;
  }
  RV.appleTop = async function (devToken) {
    await script('https://js-cdn.music.apple.com/musickit/v3/musickit.js');
    await MusicKit.configure({ developerToken: devToken, app: { name: 'simplefest', build: '2.0' } });
    const userToken = await MusicKit.getInstance().authorize();
    if (!userToken) throw new Error('Apple Music sign-in was cancelled.');
    const get = async (path) => {
      const res = await fetch('https://api.music.apple.com' + path, {
        headers: { Authorization: 'Bearer ' + devToken, 'Music-User-Token': userToken },
      });
      if (!res.ok) throw new Error('Apple Music would not share that (' + res.status + ').');
      return res.json();
    };
    const unique = (list) => [...new Set(list)].slice(0, 30);
    // 1. The latest Replay summary has a ready-made top-artists list.
    try {
      const names = unique(artistNames(await get('/v1/me/music-summaries?filter[year]=latest&views=top-artists'), []));
      if (names.length >= 5) return names;
    } catch (e) { /* no Replay yet: fall through */ }
    // 2. Otherwise rank artists by how often they show up in recently played songs.
    try {
      const counts = new Map();
      for (let offset = 0; offset < 50; offset += 10) {
        const page = await get('/v1/me/recent/played/tracks?limit=10&offset=' + offset);
        for (const t of page.data || []) {
          const n = t.attributes && t.attributes.artistName;
          if (n) counts.set(n, (counts.get(n) || 0) + 1);
        }
        if (!page.next) break;
      }
      const names = [...counts.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0]).slice(0, 30);
      if (names.length >= 5) return names;
    } catch (e) { /* fall through */ }
    // 3. Last resort: artists saved in their library.
    return unique(artistNames(await get('/v1/me/library/artists?limit=30'), []));
  };

  RV.lastfmTop = async function (user) {
    const q = new URLSearchParams({
      method: 'user.gettopartists', user, api_key: RV.config.lastfmApiKey, format: 'json', limit: '30', period: '6month',
    });
    const res = await fetch('https://ws.audioscrobbler.com/2.0/?' + q);
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.message || 'Could not find that Last.fm user.');
    return ((data.topartists && data.topartists.artist) || []).map((a) => a.name);
  };
})();
