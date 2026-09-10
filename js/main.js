(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var stored = null;
  try { stored = localStorage.getItem('polinom-theme'); } catch (e) {}
  if (stored === 'light' || stored === 'dark') {
    root.setAttribute('data-theme', stored);
  }
  toggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    var isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('polinom-theme', next); } catch (e) {}
  });
})();
