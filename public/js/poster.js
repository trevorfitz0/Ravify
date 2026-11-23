// Draws the whole poster (background + lettering) onto a canvas of any size.
// Designed for a 1080 x 1920 story; everything is measured in "u" = 1/1080 of the width.
(function () {
  const RV = (window.RV = window.RV || {});

  RV.fonts = [
    { id: 'poster', name: 'Poster', family: '"Bebas Neue", Impact, sans-serif', weight: 400, upper: true, mul: 1.12 },
    { id: 'clean', name: 'Clean', family: '"Space Grotesk", system-ui, sans-serif', weight: 700, upper: false, mul: 0.92 },
    { id: 'mono', name: 'Mono', family: '"Space Mono", ui-monospace, monospace', weight: 700, upper: true, mul: 0.74 },
  ];
  const MONO = '"Space Mono", ui-monospace, monospace';
  const SEP = '  •  ';
  RV.MAX_ARTISTS = 30;

  // How the list splits into rows of shrinking size: headliner, then 2, 5, 8, the rest.
  const TIERS = [
    { take: 1, size: 178 },
    { take: 2, size: 96 },
    { take: 5, size: 62 },
    { take: 8, size: 46 },
    { take: 99, size: 36 },
  ];

  function width(ctx, text, font, size) {
    ctx.font = `${font.weight} ${size}px ${font.family}`;
    return ctx.measureText(text).width;
  }

  function layout(ctx, artists, font, maxW, u, scale) {
    const lines = [];
    let i = 0;
    TIERS.forEach((tier, ti) => {
      const names = artists.slice(i, i + tier.take);
      i += tier.take;
      if (!names.length) return;
      const size = tier.size * font.mul * u * scale;
      let cur = [];
      const flush = () => {
        if (!cur.length) return;
        const text = cur.join(SEP);
        const wd = width(ctx, text, font, size);
        lines.push({ text, size: wd > maxW ? (size * maxW) / wd : size, tier: ti });
        cur = [];
      };
      for (const n of names) {
        // The top two tiers get a line each; smaller names share lines.
        if (cur.length && (ti < 2 || width(ctx, [...cur, n].join(SEP), font, size) > maxW)) flush();
        cur.push(n);
      }
      flush();
      if (lines.length) lines[lines.length - 1].gap = true;
    });
    let total = 0;
    for (const l of lines) total += l.size * 1.12 + (l.gap ? 30 * u * scale : 0);
    return { lines, total };
  }

  RV.drawPoster = function (ctx, w, h, t, state) {
    const u = w / 1080;
    const pal = RV.drawBackground(ctx, w, h, t, state);
    const font = RV.fonts.find((f) => f.id === state.font) || RV.fonts[0];
    const maxW = w - 130 * u;
    const cx = w / 2;

    // A soft dark band behind the lettering keeps it readable on the busier backgrounds.
    const scrim = ctx.createLinearGradient(0, 0, 0, h);
    scrim.addColorStop(0, RV.rgba(pal.bg, 0.5));
    scrim.addColorStop(0.5, RV.rgba(pal.bg, 0.28));
    scrim.addColorStop(1, RV.rgba(pal.bg, 0.6));
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = RV.rgba(pal.bg, 0.75);
    ctx.shadowBlur = 22 * u;

    // Stories hide the top and bottom ~250px behind their own buttons, so nothing important goes there.
    let y = 250 * u;
    const title = (state.title || '').trim();
    if (title) {
      const text = font.upper ? title.toUpperCase() : title;
      let size = 120 * font.mul * u;
      const wd = width(ctx, text, font, size);
      if (wd > maxW) size = (size * maxW) / wd;
      ctx.font = `${font.weight} ${size}px ${font.family}`;
      ctx.fillStyle = pal.hot;
      ctx.fillText(text, cx, y);
      y += size * 1.1;
    }
    const sub = (state.sub || '').trim();
    if (sub) {
      let size = 32 * u;
      const text = sub.toUpperCase();
      ctx.font = `700 ${size}px ${MONO}`;
      const wd = ctx.measureText(text).width;
      if (wd > maxW) { size = (size * maxW) / wd; ctx.font = `700 ${size}px ${MONO}`; }
      ctx.fillStyle = pal.text;
      ctx.fillText(text, cx, y + 6 * u);
      y += size * 1.9;
    }
    if (title || sub) {
      ctx.fillStyle = RV.rgba(pal.text, 0.55);
      ctx.fillRect(cx - 170 * u, y + 8 * u, 340 * u, 3 * u);
      y += 50 * u;
    }

    const bottom = h - 300 * u;
    const artists = (state.artists || []).slice(0, RV.MAX_ARTISTS).map((n) => (font.upper ? n.toUpperCase() : n));
    if (artists.length) {
      let scale = 1, block = layout(ctx, artists, font, maxW, u, scale);
      for (let k = 0; k < 14 && block.total > bottom - y; k++) {
        scale *= 0.92;
        block = layout(ctx, artists, font, maxW, u, scale);
      }
      let ly = y + Math.max(0, (bottom - y - block.total) / 2);
      const colors = [pal.text, pal.hot, pal.text, pal.hot, pal.text];
      for (const l of block.lines) {
        ctx.font = `${font.weight} ${l.size}px ${font.family}`;
        ctx.fillStyle = colors[l.tier];
        ctx.fillText(l.text, cx, ly);
        ly += l.size * 1.12 + (l.gap ? 30 * u * scale : 0);
      }
    } else {
      ctx.font = `700 ${40 * u}px ${MONO}`;
      ctx.fillStyle = RV.rgba(pal.text, 0.8);
      ctx.fillText('ADD YOUR ARTISTS', cx, (y + bottom) / 2);
    }

    const mark = (RV.config && RV.config.watermark) || '';
    if (mark && !state.noMark) {
      ctx.font = `700 ${26 * u}px ${MONO}`;
      ctx.fillStyle = RV.rgba(pal.text, 0.85);
      ctx.fillText(mark.toUpperCase(), cx, h - 268 * u);
    }
    ctx.shadowBlur = 0;
  };
})();
