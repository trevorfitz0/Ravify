// Turning the poster into files: a PNG, or a short looping video for stories.
(function () {
  const RV = (window.RV = window.RV || {});
  RV.W = 1080;
  RV.H = 1920;
  RV.LOOP_MS = 8000; // one full loop of every background

  function full() {
    const c = document.createElement('canvas');
    c.width = RV.W;
    c.height = RV.H;
    return c;
  }

  RV.makeImage = function (state, t) {
    const c = full();
    RV.drawPoster(c.getContext('2d'), RV.W, RV.H, t, state);
    return new Promise((resolve, reject) => {
      c.toBlob((b) => (b ? resolve(new File([b], 'simplefest-lineup.png', { type: 'image/png' })) : reject(new Error('no image'))), 'image/png');
    });
  };

  // Instagram and Snapchat want MP4. Browsers that can only record WebM still get a file, with a note.
  RV.videoType = function () {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return null;
    const types = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mime = types.find((m) => MediaRecorder.isTypeSupported(m));
    return mime ? { mime, ext: mime.startsWith('video/mp4') ? 'mp4' : 'webm' } : null;
  };

  RV.makeVideo = function (state, onProgress) {
    const type = RV.videoType();
    if (!type) return Promise.reject(new Error('This browser cannot record video.'));
    const c = full();
    const ctx = c.getContext('2d');
    RV.drawPoster(ctx, RV.W, RV.H, 0, state);
    const stream = c.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: type.mime, videoBitsPerSecond: 8000000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    return new Promise((resolve, reject) => {
      rec.onerror = () => reject(new Error('Recording failed.'));
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const base = type.mime.split(';')[0];
        resolve(new File([new Blob(chunks, { type: base })], 'simplefest-lineup.' + type.ext, { type: base }));
      };
      rec.start();
      const start = performance.now();
      (function frame() {
        const el = performance.now() - start;
        if (el >= RV.LOOP_MS) return rec.stop();
        RV.drawPoster(ctx, RV.W, RV.H, el / RV.LOOP_MS, state);
        if (onProgress) onProgress(el / RV.LOOP_MS);
        // setTimeout keeps recording going if the tab loses focus; requestAnimationFrame would stall.
        setTimeout(frame, 1000 / 30);
      })();
    });
  };

  RV.canShare = function (file) {
    try { return !!(navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { return false; }
  };

  RV.download = function (file) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };
})();
