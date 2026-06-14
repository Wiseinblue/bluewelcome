function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'class') element.className = val;
    else if (key === 'text') element.textContent = val;
    else element.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else if (child) element.appendChild(child);
  }
  return element;
}

function svgIcon(paths, extraAttrs = '') {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extraAttrs}>${paths}</svg>`;
  return wrapper.firstChild;
}

function cleanPhone(phone) {
  return phone.replace(/[\s+\-()]/g, '');
}

function makePageFooter(showHomeBtn = true) {
  const footer = el('footer', { class: 'app-footer' });

  if (showHomeBtn) {
    const homeBtn = el('button', { class: 'home-back-btn', 'data-goto-tab': 'home' });
    homeBtn.appendChild(svgIcon('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'));
    homeBtn.appendChild(el('span', { text: 'Home' }));
    footer.appendChild(homeBtn);
  }

  const branding = el('div', { class: 'app-footer__branding' });
  const poweredLabel = el('span', { class: 'app-footer__powered', text: 'Powered by' });
  branding.appendChild(poweredLabel);
  const logo = document.createElement('img');
  logo.src = 'assets/Logo-WiB.png';
  logo.alt = 'Wise in Blue';
  logo.className = 'app-footer__logo';
  logo.loading = 'lazy';
  const link = el('a', {
    href: 'https://wiseinblue.com',
    target: '_blank',
    rel: 'noopener noreferrer',
  });
  link.appendChild(logo);
  branding.appendChild(link);
  footer.appendChild(branding);

  return footer;
}

function renderHome(config) {
  const section = document.getElementById('section-home');
  section.innerHTML = '';

  // ── Gallery / Hero ──────────────────────────────────────────────
  const photos = [];
  if (config.property.photos && config.property.photos.length > 0) {
    photos.push(...config.property.photos);
  } else if (config.property.photo) {
    photos.push(config.property.photo);
  }

  if (photos.length > 1) {
    // Carousel
    const gallery = el('div', { class: 'gallery' });
    const track = el('div', { class: 'gallery__track' });
    photos.forEach((src, i) => {
      const slide = el('div', { class: 'gallery__slide' });
      const img = el('img', { class: 'gallery__img', src, alt: config.property.name, loading: i === 0 ? 'eager' : 'lazy' });
      img.onerror = () => { slide.style.display = 'none'; };
      const overlay = el('div', { class: 'hero__overlay' });
      slide.appendChild(img);
      slide.appendChild(overlay);
      if (i === 0) {
        const heroContent = el('div', { class: 'hero__content' });
        heroContent.appendChild(el('h1', { class: 'hero__property-name', text: config.property.name }));
        heroContent.appendChild(el('p', { class: 'hero__city', text: config.property.city }));
        slide.appendChild(heroContent);
      }
      track.appendChild(slide);
    });
    gallery.appendChild(track);

    // Frecce sinistra/destra (utili soprattutto su desktop dove non c'è lo swipe)
    const prevBtn = el('button', { class: 'gallery__arrow gallery__arrow--prev', 'aria-label': 'Previous photo' });
    prevBtn.appendChild(svgIcon('<polyline points="15 18 9 12 15 6"/>'));
    const nextBtn = el('button', { class: 'gallery__arrow gallery__arrow--next', 'aria-label': 'Next photo' });
    nextBtn.appendChild(svgIcon('<polyline points="9 18 15 12 9 6"/>'));
    gallery.appendChild(prevBtn);
    gallery.appendChild(nextBtn);

    // Dots
    const dots = el('div', { class: 'gallery__dots' });
    photos.forEach((_, i) => {
      const dot = el('button', { class: i === 0 ? 'gallery__dot active' : 'gallery__dot', 'aria-label': `Photo ${i + 1}` });
      dots.appendChild(dot);
    });
    gallery.appendChild(dots);

    // Navigazione
    let current = 0;
    function goTo(idx) {
      current = (idx + photos.length) % photos.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      gallery.querySelectorAll('.gallery__dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
    dots.querySelectorAll('.gallery__dot').forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    });

    section.appendChild(gallery);
  } else {
    // Single hero
    const hero = el('div', { class: 'hero' });
    if (photos.length === 1) {
      const img = el('img', { class: 'hero__img', src: photos[0], alt: config.property.name, loading: 'eager' });
      img.onerror = () => { img.style.display = 'none'; };
      hero.appendChild(img);
    }
    const overlay = el('div', { class: 'hero__overlay' });
    const heroContent = el('div', { class: 'hero__content' });
    heroContent.appendChild(el('h1', { class: 'hero__property-name', text: config.property.name }));
    heroContent.appendChild(el('p', { class: 'hero__city', text: config.property.city }));
    hero.appendChild(overlay);
    hero.appendChild(heroContent);
    section.appendChild(hero);
  }

  const inner = el('div', { class: 'section-inner' });

  // ── Greeting card prominente ─────────────────────────────────────
  if (config.property.greeting) {
    const greetCard = el('div', { class: 'greeting-card' });
    const greetIcon = el('span', { class: 'greeting-card__icon', text: '👋' });
    const greetText = el('p', { class: 'greeting-card__text', text: config.property.greeting });
    greetCard.appendChild(greetIcon);
    greetCard.appendChild(greetText);
    inner.appendChild(greetCard);
  }

  // ── Weather widget ───────────────────────────────────────────────
  const weatherPlaceholder = el('div', { class: 'weather-widget hidden' });
  inner.appendChild(weatherPlaceholder);
  if (config.property.city) {
    fetchWeather(config.property.city).then(data => {
      if (!data) return;
      const widget = renderWeatherWidget(data, getCurrentLang());
      weatherPlaceholder.replaceWith(widget);
    });
  }

  inner.appendChild(el('div', { class: 'spacer' }));

  const homeCards = el('div', { class: 'home-cards' });

  // Card 1 — How to find us → apre la tab Explore (sezione "come raggiungerci").
  // Appare se c'è QUALSIASI info per arrivare (indirizzo, mappa, indicazioni, foto).
  const m = config.map || {};
  const canFindUs = !!config.property?.address
    || !!m.embed_url || !!m.google_maps_url || !!m.walking_notes
    || !!m.directions_text
    || (Array.isArray(m.directions_photos) && m.directions_photos.length > 0);
  if (canFindUs) {
    const cardMap = el('div', {
      class: 'home-card home-card--link',
      'data-goto-tab': 'nearby',
      'data-goto-subtab': 'map',
      role: 'button',
      tabindex: '0',
    });
    const cardMapLeft = el('div', { class: 'home-card__left' });
    cardMapLeft.appendChild(svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'));
    cardMapLeft.appendChild(el('span', { class: 'home-card__title', text: t('howToFindUs') }));
    cardMap.appendChild(cardMapLeft);
    cardMap.appendChild(svgIcon('<polyline points="9 18 15 12 9 6"/>'));
    homeCards.appendChild(cardMap);
  }

  // Card 2 — Check-in / Check-out (espandibile)
  const cardCheckin = el('div', { class: 'home-card home-card--expandable' });
  const cardCheckinHeader = el('div', { class: 'home-card__header' });
  const cardCheckinLeft = el('div', { class: 'home-card__left' });
  cardCheckinLeft.appendChild(svgIcon('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'));
  cardCheckinLeft.appendChild(el('span', { class: 'home-card__title', text: t('checkin') + ' / ' + t('checkout') }));
  cardCheckinHeader.appendChild(cardCheckinLeft);
  const chevronCI = svgIcon('<polyline points="6 9 12 15 18 9"/>');
  chevronCI.classList.add('home-card__chevron');
  cardCheckinHeader.appendChild(chevronCI);
  const cardCheckinBody = el('div', { class: 'home-card__body' });
  const ciRow = el('div', { class: 'home-card__times' });
  const ciCol = el('div', { class: 'home-card__time-col' });
  ciCol.appendChild(el('span', { class: 'home-card__time-label', text: t('checkin') }));
  ciCol.appendChild(el('span', { class: 'home-card__time-value', text: config.checkin.time }));
  const coCol = el('div', { class: 'home-card__time-col' });
  coCol.appendChild(el('span', { class: 'home-card__time-label', text: t('checkout') }));
  coCol.appendChild(el('span', { class: 'home-card__time-value', text: config.checkout.time }));
  ciRow.appendChild(ciCol);
  ciRow.appendChild(coCol);
  cardCheckinBody.appendChild(ciRow);
  cardCheckin.appendChild(cardCheckinHeader);
  cardCheckin.appendChild(cardCheckinBody);
  cardCheckinHeader.addEventListener('click', () => {
    cardCheckin.classList.toggle('open');
  });
  homeCards.appendChild(cardCheckin);

  // Card 3 — Wi-Fi (espandibile)
  const cardWifi = el('div', { class: 'home-card home-card--expandable' });
  const cardWifiHeader = el('div', { class: 'home-card__header' });
  const cardWifiLeft = el('div', { class: 'home-card__left' });
  cardWifiLeft.appendChild(svgIcon('<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>'));
  cardWifiLeft.appendChild(el('span', { class: 'home-card__title', text: t('wifi') }));
  cardWifiHeader.appendChild(cardWifiLeft);
  const chevronWifi = svgIcon('<polyline points="6 9 12 15 18 9"/>');
  chevronWifi.classList.add('home-card__chevron');
  cardWifiHeader.appendChild(chevronWifi);
  const cardWifiBody = el('div', { class: 'home-card__body' });
  const wifiRow = el('div', { class: 'home-card__wifi-row' });
  const wifiPwd = el('span', { class: 'home-card__wifi-pwd', text: config.wifi.password });
  const wifiCopyBtn = el('button', { class: 'home-card__copy-btn', id: 'btn-copy-wifi' });
  wifiCopyBtn.appendChild(svgIcon('<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'));
  wifiCopyBtn.appendChild(el('span', { text: t('copyPassword') }));
  wifiRow.appendChild(wifiPwd);
  wifiRow.appendChild(wifiCopyBtn);
  cardWifiBody.appendChild(wifiRow);

  const qrBtn = el('button', { class: 'home-card__qr-btn', id: 'btn-show-qr' });
  qrBtn.appendChild(svgIcon('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'));
  qrBtn.appendChild(el('span', { text: t('showQR') }));
  cardWifiBody.appendChild(qrBtn);

  cardWifi.appendChild(cardWifiHeader);
  cardWifi.appendChild(cardWifiBody);
  cardWifiHeader.addEventListener('click', () => {
    cardWifi.classList.toggle('open');
  });
  homeCards.appendChild(cardWifi);

  inner.appendChild(homeCards);

  inner.appendChild(makePageFooter(false));

  section.appendChild(inner);
}

function renderAbout(config) {
  const tab = document.querySelector('[data-subtab="about"]');
  const about = config.property && config.property.about;
  const hidden = config.sections?.about === false || !about || (Array.isArray(about) && about.length === 0);
  if (hidden) {
    if (tab) tab.classList.add('hidden');
    return;
  }
  if (tab) tab.classList.remove('hidden');

  const sub = document.getElementById('sub-about');
  sub.innerHTML = '';

  if (Array.isArray(about)) {
    about.forEach(section => {
      const card = el('div', { class: 'about-section' });
      if (section.title) card.appendChild(el('h3', { class: 'about-section__title', text: section.title }));
      if (section.text) {
        section.text.split('\n').forEach(line => {
          if (line.trim()) card.appendChild(el('p', { class: 'about-section__text', text: line }));
        });
      }
      sub.appendChild(card);
    });
  } else {
    const card = el('div', { class: 'about-section' });
    about.split('\n').forEach(line => {
      if (line.trim()) card.appendChild(el('p', { class: 'about-section__text', text: line }));
    });
    sub.appendChild(card);
  }

  sub.appendChild(makePageFooter());
}

function renderCheckin(config) {
  const sub = document.getElementById('sub-checkin');
  sub.innerHTML = '';
  const card = el('div', { class: 'info-card' });

  const badge = el('div', { class: 'time-badge', text: config.checkin.time });
  card.appendChild(badge);

  if (config.checkin.early_checkin) {
    const note = el('div', { class: 'note-card' });
    note.appendChild(el('strong', { text: t('earlyCheckin') + ': ' }));
    note.appendChild(document.createTextNode(config.checkin.early_checkin));
    card.appendChild(note);
  }

  if (Array.isArray(config.checkin.instructions) && config.checkin.instructions.length > 0) {
    const list = el('div', { class: 'step-list' });
    config.checkin.instructions.forEach((step, i) => {
      const item = el('div', { class: 'step-list__item' });
      item.appendChild(el('span', { class: 'step-list__number', text: String(i + 1) }));
      item.appendChild(el('span', { class: 'step-list__text', text: step }));
      list.appendChild(item);
    });
    card.appendChild(list);
  }

  sub.appendChild(card);
  sub.appendChild(makePageFooter());
}

function renderCheckout(config) {
  const sub = document.getElementById('sub-checkout');
  sub.innerHTML = '';
  const card = el('div', { class: 'info-card' });

  const badge = el('div', { class: 'time-badge', text: config.checkout.time });
  card.appendChild(badge);

  if (config.checkout.late_checkout) {
    const note = el('div', { class: 'note-card' });
    note.appendChild(el('strong', { text: t('lateCheckout') + ': ' }));
    note.appendChild(document.createTextNode(config.checkout.late_checkout));
    card.appendChild(note);
  }

  if (Array.isArray(config.checkout.instructions) && config.checkout.instructions.length > 0) {
    const list = el('div', { class: 'step-list' });
    config.checkout.instructions.forEach((step, i) => {
      const item = el('div', { class: 'step-list__item' });
      item.appendChild(el('span', { class: 'step-list__number', text: String(i + 1) }));
      item.appendChild(el('span', { class: 'step-list__text', text: step }));
      list.appendChild(item);
    });
    card.appendChild(list);
  }

  sub.appendChild(card);
  sub.appendChild(makePageFooter());
}

function renderRules(config) {
  const tab = document.querySelector('[data-subtab="rules"]');
  if (config.sections?.rules === false || !Array.isArray(config.rules) || config.rules.length === 0) {
    if (tab) tab.classList.add('hidden');
    return;
  }
  if (tab) tab.classList.remove('hidden');

  const sub = document.getElementById('sub-rules');
  sub.innerHTML = '';
  const list = el('div', { class: 'rules-list' });
  config.rules.forEach(rule => {
    const item = el('div', { class: 'rules-list__item' });
    item.appendChild(svgIcon('<polyline points="20 6 9 17 4 12"/>'));
    item.appendChild(el('span', { text: rule }));
    list.appendChild(item);
  });
  sub.appendChild(list);
  sub.appendChild(makePageFooter());
}

function renderContacts(config) {
  const section = document.getElementById('section-contacts');
  section.innerHTML = '';

  const TYPE_ORDER = ['owner', 'emergency', 'medical', 'other'];
  const TYPE_LABELS = { owner: t('owner'), emergency: t('emergency'), medical: t('medical'), other: 'Other' };

  // Group contacts by type preserving order within each group
  const groups = {};
  TYPE_ORDER.forEach(t_ => { groups[t_] = []; });
  config.contacts.forEach(c => {
    const key = TYPE_ORDER.includes(c.type) ? c.type : 'other';
    groups[key].push(c);
  });

  TYPE_ORDER.forEach(type => {
    const contacts = groups[type];
    if (!contacts.length) return;

    const groupHeader = el('div', { class: 'contact-group-header' });
    groupHeader.appendChild(el('span', { class: 'contact-group-header__label', text: TYPE_LABELS[type] || type }));
    section.appendChild(groupHeader);

    contacts.forEach(contact => {
      const card = el('div', { class: 'contact-card' });
      const header = el('div', { class: 'contact-card__header' });

      const initials = contact.name.split(/\s+/).filter(w => /[A-Za-zÀ-ɏ]/.test(w[0])).slice(0, 2).map(w => w[0]).join('').toUpperCase();
      const avatar = el('div', { class: 'contact-card__avatar', text: initials });
      header.appendChild(avatar);

      const info = el('div', { class: 'contact-card__info' });
      info.appendChild(el('div', { class: 'contact-card__name', text: contact.name }));

      if (contact.available) {
        info.appendChild(el('div', { class: 'contact-card__available', text: contact.available }));
      }
      header.appendChild(info);
      card.appendChild(header);

      if (contact.note) {
        card.appendChild(el('p', { class: 'contact-card__note', text: contact.note }));
      }

      const actions = el('div', { class: 'contact-card__actions' });
      if (contact.phone) {
        const callBtn = el('a', {
          class: 'pill-btn pill-btn--secondary',
          href: `tel:${contact.phone}`,
        });
        callBtn.appendChild(svgIcon('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'));
        callBtn.appendChild(el('span', { text: t('call') }));
        actions.appendChild(callBtn);
      }
      if (contact.whatsapp && contact.phone) {
        const waNum = cleanPhone(contact.phone);
        const waBtn = el('a', {
          class: 'pill-btn pill-btn--primary',
          href: `https://wa.me/${waNum}`,
          target: '_blank',
          rel: 'noopener noreferrer',
        });
        waBtn.appendChild(svgIcon('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'));
        waBtn.appendChild(el('span', { text: t('whatsapp') }));
        actions.appendChild(waBtn);
      }
      card.appendChild(actions);
      section.appendChild(card);
    });
  });

  section.appendChild(makePageFooter());
}

function renderMap(config) {
  const tab = document.querySelector('[data-subtab="map"]');
  // La sezione "How to find us" va mostrata se c'è QUALSIASI info per arrivare:
  // indirizzo, link/embed mappa, indicazioni testuali o foto delle indicazioni.
  const m = config.map || {};
  const hasSomething = !!config.property?.address
    || !!m.embed_url || !!m.google_maps_url || !!m.walking_notes
    || !!m.directions_text
    || (Array.isArray(m.directions_photos) && m.directions_photos.length > 0);
  if (!hasSomething) {
    if (tab) tab.classList.add('hidden');
    return;
  }
  if (tab) tab.classList.remove('hidden');
  renderMapSection(config);
}

// Se la sezione ha un link esterno configurato, mostra un pulsante verso quel sito
// invece dell'elenco interno. Ritorna true se ha gestito la sezione (link esterno).
function renderExternalLink(subId, url, labelKey) {
  const sub = document.getElementById(subId);
  if (!sub) return false;
  sub.innerHTML = '';
  const card = el('div', { class: 'external-link-card' });
  card.appendChild(svgIcon('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>', 'class="external-link-card__icon" width="32" height="32"'));
  const btn = el('a', {
    class: 'pill-btn pill-btn--primary',
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
  });
  btn.appendChild(el('span', { text: t(labelKey) }));
  btn.appendChild(svgIcon('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'));
  card.appendChild(btn);
  sub.appendChild(card);
  sub.appendChild(makePageFooter());
  return true;
}

function renderRestaurants(config) {
  const tab = document.querySelector('[data-subtab="restaurants"]');
  const extUrl = config.external_links?.restaurants;
  const hasItems = Array.isArray(config.restaurants) && config.restaurants.length > 0;
  if (config.sections?.restaurants === false || (!extUrl && !hasItems)) {
    if (tab) tab.classList.add('hidden');
    return;
  }
  if (tab) tab.classList.remove('hidden');

  // Link esterno: mostra il pulsante invece dell'elenco
  if (extUrl) {
    renderExternalLink('sub-restaurants', extUrl, 'discoverArea');
    return;
  }

  const sub = document.getElementById('sub-restaurants');
  sub.innerHTML = '';
  const priceSymbols = { low: '€', medium: '€€', high: '€€€' };

  config.restaurants.forEach(r => {
    const card = el('div', { class: 'restaurant-card' });
    const header = el('div', { class: 'restaurant-card__header' });
    header.appendChild(el('span', { class: 'restaurant-card__name', text: r.name }));
    if (r.price_range) {
      header.appendChild(el('span', { class: 'badge badge--price', text: priceSymbols[r.price_range] || r.price_range }));
    }
    card.appendChild(header);

    const meta = el('div', { class: 'restaurant-card__meta' });
    if (r.category) meta.appendChild(el('span', { class: 'badge badge--category', text: r.category }));
    if (r.distance) {
      const dist = el('span', { class: 'restaurant-card__distance' });
      dist.appendChild(svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', 'width="14" height="14"'));
      dist.appendChild(document.createTextNode(r.distance));
      meta.appendChild(dist);
    }
    card.appendChild(meta);

    if (r.description) card.appendChild(el('p', { class: 'restaurant-card__description', text: r.description }));

    const actions = el('div', { class: 'restaurant-card__actions' });
    if (r.google_maps_url) {
      const mapsBtn = el('a', {
        class: 'pill-btn pill-btn--secondary',
        href: r.google_maps_url,
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      mapsBtn.appendChild(svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'));
      mapsBtn.appendChild(el('span', { text: t('openMaps') }));
      actions.appendChild(mapsBtn);
    }
    if (r.phone) {
      const callBtn = el('a', { class: 'pill-btn pill-btn--secondary', href: `tel:${r.phone}` });
      callBtn.appendChild(svgIcon('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'));
      callBtn.appendChild(el('span', { text: t('call') }));
      actions.appendChild(callBtn);
    }
    if (actions.children.length) card.appendChild(actions);
    sub.appendChild(card);
  });
  sub.appendChild(makePageFooter());
}

function renderAttractions(config) {
  const tab = document.querySelector('[data-subtab="attractions"]');
  const extUrl = config.external_links?.attractions;
  const hasItems = Array.isArray(config.attractions) && config.attractions.length > 0;
  if (config.sections?.attractions === false || (!extUrl && !hasItems)) {
    if (tab) tab.classList.add('hidden');
    return;
  }
  if (tab) tab.classList.remove('hidden');

  if (extUrl) {
    renderExternalLink('sub-attractions', extUrl, 'discoverArea');
    return;
  }

  const sub = document.getElementById('sub-attractions');
  sub.innerHTML = '';

  config.attractions.forEach(a => {
    const card = el('div', { class: 'attraction-card' });
    const header = el('div', { class: 'attraction-card__header' });
    header.appendChild(el('span', { class: 'attraction-card__name', text: a.name }));
    card.appendChild(header);

    const meta = el('div', { class: 'attraction-card__meta' });
    if (a.category) meta.appendChild(el('span', { class: 'badge badge--category', text: a.category }));
    if (a.distance) {
      const dist = el('span', { class: 'restaurant-card__distance' });
      dist.appendChild(svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', 'width="14" height="14"'));
      dist.appendChild(document.createTextNode(a.distance));
      meta.appendChild(dist);
    }
    card.appendChild(meta);

    if (a.description) card.appendChild(el('p', { class: 'attraction-card__description', text: a.description }));
    if (a.tip) card.appendChild(el('div', { class: 'attraction-card__tip', text: a.tip }));

    const actions = el('div', { class: 'attraction-card__actions' });
    if (a.website) {
      const webBtn = el('a', {
        class: 'pill-btn pill-btn--secondary',
        href: a.website,
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      webBtn.appendChild(svgIcon('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'));
      webBtn.appendChild(el('span', { text: 'Website' }));
      actions.appendChild(webBtn);
    }
    if (actions.children.length) card.appendChild(actions);
    sub.appendChild(card);
  });
  sub.appendChild(makePageFooter());
}

function renderTransport(config) {
  const tab = document.querySelector('[data-subtab="transport"]');
  if (config.sections?.transport === false || !config.transport || Object.values(config.transport).every(v => !v)) {
    if (tab) tab.classList.add('hidden');
    return;
  }
  if (tab) tab.classList.remove('hidden');

  const sub = document.getElementById('sub-transport');
  sub.innerHTML = '';

  const TRANSPORT_ITEMS = [
    { key: 'parking', label: 'Parking', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>' },
    { key: 'bus', label: 'Bus', icon: '<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>' },
    { key: 'taxi', label: 'Taxi', icon: '<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><polyline points="9 18 12 15 9 12"/>' },
    { key: 'train', label: 'Train', icon: '<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-4-5"/><path d="m16 19 4-5"/><path d="M8 19h8"/>' },
    { key: 'airport', label: 'Airport', icon: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2a.4.4 0 0 0-.3.6l1 1.2 5.2 2.5L5.5 13l-2 1.5 2 2 2-2 1.5-2.2 2.5 5.2 1.2 1 .6-.3z"/>' },
  ];

  TRANSPORT_ITEMS.forEach(({ key, label, icon }) => {
    const text = config.transport[key];
    if (!text) return;
    const item = el('div', { class: 'transport-item' });
    const iconEl = el('div', { class: 'transport-item__icon' });
    iconEl.appendChild(svgIcon(icon));
    item.appendChild(iconEl);
    const content = el('div', { class: 'transport-item__content' });
    content.appendChild(el('div', { class: 'transport-item__title', text: label }));
    content.appendChild(el('p', { class: 'transport-item__text', text: text }));
    item.appendChild(content);
    sub.appendChild(item);
  });
  sub.appendChild(makePageFooter());
}

function renderFAQ(config) {
  const tabBtn = document.querySelector('[data-tab="faq"]');
  if (config.sections?.faq === false || !Array.isArray(config.faq) || config.faq.length === 0) {
    if (tabBtn) tabBtn.classList.add('hidden');
    return;
  }
  if (tabBtn) tabBtn.classList.remove('hidden');

  const section = document.getElementById('section-faq');
  section.innerHTML = '';
  const accordion = el('div', { class: 'accordion' });

  config.faq.forEach((item, i) => {
    const accItem = el('div', { class: 'accordion__item' });
    const trigger = el('button', {
      class: 'accordion__trigger',
      'aria-expanded': 'false',
    });
    trigger.appendChild(el('span', { text: item.question }));
    trigger.appendChild(svgIcon('<polyline points="6 9 12 15 18 9"/>', 'class="accordion__chevron"'));
    accItem.appendChild(trigger);

    const body = el('div', { class: 'accordion__body', role: 'region' });
    body.appendChild(el('div', { class: 'accordion__answer', text: item.answer }));
    accItem.appendChild(body);

    trigger.addEventListener('click', () => {
      const isOpen = accItem.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });

    accordion.appendChild(accItem);
  });

  section.appendChild(accordion);
  section.appendChild(makePageFooter());
}

function renderAll(config) {
  renderHome(config);
  renderAbout(config);
  renderCheckin(config);
  renderCheckout(config);
  renderRules(config);
  renderContacts(config);
  renderMap(config);
  renderRestaurants(config);
  renderAttractions(config);
  renderTransport(config);
  renderFAQ(config);
}
