(function () {
  var X = window.Xanarena;
  var body = document.body;

  /* ---------- crowd with lighters ---------- */

  function buildCrowd(el) {
    var W = 1600, H = 200;
    var rand = mulberry32(2112);
    var people = '';
    var flames = '';
    var x = -10;
    while (x < W + 20) {
      var r = 11 + rand() * 6;
      var baseY = 120 + rand() * 30;
      people += circle(x, baseY - r * 1.4, r);
      people += '<path d="M' + (x - r * 2.2) + ' ' + H + 'V' + (baseY + r * .6) + 'Q' + x + ' ' + (baseY - r * 1.2) + ' ' + (x + r * 2.2) + ' ' + (baseY + r * .6) + 'V' + H + 'z"/>';
      if (rand() < .22) {
        var side = rand() < .5 ? -1 : 1;
        var hx = x + side * (r * 1.2 + rand() * 10);
        var hy = baseY - 70 - rand() * 35;
        people += '<path d="M' + (x + side * r * 1.1) + ' ' + (baseY - r * .2) + 'L' + hx + ' ' + hy + '" stroke="#000" stroke-width="7" stroke-linecap="round"/>';
        people += '<rect x="' + (hx - 4) + '" y="' + (hy - 12) + '" width="8" height="14" rx="3"/>';
        flames += '<path class="flame" style="animation-delay:-' + (rand() * 1.3).toFixed(2) + 's" d="M' + hx + ' ' + (hy - 30) + 'C' + (hx + 6) + ' ' + (hy - 20) + ' ' + (hx + 5) + ' ' + (hy - 13) + ' ' + hx + ' ' + (hy - 12) + 'C' + (hx - 5) + ' ' + (hy - 13) + ' ' + (hx - 6) + ' ' + (hy - 20) + ' ' + hx + ' ' + (hy - 30) + 'z"/>';
      }
      x += r * 2.3 + rand() * 12;
    }
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice"><g class="people">' + people + '</g>' + flames + '</svg>';
  }

  function circle(cx, cy, r) { return '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(1) + '"/>'; }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var crowd = document.querySelector('[data-crowd]');
  if (crowd) buildCrowd(crowd);

  /* ---------- screen ---------- */

  var screen = document.querySelector('[data-screen]');
  if (!screen) return;
  var mounted = X.mount(screen.querySelector('[data-media]'));
  screen.dataset.mode = mounted.mode;

  if (mounted.mode === 'video') {
    var v = mounted.el;
    v.addEventListener('play', function () { body.classList.add('lights-down'); });
    v.addEventListener('pause', function () { body.classList.remove('lights-down'); });
    v.addEventListener('ended', function () { body.classList.remove('lights-down'); });
    return;
  }

  if (mounted.mode !== 'placeholder') return;

  var btn = screen.querySelector('[data-play]');
  var msg = screen.querySelector('[data-msg]');
  var busy = false;
  btn.addEventListener('click', function () {
    if (busy) return;
    busy = true;
    body.classList.add('lights-down');
    msg.textContent = 'Places, please...';
    setTimeout(function () {
      body.classList.remove('lights-down');
      msg.textContent = 'False alarm. The band is still backstage.';
    }, X.reducedMotion() ? 400 : 2400);
    setTimeout(function () {
      msg.textContent = 'will begin shortly';
      busy = false;
    }, 7000);
  });
})();
