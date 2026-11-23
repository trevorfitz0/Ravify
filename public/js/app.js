// The page itself: form, live preview, save and share.
(function () {
  const RV = window.RV;
  const $ = (id) => document.getElementById(id);
  const KEY = 'rv-state';

  const SAMPLE = {
    title: 'Midnight Bloom',
    sub: 'Summer 2027 · Main Stage',
    artists: ['Velvet Static', 'Night Owls Club', 'Paper Lanterns', 'Kiko Mara', 'The Low Tides', 'Glasshouse Choir', 'DJ Marigold',
      'Sundown Radio', 'Hollow Pines', 'Neon Abbey', 'Cassette Hearts', 'Moth and Flame', 'Oda Blue', 'Static Bloom', 'Tall Grass',
      'Lumen Park', 'Field Notes', 'Slow Comet'],
    bg: 'drift', pal: 'dusk', font: 'poster',
  };

  // ----- state: from a shared link, else what was here last time, else the sample -----
  function encode(s) {
    const json = JSON.stringify({ t: s.title, s: s.sub, a: s.artists, b: s.bg === 'photo' ? 'drift' : s.bg, p: s.pal, f: s.font });
    return btoa(String.fromCharCode(...new TextEncoder().encode(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(str) {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    const d = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    return { title: d.t, sub: d.s, artists: d.a, bg: d.b, pal: d.p, font: d.f };
  }
  function clean(s) {
    const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
    return {
      title: str(s.title, 40),
      sub: str(s.sub, 60),
      artists: (Array.isArray(s.artists) ? s.artists : []).filter((a) => typeof a === 'string' && a.trim()).map((a) => a.trim().slice(0, 60)).slice(0, RV.MAX_ARTISTS),
      bg: RV.backgrounds.some((b) => b.id === s.bg) && s.bg !== 'photo' ? s.bg : 'drift',
      pal: RV.palettes.some((p) => p.id === s.pal) ? s.pal : 'dusk',
      font: RV.fonts.some((f) => f.id === s.font) ? s.font : 'poster',
    };
  }
  function load() {
    try {
      const m = location.hash.match(/^#l=([\w-]+)$/);
      if (m) { history.replaceState(null, '', location.pathname); return clean(decode(m[1])); }
    } catch (e) { /* a broken link falls through to the saved lineup */ }
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) return clean(JSON.parse(saved));
    } catch (e) { /* storage can be blocked; the sample still works */ }
    return clean(SAMPLE);
  }
  const state = load();
  state.photo = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ ...state, photo: undefined })); } catch (e) { /* ignore */ }
  }

  // ----- live preview -----
  const canvas = $('preview');
  const ctx = canvas.getContext('2d');
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let clock = 0, last = performance.now(), lastDraw = 0;
  function now() { return (clock % RV.LOOP_MS) / RV.LOOP_MS; }
  function draw() { RV.drawPoster(ctx, canvas.width, canvas.height, now(), state); }
  function tick(ts) {
    if (!paused) clock += ts - last;
    last = ts;
    if (!paused && ts - lastDraw > 30 && !document.hidden && !$('sheet').open) { draw(); lastDraw = ts; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  const pauseBtn = $('pause');
  function setPaused(p) {
    paused = p;
    pauseBtn.setAttribute('aria-pressed', String(p));
    pauseBtn.setAttribute('aria-label', p ? 'Play the animation' : 'Pause the animation');
  }
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  setPaused(paused);
  function changed() { save(); if (paused) draw(); }
  // Poster lettering uses web fonts, so redraw once they have arrived.
  const fontsReady = Promise.all([
    document.fonts.load('400 40px "Bebas Neue"'),
    document.fonts.load('700 40px "Space Grotesk"'),
    document.fonts.load('700 40px "Space Mono"'),
  ]).catch(() => {});
  fontsReady.then(draw);
  draw();

  // ----- the lineup form -----
  const title = $('title'), sub = $('sub'), artists = $('artists'), count = $('count');
  function fillForm() {
    title.value = state.title;
    sub.value = state.sub;
    artists.value = state.artists.join('\n');
    showCount();
  }
  function showCount() {
    const lines = artists.value.split('\n').filter((l) => l.trim()).length;
    count.textContent = lines > RV.MAX_ARTISTS ? `first ${RV.MAX_ARTISTS} of ${lines} shown` : `${lines} of ${RV.MAX_ARTISTS}`;
  }
  title.addEventListener('input', () => { state.title = title.value; changed(); });
  sub.addEventListener('input', () => { state.sub = sub.value; changed(); });
  artists.addEventListener('input', () => {
    state.artists = artists.value.split('\n').map((l) => l.trim().slice(0, 60)).filter(Boolean).slice(0, RV.MAX_ARTISTS);
    showCount();
    changed();
  });
  function setArtists(list) {
    state.artists = list.slice(0, RV.MAX_ARTISTS);
    artists.value = state.artists.join('\n');
    showCount();
    changed();
  }
  $('shuffle').addEventListener('click', () => {
    const a = state.artists.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    setArtists(a);
  });
  $('clear').addEventListener('click', () => {
    state.title = ''; state.sub = '';
    title.value = ''; sub.value = '';
    setArtists([]);
    title.focus();
  });
  fillForm();

  // ----- sign in with a music app -----
  const importError = $('import-error'), source = $('source');
  function fail(e) { importError.textContent = (e && e.message) || 'That did not work. Try again.'; importError.hidden = false; }
  function imported(names, from) {
    const list = clean({ artists: names }).artists;
    if (!list.length) return fail(new Error(from + ' has no listening history for this account yet.'));
    importError.hidden = true;
    setArtists(list);
    source.textContent = `Your top ${list.length} from ${from}. Your number one is headlining.`;
    $('edit').open = false;
    $('make').scrollIntoView({ block: 'start' });
  }
  if (RV.config.spotifyClientId) {
    $('spotify').hidden = false;
    $('spotify').addEventListener('click', () => RV.spotifyLogin().catch(fail));
  }
  // The Apple Music button appears only when the host has Apple credentials set up.
  RV.appleToken().then((token) => {
    if (!token) return;
    $('apple').hidden = false;
    $('apple').addEventListener('click', () => {
      $('apple').disabled = true;
      RV.appleTop(token).then((names) => imported(names, 'Apple Music')).catch(fail).finally(() => { $('apple').disabled = false; });
    });
  });
  if (RV.config.lastfmApiKey) {
    $('lastfm').hidden = false;
    $('lastfm').addEventListener('click', () => { $('lastfm-form').hidden = false; $('lastfm-user').focus(); });
    $('lastfm-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = $('lastfm-user').value.trim();
      if (user) RV.lastfmTop(user).then((names) => imported(names, 'Last.fm')).catch(fail);
    });
  }
  // Names handed back by the Spotify callback page.
  try {
    const got = localStorage.getItem('rv-import');
    if (got) {
      localStorage.removeItem('rv-import');
      const d = JSON.parse(got);
      if (d.error) fail(new Error(d.error));
      else imported(d.artists || [], 'Spotify');
    }
  } catch (e) { /* ignore */ }

  // ----- the look -----
  function pickers() {
    const pal = RV.palettes.find((p) => p.id === state.pal);
    const bgs = $('bgs');
    bgs.textContent = '';
    for (const b of RV.backgrounds) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(state.bg === b.id));
      const c = document.createElement('canvas');
      c.width = 168; c.height = 252;
      const g = c.getContext('2d');
      g.save();
      b.draw(g, 168, 252, 0.2, pal, state.photo);
      g.restore();
      if (b.id === 'photo' && !state.photo) {
        g.fillStyle = RV.rgba(pal.bg, 0.6); g.fillRect(0, 0, 168, 252);
        g.fillStyle = pal.text; g.font = '700 72px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('+', 84, 126);
      }
      btn.append(c, document.createTextNode(b.name));
      btn.addEventListener('click', () => {
        if (b.id === 'photo') return $('photo').click();
        state.bg = b.id; pickers(); changed();
      });
      bgs.append(btn);
    }
    const pals = $('pals');
    pals.textContent = '';
    for (const p of RV.palettes) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(state.pal === p.id));
      const chips = document.createElement('span');
      chips.className = 'chips';
      for (const col of [p.bg, p.a, p.b, p.c, p.hot]) { const i = document.createElement('i'); i.style.background = col; chips.append(i); }
      btn.append(chips, document.createTextNode(p.name));
      btn.addEventListener('click', () => { state.pal = p.id; pickers(); changed(); });
      pals.append(btn);
    }
    const fonts = $('fonts');
    fonts.textContent = '';
    for (const f of RV.fonts) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(state.font === f.id));
      btn.textContent = f.name;
      btn.addEventListener('click', () => { state.font = f.id; pickers(); changed(); });
      fonts.append(btn);
    }
  }
  pickers();
  $('photo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); state.photo = img; state.bg = 'photo'; pickers(); changed(); };
    img.onerror = () => { URL.revokeObjectURL(url); toast('That file is not a picture this browser can open.'); };
    img.src = url;
    e.target.value = '';
  });

  // ----- save and share -----
  const sheet = $('sheet'), result = $('result'), bar = $('bar'), status = $('sheet-status'), hint = $('sheet-hint');
  let file = null, fileUrl = null, busy = false;
  function openSheet(heading, text) {
    $('sheet-title').textContent = heading;
    status.textContent = text;
    result.textContent = '';
    hint.textContent = '';
    bar.style.width = '0';
    $('progress').hidden = false;
    $('sheet-actions').hidden = true;
    if (!sheet.open) sheet.showModal();
  }
  function showResult(f) {
    file = f;
    fileUrl = URL.createObjectURL(f);
    const isVideo = f.type.startsWith('video/');
    const el = document.createElement(isVideo ? 'video' : 'img');
    el.src = fileUrl;
    if (isVideo) { el.autoplay = true; el.loop = true; el.muted = true; el.playsInline = true; el.setAttribute('aria-label', 'Your moving lineup poster'); }
    else el.alt = 'Your lineup poster';
    result.append(el);
    $('sheet-title').textContent = isVideo ? 'Your moving poster' : 'Your poster';
    status.textContent = '';
    $('progress').hidden = true;
    $('sheet-actions').hidden = false;
    const share = RV.canShare(f);
    $('share').hidden = !share;
    if (f.type === 'video/webm') hint.textContent = 'This browser records WebM video, which Instagram and Snapchat will not take. Open simplefest in Chrome or Safari to get an MP4.';
    else if (share) hint.textContent = 'Tap Share to story, choose Instagram or Snapchat, then pick Story.';
    else hint.textContent = 'Download it, then add it to your story from your camera roll. Sharing straight to Instagram or Snapchat works when you open simplefest on your phone.';
  }
  function closeSheet() {
    if (busy) return;
    result.textContent = '';
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    file = fileUrl = null;
    if (sheet.open) sheet.close();
    draw();
  }
  $('sheet-close').addEventListener('click', closeSheet);
  sheet.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(); });
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });

  async function make(kind) {
    if (busy) return;
    busy = true;
    const snap = { ...state, artists: state.artists.slice() };
    try {
      await fontsReady;
      if (kind === 'image') {
        openSheet('Making your poster', 'One moment…');
        bar.style.width = '100%';
        showResult(await RV.makeImage(snap, now()));
      } else {
        openSheet('Recording your poster', 'Recording an eight-second loop. Keep this tab open.');
        showResult(await RV.makeVideo(snap, (p) => { bar.style.width = Math.round(p * 100) + '%'; }));
      }
    } catch (e) {
      status.textContent = e.message || 'Something went wrong making that.';
      $('progress').hidden = true;
    }
    busy = false;
  }
  $('save-image').addEventListener('click', () => make('image'));
  if (RV.videoType()) $('save-video').addEventListener('click', () => make('video'));
  else { $('save-video').disabled = true; $('save-video').textContent = 'Video not supported here'; }

  $('download').addEventListener('click', () => file && RV.download(file));
  $('share').addEventListener('click', () => {
    if (!file) return;
    navigator.share({ files: [file] }).catch((e) => {
      if (e && e.name !== 'AbortError') hint.textContent = 'Sharing did not open. Use Download instead, then add it to your story.';
    });
  });

  let toastTimer;
  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }
  $('copy').addEventListener('click', () => {
    const url = location.origin + location.pathname + '#l=' + encode(state);
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
      () => toast('Link copied'),
      () => window.prompt('Copy this link', url)
    );
  });

  RV.state = state; // handy when testing from the console
})();
