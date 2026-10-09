(function () {
  var X = window.Xanarena;
  var root = document.querySelector('[data-player]');
  if (!root) return;

  var screen = root.querySelector('[data-screen]');
  var media = root.querySelector('[data-media]');
  var noise = root.querySelector('[data-noise]');
  var vcr = root.querySelector('.vcr');
  var osdMain = root.querySelector('[data-osd-main]');
  var osdSub = root.querySelector('[data-osd-sub]');
  var osdCounter = root.querySelector('[data-osd-counter]');
  var osdSp = root.querySelector('.osd__sp');
  var announce = root.querySelector('[data-announce]');
  var lcdMode = root.querySelector('[data-lcd-mode]');
  var lcdCounter = root.querySelector('[data-lcd-counter]');
  var progress = root.querySelector('[data-progress]');
  var slides = {};
  root.querySelectorAll('[data-slide]').forEach(function (el) { slides[el.dataset.slide] = el; });

  var reduced = X.reducedMotion();
  var mounted = X.mount(media, { controls: false });
  var mode = mounted.mode;
  var video = mode === 'video' ? mounted.el : null;
  root.dataset.mode = mode;

  var ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 5v14l12-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>',
    rew: '<svg viewBox="0 0 24 24"><path d="M11 6v12L2 12zM21 6v12l-9-6z"/></svg>',
    ff: '<svg viewBox="0 0 24 24"><path d="M3 6v12l9-6zM13 6v12l9-6z"/></svg>',
    eject: '<svg viewBox="0 0 24 24"><path d="M12 5l8 9H4zM4 16h16v3H4z"/></svg>'
  };

  /* ---------- on-screen display ---------- */

  var timers = {};
  function flash(el, html, ms, key) {
    clearTimeout(timers[key]);
    el.innerHTML = html;
    el.classList.add('is-on');
    if (ms) timers[key] = setTimeout(function () { el.classList.remove('is-on'); }, ms);
  }

  function osd(label, icon, sub, ms) {
    var html = icon && ICON[icon] ? (icon === 'rew' ? ICON[icon] + label : label + ICON[icon]) : label;
    flash(osdMain, html, ms === undefined ? 2200 : ms, 'main');
    osdSp.classList.add('is-on');
    clearTimeout(timers.sp);
    if (ms !== 0) timers.sp = setTimeout(function () { osdSp.classList.remove('is-on'); }, ms || 2200);
    if (sub) {
      flash(osdSub, sub, 3600, 'sub');
      announce.textContent = sub;
    } else {
      osdSub.classList.remove('is-on');
    }
  }

  function setLcd(text) { lcdMode.textContent = text; }

  /* ---------- tracking + FX ---------- */

  var tracking = 1;
  function setTracking(delta) {
    tracking = Math.max(-3, Math.min(3, tracking + delta));
    root.style.setProperty('--d', Math.abs(tracking));
    var bar = '';
    for (var i = -3; i <= 3; i++) bar += i === tracking ? '&#9608;' : '&#9601;';
    var lost = Math.abs(tracking) === 3;
    osd('Tracking <span class="osd__bar">' + bar + '</span>', null, lost ? 'Down the tubes tour.' : null, 1800);
    if (!lost) announce.textContent = 'Tracking ' + tracking;
  }
  root.style.setProperty('--d', Math.abs(tracking));

  /* ---------- deep cuts: counter, YYZ light, captions, codes ---------- */

  var DEEP_CUT = 21 * 60 + 12;
  var counterNow = 0;
  var rollFrame;
  function rollCounter(target, ms) {
    cancelAnimationFrame(rollFrame);
    var from = counterNow;
    if (reduced || !ms) {
      counterNow = target;
      lcdCounter.textContent = X.timecode(target);
      return;
    }
    var start = performance.now();
    function step(t) {
      var k = Math.min(1, (t - start) / ms);
      var eased = 1 - Math.pow(1 - k, 3);
      counterNow = Math.round(from + (target - from) * eased);
      lcdCounter.textContent = X.timecode(counterNow);
      if (k < 1) rollFrame = requestAnimationFrame(step);
    }
    rollFrame = requestAnimationFrame(step);
  }

  // Y Y Z in Morse: -.-- -.-- --..
  var led = root.querySelector('[data-led]');
  var MORSE = '-.-- -.-- --..';
  var ledTimer;
  function blinkMorse(unit, pauseAfter, beep) {
    clearTimeout(ledTimer);
    if (!led) return;
    var steps = [];
    MORSE.split(' ').forEach(function (letter, li) {
      if (li) steps.push([false, unit * 3]);
      letter.split('').forEach(function (sym, si) {
        if (si) steps.push([false, unit]);
        steps.push([true, sym === '-' ? unit * 3 : unit]);
      });
    });
    steps.push([false, pauseAfter]);
    var i = 0;
    (function next() {
      var s = steps[i];
      led.classList.toggle('is-off', !s[0]);
      if (s[0] && beep) beep(s[1]);
      ledTimer = setTimeout(function () {
        i++;
        if (i < steps.length) next();
        else if (!beep) { i = 0; next(); }
        else ambientMorse();
      }, s[1]);
    })();
  }
  function ambientMorse() {
    if (reduced) { if (led) led.classList.remove('is-off'); return; }
    blinkMorse(150, 4200);
  }

  var audioCtx;
  function tone(ms) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      var t = audioCtx.currentTime;
      o.frequency.value = 784;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.08, t + .01);
      g.gain.setValueAtTime(.08, t + ms / 1000 - .01);
      g.gain.linearRampToValueAtTime(0, t + ms / 1000);
      o.connect(g).connect(audioCtx.destination);
      o.start(t);
      o.stop(t + ms / 1000 + .02);
    } catch (err) { /* no audio, no problem */ }
  }

  var CC = ['Off', 'English', 'Canadian', 'Troll', 'Blah blah blah'];
  var ccIndex = 0;
  function cycleCaptions(btn) {
    ccIndex = (ccIndex + 1) % CC.length;
    var label = CC[ccIndex];
    btn.setAttribute('aria-pressed', String(ccIndex !== 0));
    osd('CC ' + label, null, label === 'Blah blah blah' ? 'Blah blah blah. Blah blah blah blah blah.' : null, 1800);
    announce.textContent = 'Captions: ' + label;
  }

  var typed = '';
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (/yyz$/.test(typed)) {
      typed = '';
      osd('Y Y Z', null, '-.--&nbsp; -.--&nbsp; --..', 3200);
      announce.textContent = 'Y Y Z, in Morse code.';
      blinkMorse(110, 1600, tone);
    } else if (typed === '2112') {
      typed = '';
      glitch();
      rollCounter(DEEP_CUT, 1400);
      osd('Overture', null, 'The temples have been notified.', 3200);
    }
  });

  /* ---------- static ---------- */

  var noiseRunning = false;
  var noiseFrame = 0;
  function drawNoise(ctx, img) {
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      d[i] = v * .55;
      d[i + 1] = v * .85;
      d[i + 2] = v * .6;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function startNoise() {
    if (mode !== 'placeholder' || !noise) return;
    noise.width = 192;
    noise.height = 108;
    var ctx = noise.getContext('2d');
    var img = ctx.createImageData(noise.width, noise.height);
    drawNoise(ctx, img);
    if (reduced) return;
    var last = 0;
    function loop(t) {
      if (!noiseRunning) return;
      if (t - last > 55) { last = t; drawNoise(ctx, img); }
      noiseFrame = requestAnimationFrame(loop);
    }
    var io = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !noiseRunning) { noiseRunning = true; noiseFrame = requestAnimationFrame(loop); }
      if (!visible) { noiseRunning = false; cancelAnimationFrame(noiseFrame); }
    });
    io.observe(screen);
  }

  /* ---------- placeholder pre-roll ---------- */

  var reel = [['logo', 3500], ['night', 8200], ['beware', 11000]];
  var reelIndex = 0;
  var reelTimer;

  function showSlide(name) {
    Object.keys(slides).forEach(function (k) { slides[k].classList.toggle('is-active', k === name); });
  }

  function runReel() {
    clearTimeout(reelTimer);
    var step = reel[reelIndex];
    showSlide(step[0]);
    reelTimer = setTimeout(function () {
      reelIndex = (reelIndex + 1) % reel.length;
      runReel();
    }, step[1]);
  }

  function holdSlide(name, ms, resumeAt) {
    clearTimeout(reelTimer);
    showSlide(name);
    reelTimer = setTimeout(function () {
      reelIndex = resumeAt;
      runReel();
    }, ms);
  }

  function glitch() {
    if (reduced) return;
    root.style.setProperty('--d', 3);
    setTimeout(function () { root.style.setProperty('--d', Math.abs(tracking)); }, 450);
  }

  var placeholderActions = {
    play: function () {
      vcr.classList.add('is-loading');
      setTimeout(function () { vcr.classList.remove('is-loading'); }, 700);
      glitch();
      setLcd('PLAY');
      osd('Play', 'play', null, 1600);
      setTimeout(function () {
        setLcd('NO TAPE');
        holdSlide('notape', 6000, 2);
        announce.textContent = 'No tape. Viewer beware. The crows still have it. Check back soon.';
      }, 900);
    },
    pause: function () { setLcd('PAUSE'); osd('Time stand still', 'pause', 'Nothing to pause. Yet.'); },
    stop: function () { setLcd('STOP'); osd('Stop', 'stop'); rollCounter(DEEP_CUT, 1200); reelIndex = 0; runReel(); },
    rew: function () { setLcd('REW'); glitch(); rollCounter(0, 900); osd('Rew', 'rew', 'Be kind. Rewind.'); },
    ff: function () { setLcd('FF'); glitch(); rollCounter(DEEP_CUT, 900); osd('Fly by night', 'ff', "No skipping. It gets scarier."); },
    eject: function () {
      vcr.classList.add('is-loading');
      setTimeout(function () { vcr.classList.remove('is-loading'); }, 900);
      setLcd('EJECT');
      osd('Eject', 'eject', 'Exiting stage...house left.');
    }
  };

  /* ---------- real video ---------- */

  function toggle() { if (video.paused || video.ended) video.play(); else video.pause(); }

  var videoActions = {
    play: function () { video.play(); },
    pause: function () { video.pause(); },
    stop: function () { video.pause(); video.currentTime = 0; setLcd('STOP'); osd('Stop', 'stop'); },
    rew: function () { video.currentTime = Math.max(0, video.currentTime - 10); osd('Rew', 'rew', null, 1200); glitch(); },
    ff: function () { video.currentTime = Math.min(video.duration || 0, video.currentTime + 10); osd('Fly by night', 'ff', null, 1200); glitch(); },
    eject: function () {
      video.pause();
      video.currentTime = 0;
      if (document.fullscreenElement) document.exitFullscreen();
      setLcd('EJECT');
      osd('Eject', 'eject', 'Exiting stage...house left.');
    },
    mute: function (btn) {
      video.muted = !video.muted;
      btn.setAttribute('aria-pressed', String(video.muted));
      osd(video.muted ? 'Mute' : 'Sound on', null, null, 1400);
    },
    full: function () {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (screen.requestFullscreen) screen.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    }
  };

  function wireVideo() {
    var playBtn = root.querySelector('[data-action="play"]');
    function updateTime() {
      var tc = X.timecode(video.currentTime);
      lcdCounter.textContent = tc;
      osdCounter.textContent = tc;
      if (video.duration) progress.value = Math.round(video.currentTime / video.duration * 1000);
    }
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateTime);
    video.addEventListener('play', function () {
      setLcd('PLAY');
      playBtn.classList.add('is-lit');
      osd('Play', 'play', null, 2200);
      osdCounter.classList.remove('is-on');
    });
    video.addEventListener('pause', function () {
      playBtn.classList.remove('is-lit');
      if (video.ended) return;
      setLcd('PAUSE');
      osd('Time stand still', 'pause', null, 0);
      osdCounter.classList.add('is-on');
    });
    video.addEventListener('ended', function () {
      setLcd('STOP');
      osd('Stop', 'stop', 'Be kind. Rewind.', 4000);
    });
    progress.addEventListener('input', function () {
      if (video.duration) video.currentTime = progress.value / 1000 * video.duration;
    });
    screen.setAttribute('tabindex', '0');
    screen.setAttribute('role', 'button');
    screen.setAttribute('aria-label', 'Play or pause');
    screen.addEventListener('click', toggle);
    screen.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'k') { e.preventDefault(); toggle(); }
    });
    document.addEventListener('fullscreenchange', function () {
      video.controls = document.fullscreenElement === screen;
    });
  }

  /* ---------- controls ---------- */

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.dataset.action;

    if (action === 'track-up') return setTracking(1);
    if (action === 'track-down') return setTracking(-1);
    if (action === 'cc') return cycleCaptions(btn);
    if (action === 'fx') {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      document.body.dataset.fx = on ? 'on' : 'off';
      osd(on ? 'VHS FX on' : 'VHS FX off', null, null, 1400);
      return;
    }

    var table = mode === 'video' ? videoActions : mode === 'placeholder' ? placeholderActions : null;
    if (table && table[action]) table[action](btn);
  });

  /* ---------- boot ---------- */

  ambientMorse();

  if (mode === 'placeholder') {
    startNoise();
    runReel();
    setTimeout(function () { rollCounter(DEEP_CUT, 2600); }, 900);
  } else if (mode === 'video') {
    wireVideo();
  } else {
    setLcd('LINE');
  }
})();
