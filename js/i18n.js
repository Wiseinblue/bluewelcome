const UI_STRINGS = {
  it: {
    home: 'Home',
    info: 'Info Casa',
    contacts: 'Contatti',
    nearby: 'Esplora',
    faq: 'FAQ',
    about: 'La Casa',
    wifi: 'Wi-Fi',
    checkin: 'Check-in',
    checkout: 'Check-out',
    rules: 'Regole',
    map: 'Mappa',
    restaurants: 'Ristoranti',
    attractions: 'Attrazioni',
    transport: 'Trasporti',
    call: 'Chiama',
    whatsapp: 'Scrivi su WhatsApp',
    copyPassword: 'Copia password',
    showQR: 'Mostra QR',
    scanToConnect: 'Inquadra per connetterti',
    poweredBy: 'Powered by Wise in Blue',
    owner: 'Proprietario',
    emergency: 'Emergenze',
    medical: 'Medico',
    openMaps: 'Apri su Google Maps',
    mapUnavailable: 'Mappa non disponibile offline',
    mapUnavailableText: "La mappa non è disponibile senza connessione. Ecco l'indirizzo:",
    updateAvailable: 'Aggiornamento disponibile',
    reload: 'Ricarica',
    passwordCopied: 'Copiata!',
    earlyCheckin: 'Check-in anticipato',
    lateCheckout: 'Check-out posticipato',
    howToFindUs: 'Come raggiungerci',
    discoverArea: 'Scopri la zona',
    areaGuide: 'Guida zona',
  },
  en: {
    home: 'Home',
    info: 'House Info',
    contacts: 'Contacts',
    nearby: 'Explore',
    faq: 'FAQ',
    about: 'About',
    wifi: 'Wi-Fi',
    checkin: 'Check-in',
    checkout: 'Check-out',
    rules: 'Rules',
    map: 'Map',
    restaurants: 'Restaurants',
    attractions: 'Attractions',
    transport: 'Transport',
    call: 'Call',
    whatsapp: 'WhatsApp',
    copyPassword: 'Copy password',
    showQR: 'Show QR',
    scanToConnect: 'Scan to connect',
    poweredBy: 'Powered by Wise in Blue',
    owner: 'Owner',
    emergency: 'Emergency',
    medical: 'Medical',
    openMaps: 'Open in Google Maps',
    mapUnavailable: 'Map not available offline',
    mapUnavailableText: 'The map is not available without a connection. Here is the address:',
    updateAvailable: 'Update available',
    reload: 'Reload',
    passwordCopied: 'Copied!',
    earlyCheckin: 'Early check-in',
    lateCheckout: 'Late check-out',
    howToFindUs: 'How to find us',
    discoverArea: 'Discover the area',
    areaGuide: 'Area guide',
  },
};

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

const DEFAULT_LANG = 'en';

function getCurrentLang() {
  const saved = localStorage.getItem('bluewelcome_lang');
  if (saved && UI_STRINGS[saved]) return saved;
  const configLang = window.STAY_CONFIG?.property?.language;
  if (configLang && UI_STRINGS[configLang]) return configLang;
  return DEFAULT_LANG;
}

function setLang(code) {
  if (!UI_STRINGS[code]) return;
  localStorage.setItem('bluewelcome_lang', code);
  if (window.applyTranslations) window.applyTranslations();
}

function t(key) {
  const lang = getCurrentLang();
  return (UI_STRINGS[lang] && UI_STRINGS[lang][key]) || UI_STRINGS[DEFAULT_LANG][key] || key;
}
