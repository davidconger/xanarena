(function () {
  function config() {
    var c = window.XANARENA_VIDEO || {};
    return {
      src: (c.src || '').trim(),
      embed: (c.embed || '').trim(),
      poster: (c.poster || '').trim()
    };
  }

  // Mounts the configured video into `target`. Returns { mode, el } where mode is
  // "video", "embed" or "placeholder" (el is null for the placeholder).
  function mount(target, opts) {
    opts = opts || {};
    var c = config();

    if (c.src) {
      var video = document.createElement('video');
      video.src = c.src;
      video.preload = 'metadata';
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      if (c.poster) video.poster = c.poster;
      if (opts.controls !== false) video.controls = true;
      video.className = 'x-video';
      target.appendChild(video);
      return { mode: 'video', el: video };
    }

    if (c.embed) {
      var frame = document.createElement('iframe');
      frame.src = c.embed;
      frame.title = 'Xanarena: Exit Stage...House Left';
      frame.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      frame.allowFullscreen = true;
      frame.className = 'x-video';
      target.appendChild(frame);
      return { mode: 'embed', el: frame };
    }

    return { mode: 'placeholder', el: null };
  }

  function timecode(seconds) {
    seconds = Math.max(0, Math.floor(seconds || 0));
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = seconds % 60;
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  window.Xanarena = { config: config, mount: mount, timecode: timecode, reducedMotion: reducedMotion };
})();
