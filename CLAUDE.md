# CLAUDE.md — StayGuide

> **🧭 Contesto ecosistema (2026-06-12):** StayGuide è l'implementazione di **BlueWelcome**,
> programma dell'ecosistema Blue già a catalogo (coming soon). Le decisioni strategiche
> e architetturali (multi-tenant via percorso, Supabase per programma, naming in valutazione
> BlueWelcome vs StayGuide) vivono in `..\Programmi WiB\CLAUDE.md`; la scheda di questo
> programma è `..\Programmi WiB\Programmi Esistenti\stayguide.md`. In roadmap è il candidato
> "1-bis" — lancio rapido dopo/insieme a BlueBreakfast. **Leggi quei file prima di decisioni
> di prodotto**; per lavoro tecnico sul prototipo basta questo file.

## Guida operativa per Claude Code

---

## 1. Contesto del progetto

**Wise in Blue** e una societa di consulenza specializzata in vacation rental.

**StayGuide** e una PWA (Progressive Web App) che fornisce agli ospiti di una casa vacanza una guida digitale completa: Wi-Fi, istruzioni check-in/check-out, regole, contatti, mappa, ristoranti, attrazioni e FAQ. E personalizzabile casa per casa tramite un file di configurazione JSON.

### Obiettivi del prodotto
- **Ospite**: trova tutto in un posto, anche offline, dal telefono
- **Proprietario**: aggiorna facilmente i contenuti senza toccare il codice
- **Wise in Blue**: strumento differenziante nei pacchetti di gestione

---

## 2. Stack tecnico obbligatorio

| Layer | Tecnologia |
|-------|-----------|
| Struttura | HTML5 semantico |
| Stile | CSS vanilla (NO Tailwind, NO Bootstrap) |
| Logica | JavaScript vanilla ES6+ (NO framework) |
| Dati | config.json — file JSON editabile per ogni proprieta |
| PWA | Web App Manifest + Service Worker |
| Font | Google Fonts — Inter (weights 400, 500, 600, 700) |
| Icone tab bar | SVG inline (disegnate a mano o copiate da Lucide, vedi sezione 5b) |
| QR Code | Libreria locale `js/vendor/qrcode.min.js` (NON da CDN — deve funzionare offline) |
| Deploy | File statici su qualsiasi hosting (Netlify, GitHub Pages, etc.) |

**Regola critica:** Tutto deve funzionare offline dopo il primo caricamento. Nessun asset puo venire da CDN esterni tranne Google Fonts (che ha fallback locale).

### Dove trovare qrcode.min.js
Scaricare `qrcode.min.js` (versione 1.0.0) da: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`
Salvare in `js/vendor/qrcode.min.js` e includerlo con `<script src="js/vendor/qrcode.min.js"></script>` in index.html.

---

## 3. Tag HTML obbligatori nel `<head>`

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#1A5F7A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="assets/icons/icon-192.png">
<title>StayGuide</title>
```

---

## 4. Architettura dei file

```
stayguide/
|-- index.html              <- SPA unica con sezioni
|-- manifest.json           <- PWA manifest
|-- service-worker.js       <- Cache offline
|-- config.json             <- Configurazione proprieta (UNICO FILE DA MODIFICARE)
|-- css/
|   |-- reset.css
|   |-- tokens.css          <- Design tokens
|   |-- components.css      <- Componenti UI riusabili
|   `-- app.css             <- Layout e stili specifici
|-- js/
|   |-- config-loader.js    <- Carica e valida config.json
|   |-- renderer.js         <- Renderizza ogni sezione dal config
|   |-- qr.js               <- Genera QR code Wi-Fi
|   |-- map.js              <- Gestisce embed mappa
|   |-- app.js              <- Entry point e navigazione
|   `-- vendor/
|       `-- qrcode.min.js   <- Libreria QR locale (offline-safe)
`-- assets/
    |-- property-photo.jpg  <- Foto hero proprieta
    `-- icons/              <- Icone PWA 192x192 e 512x512
```

---

## 5. Il file config.json

### 5a. Schema di validazione

**Campi OBBLIGATORI** (se mancano, mostrare errore):
- `property.name` (string)
- `property.city` (string)
- `wifi.network` (string)
- `wifi.password` (string)
- `checkin.time` (string)
- `checkout.time` (string)
- `contacts` (array con almeno 1 elemento)

**Campi OPZIONALI** (se mancano, la sezione si nasconde):
- `property.photo` — se vuoto, usare gradiente colorato
- `property.greeting` — se vuoto, non mostrare messaggio
- `property.accent_color` — se vuoto, usare #1A5F7A
- `property.logo` — se vuoto, non mostrare
- `property.language` — "it" o "en" (default: "it")
- `checkin.instructions` — se vuoto, mostrare solo orario
- `checkout.instructions` — se vuoto, mostrare solo orario
- `rules` — se array vuoto, nascondere sub-tab Regole
- `map` — se vuoto, nascondere sub-tab Mappa
- `restaurants` — se array vuoto, nascondere sub-tab Ristoranti
- `attractions` — se array vuoto, nascondere sub-tab Attrazioni
- `transport` — se vuoto, nascondere sub-tab Trasporti
- `faq` — se array vuoto, nascondere tab FAQ dalla bottom bar

### 5b. Supporto lingue

Il campo `property.language` ("it" o "en") controlla i testi UI fissi dell app.
I testi UI fissi sono le label delle tab, i titoli delle sezioni e i pulsanti.

Mapping testi UI:
```
IT                          EN
"Home"                      "Home"
"Info Casa"                 "House Info"
"Contatti"                  "Contacts"
"Dintorni"                  "Nearby"
"FAQ"                       "FAQ"
"Wi-Fi"                     "Wi-Fi"
"Check-in"                  "Check-in"
"Check-out"                 "Check-out"
"Regole"                    "Rules"
"Mappa"                     "Map"
"Ristoranti"                "Restaurants"
"Attrazioni"                "Attractions"
"Trasporti"                 "Transport"
"Chiama"                    "Call"
"Scrivi su WhatsApp"        "WhatsApp"
"Copia password"            "Copy password"
"Mostra QR"                 "Show QR"
"Inquadra per connetterti"  "Scan to connect"
"Powered by StayGuide"      "Powered by StayGuide"
"Proprietario"              "Owner"
"Emergenze"                 "Emergency"
"Medico"                    "Medical"
```

I contenuti testuali (greeting, istruzioni, nomi ristoranti, etc.) restano come scritti nel config — il proprietario li scrive nella lingua degli ospiti.

### 5c. Esempio config.json completo

```json
{
  "property": {
    "name": "Villa Rosa",
    "city": "Firenze",
    "address": "Via delle Rose 12, 50100 Firenze FI",
    "photo": "assets/property-photo.jpg",
    "greeting": "Benvenuto a Villa Rosa! Siamo felici di ospitarti.",
    "accent_color": "#E63946",
    "logo": "",
    "language": "it"
  },
  "wifi": {
    "network": "VillaRosa_WiFi",
    "password": "villa2024!",
    "notes": "La rete funziona in tutta la casa e in giardino."
  },
  "checkin": {
    "time": "15:00",
    "early_checkin": "Contattaci per disponibilita",
    "instructions": [
      "Trova la cassettina con il codice vicino alla porta principale",
      "Il codice e: 1234",
      "Entra e lascia il documento sul tavolo",
      "Il parcheggio e nel cortile posteriore"
    ]
  },
  "checkout": {
    "time": "11:00",
    "late_checkout": "Contattaci per disponibilita (supplemento possibile)",
    "instructions": [
      "Lascia le chiavi sul tavolo della cucina",
      "Porta fuori la spazzatura dal bidone sotto il lavello",
      "Chiudi tutte le finestre e il portone principale"
    ]
  },
  "rules": [
    "Non fumatori (incluso balcone)",
    "Non sono ammessi animali domestici",
    "Silenzio dalle 22:00 alle 08:00",
    "Non sono ammesse feste o eventi",
    "Massimo 4 ospiti"
  ],
  "contacts": [
    {
      "name": "Marco (proprietario)",
      "phone": "+39 333 1234567",
      "whatsapp": true,
      "type": "owner",
      "available": "9:00-21:00"
    },
    {
      "name": "Emergenze",
      "phone": "112",
      "whatsapp": false,
      "type": "emergency",
      "available": "24/7"
    },
    {
      "name": "Ospedale piu vicino",
      "phone": "055 794111",
      "whatsapp": false,
      "type": "medical",
      "available": "24/7"
    }
  ],
  "map": {
    "google_maps_url": "https://goo.gl/maps/XXXXXXXX",
    "embed_url": "https://www.google.com/maps/embed?pb=...",
    "walking_notes": "Il centro storico e a 10 minuti a piedi."
  },
  "restaurants": [
    {
      "name": "Trattoria da Mario",
      "category": "Cucina toscana",
      "price_range": "medium",
      "distance": "5 min a piedi",
      "description": "Ottimo per pranzo, ambiente familiare, prenotare al venerdi.",
      "google_maps_url": "https://goo.gl/maps/YYYYYYY",
      "phone": "055 218550"
    },
    {
      "name": "Gelateria Vivoli",
      "category": "Gelato",
      "price_range": "low",
      "distance": "8 min a piedi",
      "description": "Il miglior gelato artigianale di Firenze dal 1930.",
      "google_maps_url": "https://goo.gl/maps/ZZZZZZZ",
      "phone": ""
    }
  ],
  "attractions": [
    {
      "name": "Uffizi",
      "category": "Museo",
      "distance": "10 min a piedi",
      "description": "Uno dei musei piu importanti al mondo. Prenotare online.",
      "website": "https://www.uffizi.it",
      "tip": "Arriva appena apre per evitare la fila."
    },
    {
      "name": "Piazzale Michelangelo",
      "category": "Panorama",
      "distance": "25 min a piedi",
      "description": "Vista mozzafiato su tutta Firenze. Perfetto al tramonto.",
      "website": "",
      "tip": "Porta una bottiglia di vino e goditi il tramonto."
    }
  ],
  "transport": {
    "parking": "Parcheggio privato gratuito nel cortile. Accesso da Via Laterale.",
    "bus": "Linea 14 fermata a 200m (direzione centro ogni 10 minuti).",
    "taxi": "MyTaxi app o chiama 055 4390.",
    "train": "Stazione SMN a 15 minuti a piedi o 5 in taxi.",
    "airport": "Aeroporto Amerigo Vespucci: 20 min in taxi (circa 25 euro)."
  },
  "faq": [
    {
      "question": "C'e il condizionatore?",
      "answer": "Si, in ogni camera. Telecomando nel cassetto del comodino."
    },
    {
      "question": "Dove butto la spazzatura?",
      "answer": "Bidoni colorati in strada: verde (vetro/lattine), giallo (plastica), blu (carta), grigio (indifferenziata)."
    },
    {
      "question": "Posso fare il check-in anticipato?",
      "answer": "Scriveteci su WhatsApp: facciamo del nostro meglio per accomodarvi."
    }
  ]
}
```

**Nota su `price_range`**: usare i valori `"low"`, `"medium"`, `"high"`. Il renderer li converte in simboli euro visivi.

---

## 6. Le sezioni dell app (navigazione bottom-tab)

La navigazione principale e una **bottom tab bar** con 5 voci visibili.

### 6a. Icone SVG per le 5 tab

Usare queste icone Lucide (copiarle come SVG inline, NON caricare da CDN):

| Tab | Nome icona Lucide | SVG path |
|-----|-------------------|----------|
| Home | `home` | `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>` |
| Info Casa | `info` | `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>` |
| Contatti | `phone` | `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>` |
| Dintorni | `map-pin` | `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>` |
| FAQ | `help-circle` | `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>` |

Formato SVG base: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{path}</svg>`

### 6b. Tab 1 — Home / Benvenuto
- Foto hero della proprieta (full-width, con overlay gradiente scuro dal basso)
- Nome proprieta e citta in bianco sopra overlay
- Messaggio di benvenuto
- Card riassuntiva: orario check-in, check-out, WiFi password
- 3 bottoni rapidi verso le sezioni piu usate (Wi-Fi, Check-in, Contatti)

### 6c. Tab 2 — Info Casa
Sotto-sezioni navigabili con sub-tab bar orizzontale:
- **Wi-Fi**: rete + password + pulsante copia + pulsante QR code
- **Check-in**: orario, nota early check-in, istruzioni step-by-step
- **Check-out**: orario, nota late checkout, istruzioni step-by-step
- **Regole**: lista con icone (nascosta se array vuoto)

### 6d. Tab 3 — Contatti
- ContactCard per ogni contatto: avatar iniziali, nome, tipo (badge colorato), orario
- Pulsante "Chiama" (`tel:`) e "WhatsApp" (`wa.me/`) dove applicabile
- Ordinamento: owner prima, poi emergency, poi medical, poi altri

### 6e. Tab 4 — Dintorni
Sotto-sezioni con sub-tab bar orizzontale:
- **Mappa**: iframe Google Maps o bottone link esterno. Offline: messaggio fallback
- **Ristoranti**: RestaurantCard con badge prezzo/categoria/distanza
- **Attrazioni**: AttractionCard con tip evidenziato
- **Trasporti**: sezioni separate con icone

### 6f. Tab 5 — FAQ
- Accordion: domanda cliccabile, risposta expand/collapse
- Icona chevron ruota con animazione
- Nascondere tab dalla bottom bar se array FAQ vuoto

---

## 7. Design System

### Colori
```css
:root {
  --color-primary: #1A5F7A;
  --color-accent: var(--property-accent, #1A5F7A);
  --color-bg: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-surface-2: #F5F5F5;
  --color-text: #1A202C;
  --color-text-muted: #718096;
  --color-text-light: #A0AEC0;
  --color-border: #E2E8F0;
  --color-success: #2D9B6E;
  --color-warning: #F4A261;
  --color-danger: #E63946;
  --color-overlay: rgba(0, 0, 0, 0.45);
}
```

### Tipografia
- Font: `Inter` da Google Fonts
- Weights: 400 (body), 500 (label), 600 (titoli card), 700 (titoli sezione)
- Base: 16px
- Scale: 12px / 14px / 16px / 18px / 20px / 24px / 32px

### Spaziatura
- Base unit: 4px
- Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64px
- Padding card: 16px
- Gap tra card: 12px
- Margine sezione: 24px

### Border radius
- Small: 8px (badge, chip)
- Medium: 12px (card, input)
- Large: 16px (modale)
- Full: 9999px (pill button, avatar)

### Ombre
- Card: `0 2px 8px rgba(0, 0, 0, 0.06)`
- Elevated (modale, bottom bar): `0 -2px 12px rgba(0, 0, 0, 0.08)`
- Tab bar: `0 -1px 8px rgba(0, 0, 0, 0.1)`

### Bottom tab bar
- Altezza: 64px (+ safe area bottom su iPhone con notch)
- Background: bianco con ombra superiore
- Icona: 24x24, colore `--color-text-muted` (inattiva) / `--color-accent` (attiva)
- Label: 10px, stesse regole colore
- Padding bottom pagina: almeno 80px per evitare sovrapposizione

---

## 8. Gestione errori e stati vuoti

### Se config.json non viene trovato (errore fetch)
Mostrare pagina di errore semplice:
- Sfondo bianco, icona warning grande
- Titolo: "Guida non disponibile"
- Testo: "Non e stato possibile caricare le informazioni. Controlla la connessione o contatta il proprietario."
- NO alert() o console.error visibili all utente

### Se JSON e malformato (errore parse)
Stesso layout di errore, testo: "Si e verificato un errore nel caricamento. Contatta il proprietario."

### Se foto proprieta non carica (errore immagine)
Fallback a gradiente colorato usando `accent_color` (es. gradiente da accent_color a versione piu scura).

### Se un campo opzionale e vuoto
La sezione/sub-tab corrispondente sparisce dal DOM. Nessun errore, nessun elemento vuoto visibile.

---

## 9. Logica tecnica chiave

### config-loader.js
- `async loadConfig()`: fetch `config.json`, parse JSON, validare campi obbligatori
- Se fetch fallisce: controllare se esiste in localStorage (cache offline)
- Se validazione fallisce: mostrare error page con messaggio chiaro
- Applicare `accent_color` come CSS custom property `--property-accent`
- Applicare `language` per selezionare testi UI
- Salvare config in `window.STAY_CONFIG` e in `localStorage`

### renderer.js
- `renderAll(config)`: chiama tutti i renderer
- Una funzione per sezione: `renderHome()`, `renderWifi()`, `renderCheckin()`, `renderCheckout()`, `renderRules()`, `renderContacts()`, `renderMap()`, `renderRestaurants()`, `renderAttractions()`, `renderTransport()`, `renderFAQ()`
- Ogni funzione controlla se i dati esistono prima di renderizzare
- Usare `document.createElement()` e `textContent` (mai `innerHTML` con dati utente per sicurezza)

### qr.js
- Usa `js/vendor/qrcode.min.js` (file locale, NON CDN)
- Genera QR con stringa Wi-Fi standard: `WIFI:T:WPA;S:{ssid};P:{password};;`
- Mostra in modale con overlay scuro, card centrata, istruzione

### map.js
- Se `config.map.embed_url` presente: crea iframe Google Maps
- Se solo `google_maps_url`: mostra bottone "Apri su Google Maps"
- Offline: mostra messaggio "Mappa non disponibile offline" + indirizzo testuale

### app.js
- Inizializzazione: loadConfig() -> renderAll() -> registerSW()
- Navigazione bottom tab: mostra/nasconde sezioni
- Navigazione sub-tab: mostra/nasconde sotto-sezioni
- Salva tab attiva in sessionStorage per mantenere stato al refresh

### service-worker.js
- Cache-first per TUTTI i file statici incluso config.json, foto, e qrcode.min.js
- Lista file da cachare aggiornata dopo ogni modifica

---

## 10. PWA requirements

**manifest.json**:
- `name`: "StayGuide"
- `short_name`: "StayGuide"
- `start_url`: "./"
- `display`: "standalone"
- `orientation`: "portrait"
- `theme_color`: "#1A5F7A"
- `background_color`: "#FAFAFA"
- `icons`: 192x192 e 512x512 (PNG)

---

## 11. Deploy per nuova proprieta

1. Copia la cartella `stayguide/`
2. Modifica SOLO `config.json` con i dati della nuova casa
3. Sostituisci `assets/property-photo.jpg` con la foto della proprieta
4. Pubblica su hosting (subfolder: `wiseinblue.com/guide/nome-casa`)
5. Genera QR code dal URL e stampalo per la proprieta

---

## 12. Regole generali per Claude Code

1. `config.json` e l unico file da modificare per personalizzare la guida
2. Nessun contenuto hardcodato in HTML o JS — tutto viene dal config
3. Se un campo del config e assente/vuoto, la sezione corrispondente va nascosta (zero errori)
4. Mobile-first: testa su viewport 375px
5. Bottom tab bar fissa: `position: fixed; bottom: 0`
6. Immagini: `alt` descrittivi e `loading="lazy"`
7. Link esterni: `target="_blank" rel="noopener noreferrer"`
8. Telefoni: `href="tel:{numero}"` cliccabili su mobile
9. WhatsApp: `https://wa.me/{numero}` (rimuovere + e spazi dal numero)
10. Nessun framework JS, nessun build step — file statici puri
11. Usare `textContent` non `innerHTML` per dati dal config (sicurezza)
12. La libreria qrcode.min.js va nella cartella `js/vendor/`, NON da CDN
