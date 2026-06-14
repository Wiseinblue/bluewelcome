// ─── State ────────────────────────────────────────────────────────────────────

let currentConfig = null;
let savedConfig = null;
let currentGuideId = null;   // id della guida nel DB (Supabase)
let currentGuideSlug = null; // slug nell'URL

// ─── LOGIN (email + password, Supabase) ─────────────────────────────────────────

function initPin() {
  const emailInput = document.getElementById('login-email');
  const pwInput = document.getElementById('login-password');
  const submit = document.getElementById('pin-submit');
  const errEl = document.getElementById('pin-error');

  async function attemptLogin() {
    const email = emailInput.value.trim();
    const password = pwInput.value;
    if (!email || !password) { showErr(at('loginError')); return; }

    submit.disabled = true;
    const { error } = await BlueWelcomeDB.signIn(email, password);
    submit.disabled = false;

    if (error) {
      showErr(at('loginError'));
      pwInput.value = '';
      return;
    }
    await enterAdmin();
  }

  function showErr(msg) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }

  submit.addEventListener('click', attemptLogin);
  [emailInput, pwInput].forEach(inp => inp.addEventListener('keydown', (e) => {
    errEl.classList.add('hidden');
    if (e.key === 'Enter') attemptLogin();
  }));
}

// Entra nel pannello: carica la guida del proprietario dal DB e popola il form.
async function enterAdmin() {
  await loadGuideFromDB();
  document.getElementById('pin-screen').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
  populateForm(currentConfig);
  updateQRPreview();
}

// ─── Caricamento guida dal database ─────────────────────────────────────────────

async function loadGuideFromDB() {
  const guide = await BlueWelcomeDB.getMyGuide();
  if (guide) {
    currentGuideId = guide.id;
    currentGuideSlug = guide.slug;
    currentConfig = JSON.parse(JSON.stringify(guide.config || {}));
    savedConfig = JSON.parse(JSON.stringify(currentConfig));
  } else {
    // Proprietario senza guida ancora: parte da una vuota (verrà creata al primo salvataggio)
    currentGuideId = null;
    currentGuideSlug = null;
    currentConfig = getEmptyConfig();
    savedConfig = getEmptyConfig();
  }
}

// Mantengo il vecchio nome per compatibilità con init(): ora non fa il fetch del file.
async function loadAdminConfig() {
  // Il caricamento vero avviene dopo il login, in loadGuideFromDB().
  currentConfig = getEmptyConfig();
  savedConfig = getEmptyConfig();
}

function getEmptyConfig() {
  return {
    property: { name: '', city: '', address: '', photo: '', greeting: '', accent_color: '#1a56db', logo: '', language: 'en', about: [] },
    wifi: { network: '', password: '', notes: '' },
    checkin: { time: '', early_checkin: '', instructions: [] },
    checkout: { time: '', late_checkout: '', instructions: [] },
    rules: [],
    contacts: [],
    map: { google_maps_url: '', embed_url: '', walking_notes: '', directions_photos: [] },
    restaurants: [],
    attractions: [],
    transport: { parking: '', bus: '', taxi: '', train: '', airport: '' },
    faq: [],
    sections: { about: true, rules: true, restaurants: true, attractions: true, transport: true, faq: true },
    external_links: { restaurants: '', attractions: '' },
    tab_order: ['home', 'info', 'contacts', 'nearby', 'faq'],
    admin_pin: '1234'
  };
}

function getSections() {
  return {
    about:       document.getElementById('toggle-about').checked,
    rules:       document.getElementById('toggle-rules').checked,
    restaurants: document.getElementById('toggle-restaurants').checked,
    attractions: document.getElementById('toggle-attractions').checked,
    transport:   document.getElementById('toggle-transport').checked,
    faq:         document.getElementById('toggle-faq').checked,
  };
}

function populateSections(sections = {}) {
  const defaults = { about: true, rules: true, restaurants: true, attractions: true, transport: true, faq: true };
  const s = { ...defaults, ...sections };
  document.getElementById('toggle-about').checked       = s.about;
  document.getElementById('toggle-rules').checked       = s.rules;
  document.getElementById('toggle-restaurants').checked = s.restaurants;
  document.getElementById('toggle-attractions').checked = s.attractions;
  document.getElementById('toggle-transport').checked   = s.transport;
  document.getElementById('toggle-faq').checked         = s.faq;
}

// ─── Sidebar navigation ───────────────────────────────────────────────────────

function initSidebar() {
  document.querySelectorAll('.admin-nav__item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.dataset.section;
      document.querySelectorAll('.admin-nav__item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      const section = document.getElementById(`section-${sectionId}`);
      if (section) section.classList.add('active');

      // Close sidebar on mobile after click
      if (window.innerWidth < 768) {
        document.getElementById('admin-sidebar').classList.remove('open');
      }
    });
  });

  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.toggle('open');
  });
}

// ─── Dynamic list helpers ─────────────────────────────────────────────────────

function makeRemoveBtn() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-remove';
  btn.title = 'Remove';
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  return btn;
}

function addTextItem(listId, value = '') {
  const list = document.getElementById(listId);
  const item = document.createElement('div');
  item.className = 'dynamic-item';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.placeholder = 'Type here...';

  const removeBtn = makeRemoveBtn();
  removeBtn.addEventListener('click', () => item.remove());

  item.appendChild(input);
  item.appendChild(removeBtn);
  list.appendChild(item);
  input.focus();
}

function getTextItems(listId) {
  return Array.from(document.querySelectorAll(`#${listId} .dynamic-item input`))
    .map(i => i.value.trim())
    .filter(v => v.length > 0);
}

function addPhotoItem(src = '') {
  const list = document.getElementById('photos-list');
  const item = document.createElement('div');
  item.className = 'photo-item';

  if (src && src.startsWith('data:')) {
    const thumb = document.createElement('img');
    thumb.src = src;
    thumb.className = 'photo-item__thumb';
    thumb.alt = '';
    item.appendChild(thumb);
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.value = src;
    item.appendChild(hidden);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = src;
    input.placeholder = 'https://... or assets/photo.jpg';
    item.appendChild(input);
  }

  const removeBtn = makeRemoveBtn();
  removeBtn.addEventListener('click', () => item.remove());
  item.appendChild(removeBtn);
  list.appendChild(item);
}

function getPhotoItems() {
  const list = document.getElementById('photos-list');
  return Array.from(list.querySelectorAll('.photo-item')).map(item => {
    const hidden = item.querySelector('input[type="hidden"]');
    if (hidden) return hidden.value;
    const text = item.querySelector('input[type="text"]');
    return text ? text.value.trim() : '';
  }).filter(v => v.length > 0);
}

// Comprime un'immagine su canvas. maxSize 1600 ora che le foto vanno su Storage
// (non più dentro il config) → più qualità, peso comunque basso.
function resizeImageToCanvas(file, maxSize = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
          else { width = Math.round(width * maxSize / height); height = maxSize; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Mantengo il vecchio nome per compatibilità (restituisce base64).
async function resizeImageToBase64(file, maxSize = 1200) {
  const canvas = await resizeImageToCanvas(file, maxSize);
  return canvas.toDataURL('image/jpeg', 0.82);
}

// Comprime e CARICA la foto su Supabase Storage. Ritorna l'URL pubblico.
// Se l'upload fallisce (offline o storage non pronto), ricade su base64 nel config.
async function uploadImageFile(file) {
  const canvas = await resizeImageToCanvas(file);
  const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.82));
  if (typeof BlueWelcomeDB !== 'undefined' && blob) {
    const { url, error } = await BlueWelcomeDB.uploadPhoto(blob, 'jpg');
    if (!error && url) return url;
    console.warn('upload storage fallito, uso base64:', error);
  }
  return canvas.toDataURL('image/jpeg', 0.82); // fallback
}

async function handlePhotoUpload(e) {
  const files = Array.from(e.target.files);
  e.target.value = '';
  for (const file of files) {
    try {
      const url = await uploadImageFile(file);
      addPhotoItem(url);
    } catch {
      showToast('Failed to process ' + file.name, 'error');
    }
  }
}

function addContactItem(contact = {}) {
  const list = document.getElementById('contacts-list');
  const item = document.createElement('div');
  item.className = 'dynamic-item contact-item';

  item.innerHTML = `
    <div class="contact-item__grid">
      <div class="field">
        <label>Name</label>
        <input type="text" class="c-name" value="${esc(contact.name || '')}" placeholder="e.g. Marco (owner)">
      </div>
      <div class="field">
        <label>Phone</label>
        <input type="text" class="c-phone" value="${esc(contact.phone || '')}" placeholder="+39 333 1234567">
      </div>
      <div class="field">
        <label>Type</label>
        <select class="c-type">
          <option value="owner" ${contact.type === 'owner' ? 'selected' : ''}>Owner</option>
          <option value="emergency" ${contact.type === 'emergency' ? 'selected' : ''}>Emergency</option>
          <option value="medical" ${contact.type === 'medical' ? 'selected' : ''}>Medical</option>
          <option value="other" ${contact.type === 'other' || (!contact.type) ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <div class="field">
        <label>Available</label>
        <input type="text" class="c-available" value="${esc(contact.available || '')}" placeholder="e.g. 9:00-21:00">
      </div>
      <div class="field field--toggle">
        <label>WhatsApp</label>
        <label class="toggle">
          <input type="checkbox" class="c-whatsapp" ${contact.whatsapp ? 'checked' : ''}>
          <span class="toggle__slider"></span>
        </label>
      </div>
      <div class="field field--wide">
        <label>Personal note <span style="font-weight:400;color:#718096">(optional — shown on the contact card)</span></label>
        <input type="text" class="c-note" value="${esc(contact.note || '')}" placeholder="e.g. Don't hesitate to call us anytime!">
      </div>
    </div>
  `;

  const removeBtn = makeRemoveBtn();
  removeBtn.addEventListener('click', () => item.remove());
  item.appendChild(removeBtn);
  list.appendChild(item);
}

function addAboutItem(section = {}) {
  const list = document.getElementById('about-list');
  const item = document.createElement('div');
  item.className = 'dynamic-item about-item';

  item.innerHTML = `
    <div class="about-item__grid">
      <div class="field">
        <label>Section title <span style="font-weight:400;color:#718096">(optional)</span></label>
        <input type="text" class="ab-title" value="${esc(section.title || '')}" placeholder="e.g. The House, Your Hosts, The Neighbourhood">
      </div>
      <div class="field field--wide">
        <label>Text</label>
        <textarea class="ab-text" rows="4" placeholder="Write freely — line breaks create separate paragraphs.">${esc(section.text || '')}</textarea>
      </div>
    </div>
  `;

  const removeBtn = makeRemoveBtn();
  removeBtn.addEventListener('click', () => item.remove());
  item.appendChild(removeBtn);
  list.appendChild(item);
}

function getAbout() {
  return Array.from(document.querySelectorAll('#about-list .about-item')).map(item => ({
    title: item.querySelector('.ab-title').value.trim(),
    text: item.querySelector('.ab-text').value.trim(),
  })).filter(s => s.text);
}

function getContacts() {
  return Array.from(document.querySelectorAll('#contacts-list .contact-item')).map(item => ({
    name: item.querySelector('.c-name').value.trim(),
    phone: item.querySelector('.c-phone').value.trim(),
    type: item.querySelector('.c-type').value,
    available: item.querySelector('.c-available').value.trim(),
    whatsapp: item.querySelector('.c-whatsapp').checked,
    note: item.querySelector('.c-note').value.trim(),
  })).filter(c => c.name);
}

function addDirectionPhotoItem(p = {}) {
  const list = document.getElementById('direction-photos-list');
  const item = document.createElement('div');
  item.className = 'dynamic-item direction-photo-item';

  const src = p.url || '';
  // Foto caricata (base64): mostra anteprima + valore in hidden.
  // Foto via URL: campo di testo editabile.
  const srcField = (src && src.startsWith('data:'))
    ? `<img src="${src}" class="dp-thumb" alt=""><input type="hidden" class="dp-url" value="${esc(src)}">`
    : `<input type="url" class="dp-url" value="${esc(src)}" placeholder="https://... or assets/photo.jpg">`;

  item.innerHTML = `
    <div class="direction-photo-row">
      <div class="dp-src">${srcField}</div>
      <input type="text" class="dp-caption" value="${esc(p.caption || '')}" placeholder="Caption (optional) — e.g. The blue gate on your right">
    </div>
  `;

  const removeBtn = makeRemoveBtn();
  removeBtn.addEventListener('click', () => item.remove());
  item.appendChild(removeBtn);
  list.appendChild(item);
}

function getDirectionPhotos() {
  return Array.from(document.querySelectorAll('#direction-photos-list .direction-photo-item')).map(item => ({
    url: item.querySelector('.dp-url').value.trim(),
    caption: item.querySelector('.dp-caption').value.trim(),
  })).filter(p => p.url);
}

async function handleDirectionPhotoUpload(files) {
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const url = await uploadImageFile(file);
      addDirectionPhotoItem({ url });
    } catch {
      showToast('Failed to process ' + file.name, 'error');
    }
  }
}

// Widget foto singola (foto principale, logo): upload + drag&drop + anteprima + rimuovi.
// Scrive il valore (base64 o URL) nel campo hidden indicato.
function initSinglePhoto(opts) {
  const preview = document.getElementById(opts.previewId);
  const hidden = document.getElementById(opts.hiddenId);
  const fileInput = document.getElementById(opts.fileId);
  const removeBtn = document.getElementById(opts.removeId);
  if (!preview || !hidden || !fileInput || !removeBtn) return;

  function render() {
    const val = hidden.value.trim();
    preview.innerHTML = '';
    if (val) {
      const img = document.createElement('img');
      img.src = val;
      img.alt = '';
      preview.appendChild(img);
      preview.classList.add('has-image');
      removeBtn.classList.remove('hidden');
    } else {
      preview.classList.remove('has-image');
      removeBtn.classList.add('hidden');
    }
  }
  // espongo render per il load del config
  preview._render = render;

  async function handleFiles(files) {
    const file = Array.from(files).find(f => f.type.startsWith('image/'));
    if (!file) return;
    try {
      hidden.value = await uploadImageFile(file);
      render();
    } catch {
      showToast('Failed to process ' + file.name, 'error');
    }
  }

  fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); e.target.value = ''; });
  removeBtn.addEventListener('click', () => { hidden.value = ''; render(); });
  setupDropzone(opts.previewId, handleFiles);
  render();
}

// Abilita il trascinamento di immagini su un elemento; onFiles riceve la FileList.
function setupDropzone(elementId, onFiles) {
  const zone = document.getElementById(elementId);
  if (!zone) return;
  ['dragenter', 'dragover'].forEach(ev => zone.addEventListener(ev, (e) => {
    e.preventDefault();
    zone.classList.add('is-dragover');
  }));
  ['dragleave', 'drop'].forEach(ev => zone.addEventListener(ev, (e) => {
    e.preventDefault();
    zone.classList.remove('is-dragover');
  }));
  zone.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length) onFiles(files);
  });
}

function addRestaurantItem(r = {}) {
  const list = document.getElementById('restaurants-list');
  const item = document.createElement('div');
  item.className = 'dynamic-item restaurant-item';

  item.innerHTML = `
    <div class="complex-item__grid">
      <div class="field">
        <label>Name</label>
        <input type="text" class="r-name" value="${esc(r.name || '')}" placeholder="Restaurant name">
      </div>
      <div class="field">
        <label>Category</label>
        <input type="text" class="r-category" value="${esc(r.category || '')}" placeholder="e.g. Italian cuisine">
      </div>
      <div class="field">
        <label>Price range</label>
        <select class="r-price">
          <option value="low" ${r.price_range === 'low' ? 'selected' : ''}>€ Low</option>
          <option value="medium" ${r.price_range === 'medium' || !r.price_range ? 'selected' : ''}>€€ Medium</option>
          <option value="high" ${r.price_range === 'high' ? 'selected' : ''}>€€€ High</option>
        </select>
      </div>
      <div class="field">
        <label>Distance</label>
        <input type="text" class="r-distance" value="${esc(r.distance || '')}" placeholder="e.g. 5 min walk">
      </div>
      <div class="field field--wide">
        <label>Description</label>
        <textarea class="r-description" rows="2" placeholder="Short description...">${esc(r.description || '')}</textarea>
      </div>
      <div class="field">
        <label>Google Maps URL</label>
        <input type="url" class="r-maps" value="${esc(r.google_maps_url || '')}" placeholder="https://goo.gl/maps/...">
      </div>
      <div class="field">
        <label>Phone</label>
        <input type="text" class="r-phone" value="${esc(r.phone || '')}" placeholder="+39 055 ...">
      </div>
    </div>
  `;

  const removeBtn = makeRemoveBtn();
  removeBtn.addEventListener('click', () => item.remove());
  item.appendChild(removeBtn);
  list.appendChild(item);
}

function getRestaurants() {
  return Array.from(document.querySelectorAll('#restaurants-list .restaurant-item')).map(item => ({
    name: item.querySelector('.r-name').value.trim(),
    category: item.querySelector('.r-category').value.trim(),
    price_range: item.querySelector('.r-price').value,
    distance: item.querySelector('.r-distance').value.trim(),
    description: item.querySelector('.r-description').value.trim(),
    google_maps_url: item.querySelector('.r-maps').value.trim(),
    phone: item.querySelector('.r-phone').value.trim(),
  })).filter(r => r.name);
}

function addAttractionItem(a = {}) {
  const list = document.getElementById('attractions-list');
  const item = document.createElement('div');
  item.className = 'dynamic-item attraction-item';

  item.innerHTML = `
    <div class="complex-item__grid">
      <div class="field">
        <label>Name</label>
        <input type="text" class="a-name" value="${esc(a.name || '')}" placeholder="Attraction name">
      </div>
      <div class="field">
        <label>Category</label>
        <input type="text" class="a-category" value="${esc(a.category || '')}" placeholder="e.g. Museum, Panorama">
      </div>
      <div class="field">
        <label>Distance</label>
        <input type="text" class="a-distance" value="${esc(a.distance || '')}" placeholder="e.g. 10 min walk">
      </div>
      <div class="field">
        <label>Website</label>
        <input type="url" class="a-website" value="${esc(a.website || '')}" placeholder="https://...">
      </div>
      <div class="field field--wide">
        <label>Description</label>
        <textarea class="a-description" rows="2" placeholder="Short description...">${esc(a.description || '')}</textarea>
      </div>
      <div class="field field--wide">
        <label>Tip</label>
        <input type="text" class="a-tip" value="${esc(a.tip || '')}" placeholder="Insider tip...">
      </div>
    </div>
  `;

  const removeBtn = makeRemoveBtn();
  removeBtn.addEventListener('click', () => item.remove());
  item.appendChild(removeBtn);
  list.appendChild(item);
}

function getAttractions() {
  return Array.from(document.querySelectorAll('#attractions-list .attraction-item')).map(item => ({
    name: item.querySelector('.a-name').value.trim(),
    category: item.querySelector('.a-category').value.trim(),
    distance: item.querySelector('.a-distance').value.trim(),
    description: item.querySelector('.a-description').value.trim(),
    website: item.querySelector('.a-website').value.trim(),
    tip: item.querySelector('.a-tip').value.trim(),
  })).filter(a => a.name);
}

function addFaqItem(faq = {}) {
  const list = document.getElementById('faq-list');
  const item = document.createElement('div');
  item.className = 'dynamic-item faq-item';

  item.innerHTML = `
    <div class="faq-item__grid">
      <div class="field">
        <label>Question</label>
        <input type="text" class="faq-question" value="${esc(faq.question || '')}" placeholder="Question...">
      </div>
      <div class="field">
        <label>Answer</label>
        <textarea class="faq-answer" rows="2" placeholder="Answer...">${esc(faq.answer || '')}</textarea>
      </div>
    </div>
  `;

  const removeBtn = makeRemoveBtn();
  removeBtn.addEventListener('click', () => item.remove());
  item.appendChild(removeBtn);
  list.appendChild(item);
}

function getFaq() {
  return Array.from(document.querySelectorAll('#faq-list .faq-item')).map(item => ({
    question: item.querySelector('.faq-question').value.trim(),
    answer: item.querySelector('.faq-answer').value.trim(),
  })).filter(f => f.question);
}

// ─── Form population ──────────────────────────────────────────────────────────

function populateForm(config) {
  const p = config.property || {};
  document.getElementById('prop-name').value = p.name || '';
  document.getElementById('prop-city').value = p.city || '';
  document.getElementById('prop-address').value = p.address || '';
  document.getElementById('prop-greeting').value = p.greeting || '';
  document.getElementById('prop-accent').value = p.accent_color || '#1a56db';
  document.getElementById('prop-accent-picker').value = p.accent_color || '#1a56db';
  document.getElementById('prop-photo').value = p.photo || '';
  document.getElementById('prop-logo').value = p.logo || '';
  // aggiorna le anteprime dei widget foto singola
  const heroPrev = document.getElementById('hero-photo-preview');
  const logoPrev = document.getElementById('logo-photo-preview');
  if (heroPrev && heroPrev._render) heroPrev._render();
  if (logoPrev && logoPrev._render) logoPrev._render();
  document.getElementById('prop-language').value = p.language || 'en';
  document.getElementById('admin-property-name').textContent = p.name || '';
  document.getElementById('photos-list').innerHTML = '';
  (p.photos || []).forEach(url => addPhotoItem(url));

  document.getElementById('about-list').innerHTML = '';
  const aboutData = p.about;
  if (Array.isArray(aboutData)) {
    aboutData.forEach(s => addAboutItem(s));
  } else if (typeof aboutData === 'string' && aboutData) {
    addAboutItem({ title: '', text: aboutData });
  }

  const w = config.wifi || {};
  document.getElementById('wifi-network').value = w.network || '';
  document.getElementById('wifi-password').value = w.password || '';
  document.getElementById('wifi-notes').value = w.notes || '';

  const ci = config.checkin || {};
  document.getElementById('checkin-time').value = ci.time || '';
  document.getElementById('checkin-early').value = ci.early_checkin || '';
  document.getElementById('checkin-instructions-list').innerHTML = '';
  (ci.instructions || []).forEach(v => addTextItem('checkin-instructions-list', v));

  const co = config.checkout || {};
  document.getElementById('checkout-time').value = co.time || '';
  document.getElementById('checkout-late').value = co.late_checkout || '';
  document.getElementById('checkout-instructions-list').innerHTML = '';
  (co.instructions || []).forEach(v => addTextItem('checkout-instructions-list', v));

  document.getElementById('rules-list').innerHTML = '';
  (config.rules || []).forEach(v => addTextItem('rules-list', v));

  document.getElementById('contacts-list').innerHTML = '';
  (config.contacts || []).forEach(c => addContactItem(c));

  const m = config.map || {};
  document.getElementById('map-gmaps-url').value = m.google_maps_url || '';
  document.getElementById('map-embed-url').value = m.embed_url || '';
  document.getElementById('map-notes').value = m.walking_notes || '';
  document.getElementById('map-directions-text').value = m.directions_text || '';
  document.getElementById('direction-photos-list').innerHTML = '';
  (m.directions_photos || []).forEach(p => addDirectionPhotoItem(p));

  const ext = config.external_links || {};
  document.getElementById('ext-restaurants').value = ext.restaurants || '';
  document.getElementById('ext-attractions').value = ext.attractions || '';

  document.getElementById('restaurants-list').innerHTML = '';
  (config.restaurants || []).forEach(r => addRestaurantItem(r));

  document.getElementById('attractions-list').innerHTML = '';
  (config.attractions || []).forEach(a => addAttractionItem(a));

  const t = config.transport || {};
  document.getElementById('transport-parking').value = t.parking || '';
  document.getElementById('transport-bus').value = t.bus || '';
  document.getElementById('transport-taxi').value = t.taxi || '';
  document.getElementById('transport-train').value = t.train || '';
  document.getElementById('transport-airport').value = t.airport || '';

  document.getElementById('faq-list').innerHTML = '';
  (config.faq || []).forEach(f => addFaqItem(f));

  populateSections(config.sections);
}

// ─── Read form → config object ────────────────────────────────────────────────

function buildConfigFromForm() {
  const accentColor = document.getElementById('prop-accent').value.trim() || '#1a56db';

  const newPinRaw = document.getElementById('admin-pin-new').value.trim();
  const confirmPinRaw = document.getElementById('admin-pin-confirm').value.trim();
  let adminPin = currentConfig.admin_pin || '1234';

  if (newPinRaw) {
    if (newPinRaw.length < 4) {
      showToast('PIN must be at least 4 digits', 'error');
      return null;
    }
    if (newPinRaw !== confirmPinRaw) {
      showToast('PINs do not match', 'error');
      return null;
    }
    adminPin = newPinRaw;
  }

  const transport = {};
  const tp = document.getElementById('transport-parking').value.trim();
  const tb = document.getElementById('transport-bus').value.trim();
  const tt = document.getElementById('transport-taxi').value.trim();
  const ttr = document.getElementById('transport-train').value.trim();
  const ta = document.getElementById('transport-airport').value.trim();
  if (tp) transport.parking = tp;
  if (tb) transport.bus = tb;
  if (tt) transport.taxi = tt;
  if (ttr) transport.train = ttr;
  if (ta) transport.airport = ta;

  const mapGmaps = document.getElementById('map-gmaps-url').value.trim();
  const mapEmbed = document.getElementById('map-embed-url').value.trim();
  const mapNotes = document.getElementById('map-notes').value.trim();
  const mapDirText = document.getElementById('map-directions-text').value.trim();
  const mapDirPhotos = getDirectionPhotos();
  const mapObj = {};
  if (mapGmaps) mapObj.google_maps_url = mapGmaps;
  if (mapEmbed) mapObj.embed_url = mapEmbed;
  if (mapNotes) mapObj.walking_notes = mapNotes;
  if (mapDirText) mapObj.directions_text = mapDirText;
  if (mapDirPhotos.length) mapObj.directions_photos = mapDirPhotos;

  return {
    property: {
      name: document.getElementById('prop-name').value.trim(),
      city: document.getElementById('prop-city').value.trim(),
      address: document.getElementById('prop-address').value.trim(),
      photo: document.getElementById('prop-photo').value.trim(),
      photos: getPhotoItems(),
      greeting: document.getElementById('prop-greeting').value.trim(),
      accent_color: accentColor,
      logo: document.getElementById('prop-logo').value.trim(),
      language: document.getElementById('prop-language').value,
      about: getAbout(),
    },
    wifi: {
      network: document.getElementById('wifi-network').value.trim(),
      password: document.getElementById('wifi-password').value.trim(),
      notes: document.getElementById('wifi-notes').value.trim(),
    },
    checkin: {
      time: document.getElementById('checkin-time').value.trim(),
      early_checkin: document.getElementById('checkin-early').value.trim(),
      instructions: getTextItems('checkin-instructions-list'),
    },
    checkout: {
      time: document.getElementById('checkout-time').value.trim(),
      late_checkout: document.getElementById('checkout-late').value.trim(),
      instructions: getTextItems('checkout-instructions-list'),
    },
    rules: getTextItems('rules-list'),
    contacts: getContacts(),
    map: Object.keys(mapObj).length ? mapObj : undefined,
    restaurants: getRestaurants(),
    attractions: getAttractions(),
    transport: Object.keys(transport).length ? transport : undefined,
    faq: getFaq(),
    sections: getSections(),
    external_links: {
      restaurants: document.getElementById('ext-restaurants').value.trim(),
      attractions: document.getElementById('ext-attractions').value.trim(),
    },
    tab_order: getTabOrder(),
    admin_pin: adminPin,
  };
}

// ─── Download ─────────────────────────────────────────────────────────────────

function downloadConfig(config) {
  // Remove undefined keys
  const clean = JSON.parse(JSON.stringify(config));
  const json = JSON.stringify(clean, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

let toastTimer = null;

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast toast--${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ─── Color picker sync ────────────────────────────────────────────────────────

function initColorPicker() {
  const picker = document.getElementById('prop-accent-picker');
  const text = document.getElementById('prop-accent');

  picker.addEventListener('input', () => { text.value = picker.value; });
  text.addEventListener('input', () => {
    const val = text.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(val)) picker.value = val;
  });
}

// ─── Escape helper ────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function initActions() {
  document.getElementById('btn-download').addEventListener('click', saveToCloud);
  document.getElementById('btn-save-download').addEventListener('click', saveToCloud);

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm(at('confirmReset'))) {
      populateForm(savedConfig);
      showToast(at('saved'));
    }
  });

  document.getElementById('btn-preview').addEventListener('click', () => {
    const config = buildConfigFromForm();
    if (!config) return;
    localStorage.setItem('bluewelcome_preview_config', JSON.stringify(config));
    window.open('index.html', '_blank');
  });
}

// Salva la guida su Supabase (crea la guida la prima volta se non esiste).
async function saveToCloud() {
  const config = buildConfigFromForm();
  if (!config) return;

  // Se è la prima guida del proprietario, chiedi uno slug (nome nell'URL).
  if (!currentGuideId) {
    let slug = prompt(at('askSlug'), (config.property?.name || 'guide')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    if (!slug) return;
    slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const { data, error } = await BlueWelcomeDB.createGuide(slug, config);
    if (error) {
      showToast(error.message.includes('duplicate') ? at('slugTaken') : at('saveError'), 'error');
      return;
    }
    currentGuideId = data.id;
    currentGuideSlug = data.slug;
    savedConfig = JSON.parse(JSON.stringify(config));
    showToast(at('saved'));
    return;
  }

  // Guida già esistente: aggiorna
  const { error } = await BlueWelcomeDB.saveGuide(currentGuideId, config);
  if (error) { showToast(at('saveError'), 'error'); return; }
  savedConfig = JSON.parse(JSON.stringify(config));
  showToast(at('saved'));
}

// ─── Add-item buttons ─────────────────────────────────────────────────────────

function initAddButtons() {
  document.getElementById('btn-add-photo-url').addEventListener('click', () => addPhotoItem(''));
  document.getElementById('photo-file-input').addEventListener('change', handlePhotoUpload);
  document.getElementById('btn-add-checkin-instruction').addEventListener('click', () => addTextItem('checkin-instructions-list'));
  document.getElementById('btn-add-checkout-instruction').addEventListener('click', () => addTextItem('checkout-instructions-list'));
  document.getElementById('btn-add-rule').addEventListener('click', () => addTextItem('rules-list'));
  document.getElementById('btn-add-direction-photo').addEventListener('click', () => addDirectionPhotoItem());
  document.getElementById('dirphoto-file-input').addEventListener('change', (e) => {
    handleDirectionPhotoUpload(e.target.files);
    e.target.value = '';
  });
  setupDropzone('direction-photos-dropzone', handleDirectionPhotoUpload);
  setupDropzone('photos-list', (files) => handlePhotoUpload({ target: { files, value: '' } }));
  document.getElementById('btn-add-contact').addEventListener('click', () => addContactItem());
  document.getElementById('btn-add-restaurant').addEventListener('click', () => addRestaurantItem());
  document.getElementById('btn-add-attraction').addEventListener('click', () => addAttractionItem());
  document.getElementById('btn-add-faq').addEventListener('click', () => addFaqItem());
  document.getElementById('btn-add-about').addEventListener('click', () => addAboutItem());
}

let qrPreviewInstance = null;

function updateQRPreview() {
  const ssid = document.getElementById('wifi-network').value.trim();
  const password = document.getElementById('wifi-password').value.trim();
  const container = document.getElementById('admin-qr-preview');
  if (!container) return;

  container.innerHTML = '';

  if (!ssid || !password) {
    const hint = document.createElement('p');
    hint.className = 'admin-qr-preview__hint';
    hint.textContent = 'Enter SSID and password to generate the QR';
    container.appendChild(hint);
    return;
  }

  const wifiString = `WIFI:T:WPA;S:${ssid};P:${password};;`;
  try {
    new QRCode(container, {
      text: wifiString,
      width: 160,
      height: 160,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch (e) {
    container.textContent = 'QR generation failed';
  }
}

function initQRPreview() {
  let debounceTimer;
  function debounced() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateQRPreview, 400);
  }
  document.getElementById('wifi-network').addEventListener('input', debounced);
  document.getElementById('wifi-password').addEventListener('input', debounced);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function buildLangPicker(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const current = getAdminLang();
  ADMIN_LANGS.forEach(l => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-picker__btn' + (l.code === current ? ' is-active' : '');
    btn.innerHTML = `<span class="lang-picker__flag">${flagSVG(l.code)}</span><span class="lang-picker__code">${l.code.toUpperCase()}</span>`;
    btn.title = l.label;
    btn.addEventListener('click', () => {
      setAdminLang(l.code);
      // riallinea lo stato attivo in entrambi i picker
      buildLangPicker('pin-lang-picker');
      buildLangPicker('header-lang-picker');
      translateAddButtons();
      refreshHelpTips();
    });
    container.appendChild(btn);
  });
}

// Traduce i testi dei pulsanti "Add ..." generati o presenti nell'HTML.
function translateAddButtons() {
  const map = {
    'btn-add-about': 'addSection',
    'btn-add-checkin-instruction': 'addInstruction',
    'btn-add-checkout-instruction': 'addInstruction',
    'btn-add-rule': 'addRule',
    'btn-add-contact': 'addContact',
    'btn-add-restaurant': 'addRestaurant',
    'btn-add-attraction': 'addAttraction',
    'btn-add-faq': 'addFaq',
  };
  Object.entries(map).forEach(([id, key]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    // sostituisce solo il nodo testo finale, lasciando l'icona SVG
    const textNode = Array.from(btn.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
    if (textNode) textNode.textContent = ' ' + at(key);
    else btn.appendChild(document.createTextNode(' ' + at(key)));
  });
}

// Mappa label → chiave di aiuto. Inserisce una "?" cliccabile accanto alla label.
const HELP_MAP = {
  'prop-name': 'helpPropName',
  'prop-city': 'helpPropCity',
  'prop-language': 'helpPropLang',
  'prop-address': 'helpPropAddress',
  'prop-greeting': 'helpPropGreeting',
  'prop-accent': 'helpPropAccent',
  'wifi-network': 'helpWifiNetwork',
  'wifi-password': 'helpWifiPassword',
  'checkin-time': 'helpCheckinTime',
  'checkout-time': 'helpCheckoutTime',
  'map-gmaps-url': 'helpMapUrl',
  'map-embed-url': 'helpMapEmbed',
  'map-directions-text': 'helpMapDirections',
  'admin-pin-new': 'helpPin',
};

function buildHelpTips() {
  Object.entries(HELP_MAP).forEach(([fieldId, helpKey]) => {
    const label = document.querySelector(`label[for="${fieldId}"]`);
    if (!label || label.querySelector('.help-tip')) return;
    const tip = document.createElement('span');
    tip.className = 'help-tip';
    tip.setAttribute('data-help', helpKey);
    tip.setAttribute('tabindex', '0');
    tip.textContent = '?';
    tip.title = at(helpKey);
    label.appendChild(document.createTextNode(' '));
    label.appendChild(tip);
  });
}

function refreshHelpTips() {
  document.querySelectorAll('.help-tip[data-help]').forEach(tip => {
    tip.title = at(tip.getAttribute('data-help'));
  });
}

function initLang() {
  buildLangPicker('pin-lang-picker');
  buildLangPicker('header-lang-picker');
  buildHelpTips();
  applyAdminTranslations();
  translateAddButtons();
  refreshHelpTips();
}

// Palette di colori pronti (coerenti col mondo Blue + qualche alternativa elegante)
const COLOR_SWATCHES = ['#1a56db', '#2563eb', '#0ea5e9', '#0d9488', '#059669', '#7c3aed', '#db2777', '#d97706'];

function initColorSwatches() {
  const wrap = document.getElementById('color-swatches');
  const hex = document.getElementById('prop-accent');
  const picker = document.getElementById('prop-accent-picker');
  if (!wrap || !hex || !picker) return;
  wrap.innerHTML = '';
  COLOR_SWATCHES.forEach(c => {
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'color-swatch';
    sw.style.background = c;
    sw.title = c;
    sw.addEventListener('click', () => {
      hex.value = c;
      picker.value = c;
      hex.dispatchEvent(new Event('input', { bubbles: true }));
    });
    wrap.appendChild(sw);
  });
}

// Lista riordinabile delle 5 tab principali (drag & drop)
function initTabOrder() {
  const list = document.getElementById('tab-order-list');
  if (!list) return;
  // etichette dalle stringhe guida ospite tab principali
  const tabs = [
    { key: 'home', t: 'tabHome' },
    { key: 'info', t: 'tabInfo' },
    { key: 'contacts', t: 'tabContacts' },
    { key: 'nearby', t: 'tabNearby' },
    { key: 'faq', t: 'tabFaq' },
  ];
  // ordine salvato o default
  const saved = (currentConfig && currentConfig.tab_order) || [];
  const ordered = [...saved.filter(k => tabs.some(t => t.key === k)),
    ...tabs.map(t => t.key).filter(k => !saved.includes(k))];

  list.innerHTML = '';
  ordered.forEach(key => {
    const def = tabs.find(t => t.key === key);
    const li = document.createElement('li');
    li.className = 'tab-order-item';
    li.draggable = true;
    li.dataset.tab = key;
    li.innerHTML = `<svg class="tab-order-grip" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="8" y2="6"/><line x1="8" y1="12" x2="8" y2="12"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="16" y1="12" x2="16" y2="12"/><line x1="16" y1="18" x2="16" y2="18"/></svg><span data-t="${def.t}"></span>`;
    list.appendChild(li);
  });

  let dragged = null;
  list.addEventListener('dragstart', e => {
    dragged = e.target.closest('.tab-order-item');
    if (dragged) dragged.classList.add('dragging');
  });
  list.addEventListener('dragend', () => {
    if (dragged) dragged.classList.remove('dragging');
    dragged = null;
  });
  list.addEventListener('dragover', e => {
    e.preventDefault();
    const after = [...list.querySelectorAll('.tab-order-item:not(.dragging)')].find(item => {
      const box = item.getBoundingClientRect();
      return e.clientY < box.top + box.height / 2;
    });
    if (!dragged) return;
    if (after) list.insertBefore(dragged, after);
    else list.appendChild(dragged);
  });
}

function getTabOrder() {
  const list = document.getElementById('tab-order-list');
  if (!list) return undefined;
  return [...list.querySelectorAll('.tab-order-item')].map(li => li.dataset.tab);
}

function initGuide() {
  const modal = document.getElementById('guide-modal');
  const open = () => modal.classList.remove('hidden');
  const close = () => modal.classList.add('hidden');
  document.getElementById('btn-guide').addEventListener('click', open);
  document.getElementById('guide-modal-close').addEventListener('click', close);
  document.getElementById('guide-modal-ok').addEventListener('click', close);
  document.getElementById('guide-modal-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
  });
}

async function init() {
  await loadAdminConfig();
  initPin();
  initSidebar();
  initColorPicker();
  initActions();
  initAddButtons();
  initQRPreview();
  initSinglePhoto({ previewId: 'hero-photo-preview', hiddenId: 'prop-photo', fileId: 'hero-photo-file', removeId: 'hero-photo-remove' });
  initSinglePhoto({ previewId: 'logo-photo-preview', hiddenId: 'prop-logo', fileId: 'logo-photo-file', removeId: 'logo-photo-remove' });
  initGuide();
  initColorSwatches();
  initTabOrder();
  initLang();
}

document.addEventListener('DOMContentLoaded', init);
