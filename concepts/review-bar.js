// Review-only concept switcher for the pages in concepts/. The live watch page (../../index.html,
// concept 1D) doesn't load it, so the published site stays clean.
(function () {
  var concepts = [
    { dir: 'concept-1-be-kind-rewind', name: 'Be Kind, Rewind', label: '1' },
    { dir: 'concept-1b-viewer-beware', name: 'Viewer Beware', label: '1B' },
    { dir: 'concept-1c-deep-cuts', name: 'Deep Cuts', label: '1C' },
    { dir: 'concept-1d-youtube', name: 'Be Kind, Rewind (YouTube)', label: '1D', href: '../../index.html' },
    { dir: 'concept-2-midnight-rental', name: 'Midnight Rental', label: '2' },
    { dir: 'concept-3-house-left', name: 'House Left', label: '3' }
  ];
  var path = location.pathname.replace(/\\/g, '/');
  var current = concepts.findIndex(function (c) { return path.indexOf('/' + c.dir + '/') !== -1; });
  if (current < 0) return;

  var bar = document.createElement('nav');
  bar.setAttribute('aria-label', 'Design concepts');
  bar.innerHTML =
    '<a class="xrb-all" href="../index.html">All concepts</a>' +
    concepts.map(function (c, i) {
      var href = c.href || '../' + c.dir + '/index.html';
      return '<a href="' + href + '"' + (i === current ? ' aria-current="page"' : '') +
        ' title="' + c.name + '">' + c.label + '</a>';
    }).join('') +
    '<span class="xrb-name">' + concepts[current].name + '</span>';

  var css = document.createElement('style');
  css.textContent =
    '.xrb{position:fixed;left:12px;bottom:12px;z-index:9999;display:flex;align-items:center;gap:4px;padding:5px;' +
    'border-radius:999px;background:rgba(10,12,11,.88);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);' +
    'font:600 12px/1 system-ui,sans-serif;color:#cfd8d0;box-shadow:0 8px 24px rgba(0,0,0,.5)}' +
    '.xrb a{color:inherit;text-decoration:none;padding:7px 10px;border-radius:999px}' +
    '.xrb a:hover{background:rgba(255,255,255,.08)}' +
    '.xrb a[aria-current]{background:#5ee04a;color:#041006}' +
    '.xrb-name{padding:0 10px 0 6px;opacity:.75}' +
    '@media (max-width:600px){body{padding-bottom:64px}' +
    '.xrb{left:8px;right:8px;bottom:8px;justify-content:space-between;gap:2px}' +
    '.xrb a{display:flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:0 8px}' +
    '.xrb-name{display:none}}';
  bar.className = 'xrb';
  document.head.appendChild(css);
  document.body.appendChild(bar);
})();
