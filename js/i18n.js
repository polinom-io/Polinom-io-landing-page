(function () {
  var SUPPORTED = ['en', 'es'];
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'polinom-lang';
  var FLAGS = { en: '🇺🇸', es: '🇪🇸' };

  function detectInitialLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    var browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(browserLang) !== -1 ? browserLang : DEFAULT_LANG;
  }

  function applyStrings(strings, lang) {
    document.documentElement.setAttribute('lang', lang);

    if (strings['meta.title']) document.title = strings['meta.title'];
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && strings['meta.description']) {
      metaDesc.setAttribute('content', strings['meta.description']);
    }

    var textNodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < textNodes.length; i++) {
      var key = textNodes[i].getAttribute('data-i18n');
      if (strings[key] !== undefined) textNodes[i].textContent = strings[key];
    }

    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlNodes.length; j++) {
      var htmlKey = htmlNodes[j].getAttribute('data-i18n-html');
      if (strings[htmlKey] !== undefined) htmlNodes[j].innerHTML = strings[htmlKey];
    }

    var ariaNodes = document.querySelectorAll('[data-i18n-aria]');
    for (var k = 0; k < ariaNodes.length; k++) {
      var ariaKey = ariaNodes[k].getAttribute('data-i18n-aria');
      if (strings[ariaKey] !== undefined) ariaNodes[k].setAttribute('aria-label', strings[ariaKey]);
    }

    var langToggle = document.getElementById('langToggle');
    if (langToggle) {
      var otherLang = lang === 'en' ? 'es' : 'en';
      langToggle.innerHTML = '<span class="lang-flag" aria-hidden="true">' + FLAGS[otherLang] + '</span>' + otherLang.toUpperCase();
      langToggle.setAttribute('data-current-lang', lang);
      if (strings['lang.toggleLabel']) {
        langToggle.setAttribute('aria-label', strings['lang.toggleLabel']);
      }
    }
  }

  function loadLang(lang) {
    return fetch('locales/' + lang + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load locale "' + lang + '": ' + res.status);
        return res.json();
      })
      .then(function (strings) {
        applyStrings(strings, lang);
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadLang(detectInitialLang());

    var langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.addEventListener('click', function () {
        var current = langToggle.getAttribute('data-current-lang') || DEFAULT_LANG;
        loadLang(current === 'en' ? 'es' : 'en');
      });
    }
  });
})();
