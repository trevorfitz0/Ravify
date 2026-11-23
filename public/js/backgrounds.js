// Animated poster backgrounds, drawn on a canvas.
// Every background is a function of t (0 to 1) that ends exactly where it starts, so a recorded loop is seamless.
(function () {
  const RV = (window.RV = window.RV || {});
  const TAU = Math.PI * 2;

  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  RV.rgba = rgba;

  // Small repeatable random generator, so stars sit in the same place on every frame.
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let x = Math.imul(s ^ (s >>> 15), 1 | s);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  // bg: darkest tone. a, b, c: the three colours. hot: highlight. text: lettering.
  RV.palettes = [
    { id: 'dusk', name: 'Dusk', bg: '#1A1013', a: '#5B2E48', b: '#585563', c: '#73937E', hot: '#CEB992', text: '#F6EEDD' },
    { id: 'neon', name: 'Neon', bg: '#0B0620', a: '#FF2E93', b: '#7A2BFF', c: '#00E5FF', hot: '#F9F871', text: '#FFFFFF' },
    { id: 'sunrise', name: 'Sunrise', bg: '#2A0F1E', a: '#FF5E5B', b: '#FF9F1C', c: '#FFD166', hot: '#FFF3D6', text: '#FFF8EC' },
    { id: 'forest', name: 'Forest', bg: '#07140F', a: '#1F5F4A', b: '#2E8B57', c: '#A7D676', hot: '#EAF7C8', text: '#F3FBEA' },
    { id: 'ice', name: 'Ice', bg: '#06121F', a: '#1D4E89', b: '#3FA7D6', c: '#9BE7FF', hot: '#FFFFFF', text: '#F2FAFF' },
    { id: 'mono', name: 'Mono', bg: '#0C0C0C', a: '#3A3A3A', b: '#6B6B6B', c: '#BDBDBD', hot: '#FFFFFF', text: '#FFFFFF' },
  ];

  function glow(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function drift(ctx, w, h, t, p) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'screen';
    const blobs = [
      [p.a, 0.25, 0.22, 0.85, 1, 0.0, 0.85],
      [p.b, 0.78, 0.2, 0.7, 1, 0.3, 0.8],
      [p.c, 0.72, 0.74, 0.7, 2, 0.6, 0.7],
      [p.a, 0.2, 0.82, 0.8, 1, 0.8, 0.85],
      [p.hot, 0.5, 0.5, 0.4, 2, 0.15, 0.3],
    ];
    for (const [col, x, y, size, k, ph, al] of blobs) {
      const cx = (x + 0.16 * Math.cos(TAU * (t * k + ph))) * w;
      const cy = (y + 0.1 * Math.sin(TAU * (t * k + ph))) * h;
      glow(ctx, cx, cy, size * w * (1 + 0.12 * Math.sin(TAU * (t + ph))), col, al);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function lasers(ctx, w, h, t, p) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'screen';
    glow(ctx, w / 2, h * 1.02, w * 0.95, p.a, 0.75);
    const cols = [p.a, p.c, p.b, p.hot, p.c, p.a, p.b, p.c];
    const len = h * 1.25;
    for (const [ox, dir] of [[w * 0.08, 1], [w * 0.92, -1], [w * 0.5, 1]]) {
      for (let i = 0; i < 5; i++) {
        const spread = (i - 2) * 0.2;
        const sway = 0.3 * Math.sin(TAU * (t * (1 + (i % 2)) + i * 0.17 + (dir > 0 ? 0 : 0.5)));
        const ang = Math.PI / 2 + spread + sway * dir + (ox === w * 0.5 ? 0 : dir * -0.25);
        const half = 0.028;
        const col = cols[(i + (dir > 0 ? 0 : 3)) % cols.length];
        const g = ctx.createLinearGradient(ox, 0, ox + Math.cos(ang) * len, Math.sin(ang) * len);
        g.addColorStop(0, rgba(col, 0.8));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ox, -h * 0.01);
        ctx.lineTo(ox + Math.cos(ang - half) * len, Math.sin(ang - half) * len);
        ctx.lineTo(ox + Math.cos(ang + half) * len, Math.sin(ang + half) * len);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function pulse(ctx, w, h, t, p) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.5, maxR = h * 0.72, n = 9;
    const cols = [p.a, p.c, p.b, p.hot];
    ctx.globalCompositeOperation = 'screen';
    glow(ctx, cx, cy, w * (0.75 + 0.06 * Math.sin(TAU * t * 4)), p.a, 0.7);
    for (let i = 0; i < n; i++) {
      const f = (i / n + t) % 1;
      ctx.strokeStyle = rgba(cols[i % cols.length], Math.pow(1 - f, 1.4) * 0.9);
      ctx.lineWidth = (4 + 30 * f) * (w / 1080);
      ctx.beginPath();
      ctx.arc(cx, cy, f * maxR, 0, TAU);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function stars(ctx, w, h, t, p) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, p.bg);
    sky.addColorStop(1, rgba(p.a, 1));
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'screen';
    // Aurora ribbons.
    const bands = [p.c, p.b, p.a];
    for (let j = 0; j < bands.length; j++) {
      const base = h * (0.24 + j * 0.13);
      const depth = h * 0.3;
      const g = ctx.createLinearGradient(0, base - h * 0.06, 0, base + depth);
      g.addColorStop(0, rgba(bands[j], 0.55));
      g.addColorStop(1, rgba(bands[j], 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, base + depth);
      for (let i = 0; i <= 40; i++) {
        const x = (i / 40) * w;
        const y = base + Math.sin((i / 40) * TAU * 1.2 + TAU * t * (j % 2 ? 1 : -1) + j * 1.7) * h * 0.05;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, base + depth);
      ctx.closePath();
      ctx.fill();
    }
    // Twinkling stars.
    const r = rng(7);
    const u = w / 1080;
    for (let i = 0; i < 150; i++) {
      const x = r() * w, y = r() * h, size = (1 + r() * 3.2) * u, k = 1 + Math.floor(r() * 3), ph = r();
      const al = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(TAU * (t * k + ph)));
      ctx.fillStyle = rgba(i % 9 === 0 ? p.hot : p.text, al);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function grid(ctx, w, h, t, p) {
    const u = w / 1080;
    const y0 = h * 0.56;
    ctx.clearRect(0, 0, w, h);
    // Sun with moving slits, drawn first so the slits can be cut out of it.
    const sr = w * 0.3, sx = w / 2, sy = y0 - sr * 0.35;
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.clip();
    const sg = ctx.createLinearGradient(0, sy - sr, 0, sy + sr);
    sg.addColorStop(0, p.hot);
    sg.addColorStop(0.55, p.c);
    sg.addColorStop(1, p.a);
    ctx.fillStyle = sg;
    ctx.globalAlpha = 0.7; // dimmed a little so names printed over the sun stay readable
    ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-out';
    const slits = 7;
    for (let k = 0; k < slits; k++) {
      const f = ((k + t) % slits) / slits;
      ctx.fillRect(sx - sr, sy + sr - f * sr * 1.3, sr * 2, (1 - f) * sr * 0.1);
    }
    ctx.restore();
    // Sky goes behind the sun.
    ctx.globalCompositeOperation = 'destination-over';
    const sky = ctx.createLinearGradient(0, 0, 0, y0);
    sky.addColorStop(0, p.bg);
    sky.addColorStop(1, p.a);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    // Ground and grid.
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, y0, w, h - y0);
    const gg = ctx.createLinearGradient(0, y0, 0, h);
    gg.addColorStop(0, rgba(p.a, 0.55));
    gg.addColorStop(1, rgba(p.a, 0));
    ctx.fillStyle = gg;
    ctx.fillRect(0, y0, w, h - y0);
    ctx.lineWidth = 2.5 * u;
    ctx.strokeStyle = rgba(p.c, 0.75);
    ctx.beginPath();
    for (let i = -14; i <= 14; i++) {
      ctx.moveTo(w / 2 + i * w * 0.012, y0);
      ctx.lineTo(w / 2 + i * w * 0.26, h);
    }
    ctx.stroke();
    const rows = 12;
    for (let i = 0; i < rows; i++) {
      const z = ((i + t * 2) % rows) / rows;
      const y = y0 + (h - y0) * z * z;
      ctx.strokeStyle = rgba(p.c, 0.15 + 0.7 * z);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.strokeStyle = p.hot;
    ctx.lineWidth = 4 * u;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(w, y0);
    ctx.stroke();
  }

  function waves(ctx, w, h, t, p) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, p.bg);
    sky.addColorStop(0.6, p.a);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'screen';
    glow(ctx, w * 0.7, h * 0.24, w * (0.5 + 0.03 * Math.sin(TAU * t * 2)), p.hot, 0.55);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = p.hot;
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.24, w * 0.11, 0, TAU);
    ctx.fill();
    const cols = [p.b, p.c, p.a, p.b, p.bg];
    for (let j = 0; j < cols.length; j++) {
      const base = h * (0.44 + j * 0.115);
      const amp = h * 0.03;
      const g = ctx.createLinearGradient(0, base - amp, 0, h);
      g.addColorStop(0, rgba(cols[j], 0.95));
      g.addColorStop(1, rgba(p.bg, 0.95));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i <= 48; i++) {
        const x = (i / 48) * w;
        const y = base
          + Math.sin((i / 48) * TAU * (1 + j * 0.5) + TAU * t * (j % 2 ? 1 : -1) + j * 1.3) * amp
          + Math.sin((i / 48) * TAU * 2.5 - TAU * t * 2 + j) * amp * 0.4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }
  }

  // The visitor's own picture, with a slow zoom so it still moves.
  function photo(ctx, w, h, t, p, img) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, w, h);
    if (!img) return drift(ctx, w, h, t, p);
    const zoom = 1.04 + 0.05 * (0.5 - 0.5 * Math.cos(TAU * t));
    const s = Math.max(w / img.width, h / img.height) * zoom;
    const dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.fillStyle = rgba(p.bg, 0.45);
    ctx.fillRect(0, 0, w, h);
  }

  RV.backgrounds = [
    { id: 'drift', name: 'Drift', draw: drift },
    { id: 'lasers', name: 'Lasers', draw: lasers },
    { id: 'pulse', name: 'Pulse', draw: pulse },
    { id: 'stars', name: 'Aurora', draw: stars },
    { id: 'grid', name: 'Sunset grid', draw: grid },
    { id: 'waves', name: 'Waves', draw: waves },
    { id: 'photo', name: 'Your photo', draw: photo },
  ];

  // Film grain laid over every background. It jumps a few times a second, like the site's own backdrop.
  let tile = null;
  function grainTile() {
    if (tile) return tile;
    const size = 180;
    tile = document.createElement('canvas');
    tile.width = size;
    tile.height = size;
    const g = tile.getContext('2d');
    const d = g.createImageData(size, size);
    const r = rng(42);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.floor(r() * 255);
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return tile;
  }
  RV.grain = function (ctx, w, h, t) {
    const scale = Math.max(1, (w / 1080) * 2);
    const step = Math.floor(t * 96) % 12;
    const ox = (step * 53) % 180, oy = (step * 97) % 180;
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.globalCompositeOperation = 'overlay';
    ctx.scale(scale, scale);
    ctx.translate(-ox, -oy);
    ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
    ctx.fillRect(0, 0, w / scale + 180, h / scale + 180);
    ctx.restore();
  };

  RV.drawBackground = function (ctx, w, h, t, state) {
    const pal = RV.palettes.find((x) => x.id === state.pal) || RV.palettes[0];
    const bg = RV.backgrounds.find((x) => x.id === state.bg) || RV.backgrounds[0];
    ctx.save();
    bg.draw(ctx, w, h, t, pal, state.photo);
    ctx.restore();
    RV.grain(ctx, w, h, t);
    return pal;
  };
})();
