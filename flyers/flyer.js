(function () {
  var cfg = window.XANARENA_FLYER || {};
  var url = cfg.url || '';
  var display = cfg.display || url.replace(/^https?:\/\//, '');

  function qrSvg(text, quiet, color) {
    var qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount();
    var size = n + quiet * 2;
    var d = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h1v1h-1z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges" role="img" aria-label="QR code: ' + display + '">' +
      '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path fill="' + color + '" d="' + d + '"/></svg>';
  }

  document.querySelectorAll('[data-qr]').forEach(function (el) {
    el.innerHTML = qrSvg(url, +(el.dataset.quiet || 4), el.dataset.color || '#000');
  });
  document.querySelectorAll('[data-url]').forEach(function (el) { el.textContent = display; });

  // Thumbnail mode for the flyers gallery: show just the sheet.
  var embedded = window.self !== window.top;
  if (embedded) document.documentElement.classList.add('is-embedded');

  if (/example\.com/.test(url) && !embedded) {
    var badge = document.createElement('p');
    badge.className = 'draft-badge';
    badge.textContent = 'Draft: QR points to a placeholder. Set the real URL in flyers/flyer-config.js';
    document.body.appendChild(badge);
  }
})();
