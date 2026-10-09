(function () {
  var X = window.Xanarena;
  var screen = document.querySelector('[data-screen]');
  if (!screen) return;

  var mounted = X.mount(screen.querySelector('[data-media]'));
  screen.dataset.mode = mounted.mode;
  if (mounted.mode !== 'placeholder') return;

  var btn = screen.querySelector('[data-play]');
  var msg = screen.querySelector('[data-msg]');
  var lines = [
    'Patience, Dreamer. The tape is still rewinding.',
    'The crows have the map. They are on their way.',
    'Still brewing the coffee. Check back soon.',
    'Not yet, Misfit. Not yet.'
  ];
  var i = 0;
  var resetTimer;

  btn.addEventListener('click', function () {
    msg.textContent = lines[i % lines.length];
    i++;
    msg.classList.remove('is-scare');
    void msg.offsetWidth;
    msg.classList.add('is-scare');
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () {
      msg.classList.remove('is-scare');
      msg.textContent = 'Now showing. Very soon.';
    }, 6000);
  });
})();
