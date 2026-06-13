function renderMapSection(config) {
  const sub = document.getElementById('sub-map');
  if (!sub) return;
  sub.innerHTML = '';

  const wrapper = el('div', { class: 'map-wrapper' });

  if (!navigator.onLine && !document.getElementById('sub-map').dataset.loaded) {
    renderMapOffline(wrapper, config);
    sub.appendChild(wrapper);
    return;
  }

  if (config.map?.embed_url) {
    const container = el('div', { class: 'map-container' });
    const iframe = document.createElement('iframe');
    iframe.src = config.map.embed_url;
    iframe.loading = 'lazy';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.setAttribute('title', 'Mappa proprieta');
    iframe.onerror = () => renderMapOffline(container, config);
    container.appendChild(iframe);
    wrapper.appendChild(container);
    sub.dataset.loaded = '1';
  } else if (config.map?.google_maps_url) {
    const mapCard = el('div', { class: 'map-card' });
    const mapCardIcon = el('div', { class: 'map-card__icon' });
    mapCardIcon.appendChild(svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', 'width="32" height="32"'));
    mapCard.appendChild(mapCardIcon);
    if (config.property?.address) {
      mapCard.appendChild(el('p', { class: 'map-card__address', text: config.property.address }));
    }
    const mapsBtn = el('a', {
      class: 'pill-btn pill-btn--primary',
      href: config.map.google_maps_url,
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    mapsBtn.appendChild(svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'));
    mapsBtn.appendChild(el('span', { text: t('openMaps') }));
    mapCard.appendChild(mapsBtn);
    wrapper.appendChild(mapCard);
  } else {
    renderMapOffline(wrapper, config);
  }

  if (config.map?.walking_notes) {
    wrapper.appendChild(el('p', { class: 'note-card', text: config.map.walking_notes }));
  }

  // Indicazioni dettagliate (testo lungo)
  if (config.map?.directions_text) {
    const dir = el('div', { class: 'directions-block' });
    dir.appendChild(el('h3', { class: 'directions-block__title', text: t('howToFindUs') }));
    config.map.directions_text.split('\n').filter(line => line.trim()).forEach(line => {
      dir.appendChild(el('p', { class: 'directions-block__text', text: line }));
    });
    wrapper.appendChild(dir);
  }

  // Foto delle indicazioni (cancello, portone, parcheggio…)
  if (Array.isArray(config.map?.directions_photos) && config.map.directions_photos.length) {
    const gallery = el('div', { class: 'directions-photos' });
    config.map.directions_photos.forEach(photo => {
      if (!photo.url) return;
      const fig = el('figure', { class: 'directions-photo' });
      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.caption || t('howToFindUs');
      img.loading = 'lazy';
      img.className = 'directions-photo__img';
      img.onerror = () => fig.remove();
      fig.appendChild(img);
      if (photo.caption) {
        fig.appendChild(el('figcaption', { class: 'directions-photo__caption', text: photo.caption }));
      }
      gallery.appendChild(fig);
    });
    if (gallery.children.length) wrapper.appendChild(gallery);
  }

  sub.appendChild(wrapper);
}

function renderMapOffline(container, config) {
  const offline = el('div', { class: 'map-offline' });
  offline.appendChild(svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', 'class="map-offline__icon" width="48" height="48"'));
  offline.appendChild(el('div', { class: 'map-offline__title', text: t('mapUnavailable') }));
  offline.appendChild(el('p', { text: t('mapUnavailableText') }));
  if (config.property?.address) {
    offline.appendChild(el('strong', { text: config.property.address }));
  }
  if (config.map?.google_maps_url) {
    const link = el('a', {
      class: 'pill-btn pill-btn--secondary',
      href: config.map.google_maps_url,
      target: '_blank',
      rel: 'noopener noreferrer',
      text: t('openMaps'),
    });
    offline.appendChild(link);
  }
  container.appendChild(offline);
}
