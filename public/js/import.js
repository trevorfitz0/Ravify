// Optional ways to fill the lineup automatically. Both are off until a key is set in config.js.
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
