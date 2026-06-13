/* ───────────────────────────────────────────────
   BlueWelcome — Dark / Light theme
   Usato da guida ospite e admin.
   - La prima volta segue l'impostazione del dispositivo (prefers-color-scheme)
   - Poi ricorda la scelta dell'utente in localStorage
   - Toggle: elemento con id="theme-toggle"
─────────────────────────────────────────────── */

(function () {
  const STORAGE_KEY = 'bluewelcome_theme';

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function currentTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Applica subito (prima del paint) per evitare il "lampo" di tema sbagliato
  applyTheme(currentTheme());

  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }

  function toggleTheme() {
    const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(now);
  }

  // Collega il toggle quando il DOM è pronto
  function wireToggle() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireToggle);
  } else {
    wireToggle();
  }

  // Se l'utente non ha mai scelto, segue i cambi di tema del sistema in tempo reale
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  window.BlueWelcomeTheme = { setTheme, toggleTheme, currentTheme };
})();
