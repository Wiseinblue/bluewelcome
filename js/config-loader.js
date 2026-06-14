const REQUIRED_FIELDS = [
  'property.name',
  'property.city',
  'wifi.network',
  'wifi.password',
  'checkin.time',
  'checkout.time',
];

// Estrae lo slug dal percorso: dominio/villarosa → "villarosa".
// Ignora index.html, admin e percorsi vuoti.
// In locale (dove manca il rewrite Netlify /* → index.html) si può anche usare
// ?guide=calipso, così la guida ospite è testabile senza pubblicare.
function getSlugFromPath() {
  const qs = new URLSearchParams(window.location.search).get('guide')
    || new URLSearchParams(window.location.search).get('slug');
  if (qs) return qs.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || '';
  if (!last || last === 'index.html' || last === 'admin' || last === 'admin.html') return null;
  if (last.includes('.')) return null; // file (es. .html, .json)
  return last.toLowerCase();
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

function validateConfig(config) {
  for (const field of REQUIRED_FIELDS) {
    const value = getNestedValue(config, field);
    if (!value) return `Campo obbligatorio mancante: ${field}`;
  }
  if (!Array.isArray(config.contacts) || config.contacts.length === 0) {
    return 'Campo obbligatorio mancante: contacts';
  }
  return null;
}

function applyAccentColor(config) {
  const accent = config.property?.accent_color;
  if (accent) {
    document.documentElement.style.setProperty('--property-accent', accent);
  }
}

function showErrorPage(message) {
  document.body.innerHTML = `
    <div class="error-page">
      <svg class="error-page__icon" width="64" height="64" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <h1 class="error-page__title">${message.title}</h1>
      <p class="error-page__text">${message.text}</p>
    </div>
  `;
}

async function loadConfig() {
  let config = null;

  // Se l'admin ha salvato un preview config, usalo una volta sola
  const previewConfig = localStorage.getItem('bluewelcome_preview_config');
  if (previewConfig) {
    localStorage.removeItem('bluewelcome_preview_config');
    try {
      config = JSON.parse(previewConfig);
      localStorage.setItem('bluewelcome_config', previewConfig);
      const validationError = validateConfig(config);
      if (!validationError) {
        applyAccentColor(config);
        window.STAY_CONFIG = config;
        return config;
      }
    } catch { /* fallthrough */ }
  }

  // Prova a caricare la guida da Supabase in base allo slug nell'URL (es. /villarosa).
  // Se non c'è uno slug o il DB non risponde, ricade su config.json (demo).
  const slug = getSlugFromPath();
  if (slug && typeof BlueWelcomeDB !== 'undefined') {
    try {
      const row = await BlueWelcomeDB.getGuideBySlug(slug);
      if (row && row.config) {
        config = row.config;
        localStorage.setItem('bluewelcome_config', JSON.stringify(config));
        applyAccentColor(config);
        window.STAY_CONFIG = config;
        return config;
      }
    } catch { /* fallthrough a config.json */ }
  }

  try {
    const response = await fetch('config.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Network error');
    config = await response.json();
    localStorage.setItem('bluewelcome_config', JSON.stringify(config));
  } catch (fetchError) {
    const cached = localStorage.getItem('bluewelcome_config');
    if (cached) {
      try {
        config = JSON.parse(cached);
      } catch {
        showErrorPage({
          title: 'Guida non disponibile',
          text: 'Non è stato possibile caricare le informazioni. Controlla la connessione o contatta il proprietario.',
        });
        return null;
      }
    } else {
      showErrorPage({
        title: 'Guida non disponibile',
        text: 'Non è stato possibile caricare le informazioni. Controlla la connessione o contatta il proprietario.',
      });
      return null;
    }
  }

  const validationError = validateConfig(config);
  if (validationError) {
    showErrorPage({
      title: 'Errore di configurazione',
      text: 'Si è verificato un errore nel caricamento. Contatta il proprietario.',
    });
    return null;
  }

  applyAccentColor(config);
  window.STAY_CONFIG = config;
  return config;
}
