function navigateTo(tabId, subTabId = null) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-bar__item').forEach(btn => btn.classList.remove('active'));
  // Spegne TUTTE le sub-section di TUTTE le sezioni, così non restano attive
  // sub-section di altre tab (es. sub-about mentre vai su Nearby).
  document.querySelectorAll('.sub-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sub-tab-bar__item').forEach(btn => btn.classList.remove('active'));

  const section = document.getElementById(`section-${tabId}`);
  if (section) section.classList.add('active');

  const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (tabBtn) tabBtn.classList.add('active');

  sessionStorage.setItem('bluewelcome_tab', tabId);

  // Se la sezione ha sub-tab e non è stata richiesta una sub specifica,
  // attiva la prima sub-tab visibile (non nascosta).
  if (section && section.querySelector('.sub-tab-bar')) {
    let target = subTabId;
    if (!target) {
      const firstBtn = section.querySelector('.sub-tab-bar__item:not(.hidden)');
      target = firstBtn ? firstBtn.dataset.subtab : null;
    }
    if (target) navigateSubTab(tabId, target);
  } else if (subTabId) {
    navigateSubTab(tabId, subTabId);
  }

  // Torna in cima al cambio tab principale
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function navigateSubTab(tabId, subTabId) {
  const section = document.getElementById(`section-${tabId}`);
  if (!section) return;

  section.querySelectorAll('.sub-section').forEach(s => s.classList.remove('active'));
  section.querySelectorAll('.sub-tab-bar__item').forEach(btn => btn.classList.remove('active'));

  const subSection = document.getElementById(`sub-${subTabId}`);
  if (subSection) subSection.classList.add('active');

  const subBtn = section.querySelector(`[data-subtab="${subTabId}"]`);
  if (subBtn) subBtn.classList.add('active');

  sessionStorage.setItem(`bluewelcome_subtab_${tabId}`, subTabId);

  if (subTabId === 'map') renderMapSection(window.STAY_CONFIG);
}

function initNavigation() {
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn && tabBtn.closest('.tab-bar')) {
      const tabId = tabBtn.dataset.tab;
      const savedSubTab = sessionStorage.getItem(`bluewelcome_subtab_${tabId}`);
      navigateTo(tabId, savedSubTab || null);
      return;
    }

    const subTabBtn = e.target.closest('[data-subtab]');
    if (subTabBtn && subTabBtn.closest('.sub-tab-bar')) {
      const subTabId = subTabBtn.dataset.subtab;
      const parentSection = subTabBtn.closest('.section');
      const tabId = parentSection?.id?.replace('section-', '');
      if (tabId) navigateSubTab(tabId, subTabId);
      return;
    }

    const gotoBtn = e.target.closest('[data-goto-tab]');
    if (gotoBtn) {
      navigateTo(gotoBtn.dataset.gotoTab, gotoBtn.dataset.gotoSubtab || null);
      return;
    }
  });
}

function initCopyWifi(config) {
  document.addEventListener('click', async (e) => {
    if (!e.target.closest('#btn-copy-wifi')) return;
    try {
      await navigator.clipboard.writeText(config.wifi.password);
      const btn = document.getElementById('btn-copy-wifi');
      const span = btn?.querySelector('span');
      if (!span) return;
      const original = span.textContent;
      span.textContent = t('passwordCopied');
      setTimeout(() => { span.textContent = original; }, 2000);
    } catch {
      // clipboard not available
    }
  });
}

function initLangSwitcher() {
  const btn = document.getElementById('lang-switcher-btn');
  const dropdown = document.getElementById('lang-switcher-dropdown');
  if (!btn || !dropdown) return;

  // Riempie le bandierine SVG nelle opzioni del dropdown
  if (typeof flagSVG === 'function') {
    dropdown.querySelectorAll('.lang-flag[data-flag]').forEach(span => {
      span.innerHTML = flagSVG(span.dataset.flag);
    });
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => dropdown.classList.add('hidden'));

  dropdown.querySelectorAll('[data-lang]').forEach(opt => {
    opt.addEventListener('click', () => {
      setLang(opt.dataset.lang);
      dropdown.classList.add('hidden');
      updateLangSwitcherUI();
    });
  });
}

function updateLangSwitcherUI() {
  const current = getCurrentLang();
  const btn = document.getElementById('lang-switcher-btn');
  if (btn) {
    const langData = SUPPORTED_LANGUAGES.find(l => l.code === current);
    const span = btn.querySelector('span');
    if (span && langData) {
      const flag = (typeof flagSVG === 'function') ? flagSVG(current) + ' ' : '';
      span.innerHTML = flag + langData.code.toUpperCase();
    }
  }
  document.querySelectorAll('[data-lang]').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === current);
  });
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  updateLangSwitcherUI();
  if (window.STAY_CONFIG) renderAll(window.STAY_CONFIG);
}

window.applyTranslations = applyTranslations;

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            document.getElementById('update-banner')?.classList.remove('hidden');
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}

function initUpdateBanner() {
  document.getElementById('btn-reload')?.addEventListener('click', () => window.location.reload());
}

// Riordina le voci della bottom bar secondo config.tab_order (se presente).
// tab_order è un array di data-tab, es. ["home","nearby","info","contacts","faq"].
function applyTabOrder(config) {
  const order = config.tab_order;
  if (!Array.isArray(order) || !order.length) return;
  const bar = document.querySelector('.tab-bar');
  if (!bar) return;
  order.forEach(tabName => {
    const item = bar.querySelector(`.tab-bar__item[data-tab="${tabName}"]`);
    if (item) bar.appendChild(item); // appendChild sposta in coda → ricostruisce l'ordine
  });
}

async function init() {
  const config = await loadConfig();
  if (!config) return;

  renderAll(config);
  applyTabOrder(config);
  applyTranslations();
  initNavigation();
  initCopyWifi(config);
  initQR(config);
  initLangSwitcher();
  initUpdateBanner();
  updateLangSwitcherUI();

  const savedTab = sessionStorage.getItem('bluewelcome_tab') || 'home';
  let savedSubTab = sessionStorage.getItem(`bluewelcome_subtab_${savedTab}`);
  if (savedSubTab && !document.getElementById(`sub-${savedSubTab}`)) savedSubTab = null;
  navigateTo(savedTab, savedSubTab);

  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
