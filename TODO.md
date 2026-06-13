# TODO.md — StayGuide
## Lista dei task per l'implementazione MVP

> **Regola:** implementa un task alla volta, nella sequenza indicata. Segna `[x]` quando completato. Non saltare fasi.

---

## FASE 0 — Setup progetto

- [ ] **0.1** Creare struttura cartelle: `css/`, `js/`, `js/vendor/`, `assets/`, `assets/icons/`
- [ ] **0.2** Scaricare `qrcode.min.js` da CDN e salvarlo in `js/vendor/qrcode.min.js` (file locale per uso offline)
- [ ] **0.3** Creare `index.html` con scheletro HTML5 completo (head con meta viewport, PWA tags, link CSS/JS, bottom tab bar, sezioni vuote)
- [ ] **0.4** Creare `manifest.json` con tutti i campi PWA richiesti (name, short_name, start_url, display, orientation, theme_color, icons)
- [ ] **0.5** Creare `service-worker.js` con strategia cache-first
- [ ] **0.6** Creare `css/reset.css` — CSS reset minimalista
- [ ] **0.7** Creare `css/tokens.css` — design tokens COMPLETI: colori, font, spacing (4/8/12/16/20/24/32/48/64px), border-radius (8/12/16/9999px), ombre (card, elevated, tab-bar)
- [ ] **0.8** Creare `css/components.css` — tutti i componenti: BottomTabBar, HeroCard, InfoCard, StepList, ContactCard, RestaurantCard, AttractionCard, Accordion, QRModal, SubTabBar, Badge, PillButton
- [ ] **0.9** Creare `css/app.css` — layout generale, bottom tab bar fissa (64px + safe-area), sezioni, sub-tab, padding-bottom body 80px
- [ ] **0.10** Creare `js/config-loader.js` — file vuoto con struttura e commenti
- [ ] **0.11** Creare `js/renderer.js` — file vuoto con struttura
- [ ] **0.12** Creare `js/qr.js` — file vuoto con struttura
- [ ] **0.13** Creare `js/map.js` — file vuoto con struttura
- [ ] **0.14** Creare `js/app.js` — entry point con inizializzazione
- [ ] **0.15** Creare `config.json` — config di esempio COMPLETO e realistico (Villa Rosa, Firenze) come da CLAUDE.md sezione 5c
- [ ] **0.16** Aggiungere immagine placeholder per `assets/property-photo.jpg` (gradiente colorato salvato come JPG)
- [ ] **0.17** Generare icone PWA placeholder (192x192 e 512x512) con sfondo #1A5F7A e testo "SG"
- [ ] **0.18** Verificare che la struttura si carichi senza errori in console

---

## FASE 1 — Config Loader, validazione e multilingua

- [ ] **1.1** Implementare `loadConfig()` in `config-loader.js`: fetch `config.json`, parse JSON, gestione errori
- [ ] **1.2** Implementare validazione campi obbligatori: `property.name`, `property.city`, `wifi.network`, `wifi.password`, `checkin.time`, `checkout.time`, `contacts[0]`
- [ ] **1.3** Se fetch fallisce: controllare `localStorage` per versione cached. Se non esiste, mostrare error page
- [ ] **1.4** Implementare error page: sfondo bianco, icona warning SVG, titolo "Guida non disponibile", testo esplicativo. NO alert(), NO console visibili
- [ ] **1.5** Applicare `accent_color` dal config come CSS custom property `--property-accent` su `document.documentElement`
- [ ] **1.6** Implementare oggetto `UI_STRINGS` con traduzioni IT/EN (vedi mapping in CLAUDE.md sezione 5b)
- [ ] **1.7** Leggere `property.language` dal config ("it" default) e selezionare testi UI corrispondenti
- [ ] **1.8** Salvare config in `window.STAY_CONFIG` e in `localStorage` per uso offline
- [ ] **1.9** Verificare con console.log che il config viene caricato, validato e le custom properties applicate

---

## FASE 2 — Bottom Tab Bar e navigazione

- [ ] **2.1** Implementare in `index.html` la bottom tab bar con 5 voci: Home, Info, Contatti, Dintorni, FAQ
- [ ] **2.2** Ogni voce ha icona SVG inline (path esatti da CLAUDE.md sezione 6a) + label testuale dal mapping lingua
- [ ] **2.3** Implementare in `app.js` la navigazione: tap su tab -> mostra sezione, nasconde le altre
- [ ] **2.4** Classe `.active` sulla tab selezionata: colore icona e label = `--color-accent`
- [ ] **2.5** Tab bar: `position: fixed; bottom: 0; height: 64px` con `padding-bottom: env(safe-area-inset-bottom)` per iPhone con notch
- [ ] **2.6** Ombra tab bar: `0 -1px 8px rgba(0,0,0,0.1)`
- [ ] **2.7** Body: `padding-bottom: 80px` per evitare sovrapposizione contenuto
- [ ] **2.8** Animazione fade tra sezioni (CSS opacity transition, 200ms)
- [ ] **2.9** Salvare tab attiva in `sessionStorage` per mantenere stato al refresh
- [ ] **2.10** Se array `faq` vuoto nel config, nascondere la tab FAQ dalla bottom bar
- [ ] **2.11** Verificare su mobile 375px: tab bar visibile, tappabile (touch target >= 44px), nessun overflow

---

## FASE 3 — Tab Home / Benvenuto

- [ ] **3.1** Creare sezione Home in `index.html` (visibile di default)
- [ ] **3.2** Hero image: `<img>` full-width con overlay gradiente scuro (`linear-gradient(transparent 40%, rgba(0,0,0,0.7))`) e testo bianco
- [ ] **3.3** Mostrare: nome proprieta, citta, messaggio di benvenuto dal config
- [ ] **3.4** Se `property.photo` vuota: sfondo con gradiente da `accent_color` a versione piu scura
- [ ] **3.5** Card riassuntiva sotto hero: icona + "Check-in: 15:00" | "Check-out: 11:00" | "Wi-Fi: villa2024!"
- [ ] **3.6** 3 bottoni rapidi sotto card: "Wi-Fi", "Check-in", "Contatti" — al tap navigano alla tab e sub-tab corretta
- [ ] **3.7** Implementare `renderHome(config)` in `renderer.js`
- [ ] **3.8** Gestire fallback immagine: se `<img>` non carica (evento `onerror`), sostituire con gradiente
- [ ] **3.9** Verificare leggibilita testo su immagine su vari sfondi (overlay deve essere abbastanza scuro)

---

## FASE 4 — Tab Info Casa (con sub-tab)

- [ ] **4.1** Creare sezione Info Casa in `index.html` con sub-tab bar orizzontale: Wi-Fi | Check-in | Check-out | Regole
- [ ] **4.2** Implementare navigazione sub-tab in `app.js` (stessa logica bottom tab ma interna)
- [ ] **4.3** **Sub-tab Wi-Fi**: nome rete (testo grande), password (con pulsante copia), note, pulsante "Mostra QR"
- [ ] **4.4** Implementare in `qr.js`: usare `js/vendor/qrcode.min.js` (locale!), generare QR con stringa `WIFI:T:WPA;S:{ssid};P:{password};;`
- [ ] **4.5** Modale QR: overlay scuro semi-trasparente, card centrata con QR code e testo "Inquadra per connetterti". Chiudi con X o tap fuori.
- [ ] **4.6** Pulsante "Copia password": `navigator.clipboard.writeText()`, cambiare testo bottone in "Copiata!" per 2 secondi
- [ ] **4.7** **Sub-tab Check-in**: badge orario grande, nota early check-in (se presente), lista istruzioni con numeri step (componente StepList)
- [ ] **4.8** **Sub-tab Check-out**: badge orario grande, nota late checkout (se presente), lista istruzioni step
- [ ] **4.9** **Sub-tab Regole**: lista regole con icone appropriate per ogni regola (fumo, animali, orario, feste, ospiti)
- [ ] **4.10** Implementare `renderWifi()`, `renderCheckin()`, `renderCheckout()`, `renderRules()` in `renderer.js`
- [ ] **4.11** Se `rules` array vuoto: nascondere sub-tab "Regole"
- [ ] **4.12** Se `checkin.instructions` vuoto: mostrare solo orario senza lista step
- [ ] **4.13** Verificare su mobile: sub-tab scrollabile orizzontalmente se troppe voci

---

## FASE 5 — Tab Contatti

- [ ] **5.1** Creare sezione Contatti in `index.html`
- [ ] **5.2** ContactCard: avatar cerchio con iniziali colorate, nome, tipo (badge), orario disponibilita
- [ ] **5.3** Pulsante "Chiama" con `href="tel:{numero}"` — icon telefono + label
- [ ] **5.4** Pulsante "WhatsApp" (solo se `whatsapp: true`): `https://wa.me/{numero_pulito}` — rimuovere +, spazi, trattini
- [ ] **5.5** Ordinamento: owner prima, poi emergency, poi medical, poi altri
- [ ] **5.6** Badge colorato: "Proprietario" = verde `--color-success`, "Emergenze" = rosso `--color-danger`, "Medico" = arancio `--color-warning`
- [ ] **5.7** Implementare `renderContacts(config)` in `renderer.js`
- [ ] **5.8** Verificare link `tel:` e `wa.me` funzionino su mobile

---

## FASE 6 — Tab Dintorni (con sub-tab)

- [ ] **6.1** Creare sezione Dintorni in `index.html` con sub-tab: Mappa | Ristoranti | Attrazioni | Trasporti
- [ ] **6.2** **Mappa**: implementare in `map.js` — se `embed_url` presente: iframe responsive. Se solo `google_maps_url`: bottone "Apri su Google Maps"
- [ ] **6.3** Offline fallback mappa: mostrare indirizzo testuale + messaggio "Mappa non disponibile offline"
- [ ] **6.4** Nota sotto mappa (da `map.walking_notes`)
- [ ] **6.5** **Ristoranti**: RestaurantCard — nome, badge categoria, badge prezzo (`low`=1 euro, `medium`=2 euro, `high`=3 euro), distanza, descrizione, link mappa, telefono
- [ ] **6.6** **Attrazioni**: AttractionCard — nome, badge categoria, distanza, descrizione, link sito, tip evidenziato con sfondo `--color-surface-2` e bordo sinistro colorato
- [ ] **6.7** **Trasporti**: sezioni separate (parcheggio/bus/taxi/treno/aeroporto), ognuna con icona SVG + titolo + testo
- [ ] **6.8** Implementare `renderMap()`, `renderRestaurants()`, `renderAttractions()`, `renderTransport()` in `renderer.js`
- [ ] **6.9** Se array `restaurants` vuoto: nascondere sub-tab "Ristoranti". Idem per `attractions`. Se `map` vuoto: nascondere sub-tab "Mappa". Se `transport` vuoto: nascondere sub-tab "Trasporti"
- [ ] **6.10** Link Google Maps: `target="_blank" rel="noopener noreferrer"`
- [ ] **6.11** Verificare layout card su mobile: full-width, nessun overflow

---

## FASE 7 — Tab FAQ (Accordion)

- [ ] **7.1** Creare sezione FAQ in `index.html`
- [ ] **7.2** Accordion CSS: domanda cliccabile con sfondo `--color-surface`, risposta collassata
- [ ] **7.3** Animazione: `max-height` transition 300ms ease + padding transition
- [ ] **7.4** Icona chevron a destra della domanda, ruota 180 gradi quando aperta
- [ ] **7.5** Implementare `renderFAQ(config)` in `renderer.js`
- [ ] **7.6** Se array `faq` vuoto: nascondere la tab FAQ dalla bottom bar (gia gestito in Fase 2)
- [ ] **7.7** `aria-expanded="true/false"` su ogni domanda, navigazione da tastiera con Enter/Space
- [ ] **7.8** Piu FAQ possono essere aperte contemporaneamente (NO comportamento "solo una alla volta")

---

## FASE 8 — PWA e Offline

- [ ] **8.1** Completare `service-worker.js` con lista COMPLETA di tutti i file: index.html, tutti CSS, tutti JS (incluso vendor/qrcode.min.js), config.json, property-photo.jpg, icone
- [ ] **8.2** Registrare SW in `app.js` con check `'serviceWorker' in navigator`
- [ ] **8.3** Gestire update SW: evento `controllerchange` -> mostrare banner discreto "Aggiornamento disponibile — ricarica"
- [ ] **8.4** Testare installazione PWA su Chrome (Add to Home Screen)
- [ ] **8.5** Testare offline: disattivare rete, tutte le sezioni devono funzionare tranne iframe mappa
- [ ] **8.6** Iframe mappa offline: nascondere iframe, mostrare indirizzo + "Mappa non disponibile offline"
- [ ] **8.7** Verificare Lighthouse PWA score >= 90

---

## FASE 9 — Rifinitura UX e Polish

- [ ] **9.1** Rivedere tutti i testi UI — tono accogliente, non burocratico, coerente IT/EN
- [ ] **9.2** Micro-animazioni: card entrance (`opacity 0->1, translateY 10px->0`), tab switch fade, accordion smooth
- [ ] **9.3** Haptic feedback: CSS `:active { transform: scale(0.97) }` su bottoni e card cliccabili
- [ ] **9.4** Footer discreto: "Powered by StayGuide — Wise in Blue" con link, padding-bottom extra
- [ ] **9.5** Verificare `aria-label` su tutti i bottoni, link e controlli interattivi
- [ ] **9.6** `meta og:` tags: titolo = nome proprieta, descrizione = greeting, immagine = property-photo
- [ ] **9.7** Contrasto WCAG AA: verificare tutte le combinazioni testo/sfondo (minimo 4.5:1)
- [ ] **9.8** Testare con 3 diversi `accent_color` (rosso, verde, blu scuro) — leggibilita sempre OK
- [ ] **9.9** Creare secondo config di esempio: proprieta al mare (es. "Casa Blu, Positano") per testare flessibilita

---

## FASE 10 — Verifica finale e documentazione deploy

- [ ] **10.1** Test end-to-end desktop Chrome: tutte le tab, sub-tab, QR, contatti, accordion
- [ ] **10.2** Test end-to-end mobile Chrome Android
- [ ] **10.3** Test end-to-end mobile Safari iOS (attenzione a safe-area e PWA standalone)
- [ ] **10.4** Verificare `tel:` e `wa.me` su mobile reale
- [ ] **10.5** Verificare QR code Wi-Fi: scansionare con telefono e connettersi
- [ ] **10.6** Verificare: cambiare config.json -> tutti i contenuti cambiano senza toccare codice
- [ ] **10.7** Verificare: sezioni con dati vuoti spariscono senza errori JS in console
- [ ] **10.8** Verificare: usare `textContent` ovunque (mai `innerHTML` con dati dal config)
- [ ] **10.9** Creare `DEPLOY.md` con istruzioni passo-passo per deploy nuova proprieta
- [ ] **10.10** Creare `config-template.json` con tutti i campi vuoti/placeholder e commenti guida
- [ ] **10.11** Test finale: copiare cartella, sostituire config.json con template compilato, verificare che funzioni

---

## Note per Claude Code

- Ogni fase puo essere implementata in una singola sessione
- Inizia sempre dalla FASE 0 se e un progetto nuovo
- Il file `config.json` e la fonte di verita per tutti i contenuti
- Se un campo del config e assente, la sezione corrispondente deve sparire silenziosamente — ZERO errori in console
- NON hardcodare mai contenuti: tutto viene dal config
- Il file `CLAUDE.md` e la fonte di verita per le decisioni architetturali
- Testa sempre con almeno 2 config diversi per verificare la flessibilita
- Usa `textContent` e MAI `innerHTML` per dati provenienti dal config (sicurezza XSS)
- La libreria qrcode.min.js va servita LOCALMENTE da `js/vendor/`, non da CDN
