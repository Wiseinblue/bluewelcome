# BlueWelcome — Prossimi passi e decisioni

> Questo file raccoglie le decisioni prese e il lavoro da fare, in ordine.
> Il vecchio `TODO.md` è la spec di costruzione originale (StayGuide) — qui invece c'è
> cosa fare DA ORA in poi come programma Blue. Aggiornare man mano.

---

## Fatto (2026-06-13)

- [x] Rinominato StayGuide → **BlueWelcome** (nomi visibili + chiavi tecniche interne)
- [x] Restyling **palette Blue** (#1a56db primario, #3b82f6 light) su guida ospite e admin
- [x] Copiato `Logo-WiB.png` negli assets (mancava — footer mostrava immagine rotta)
- [x] Cartella spostata in `Programmi WiB\bluewelcome\` (parte dell'ecosistema Blue)
- [x] Sezione **"How to find us"** potenziata: link Google Maps (già c'era) + indicazioni
      testuali dettagliate (`map.directions_text`) + **foto indicazioni** (`map.directions_photos`,
      lista di {url, caption}). Gestibili dall'admin (Nearby → Map).
- [x] **Doppia modalità foto indicazioni** (2026-06-13): upload da file/telefono CON compressione
      automatica (riusa `resizeImageToBase64`, max 1200px qualità 0.82) + incolla URL + **drag&drop**.
      Aggiunto anche drag&drop alla gallery proprietà (`setupDropzone` riutilizzabile in `admin.js`).
      Testato: foto caricata → thumbnail compressa; foto via URL → campo editabile.

## In corso (2026-06-13): admin più user-friendly
Obiettivo: pannello usabile da un proprietario non-tecnico. Deciso insieme:
- [x] Tappa 1-2 (2026-06-13): sistema traduzioni admin (`js/admin-i18n.js`, IT/EN completi, DE/EL
      ereditano EN) + selettore lingua con bandierine IT/EN/DE/EL (parte in EN, ricorda la scelta) +
      linguaggio semplice ("Salva guida", "Annulla modifiche", "Foto principale", "Colore principale"…).
      Colore: quadratino + codice modificabile. Testato.
- [x] Tappa 3 (2026-06-13): "Foto principale" e "Logo" ora sono widget upload+trascinamento+anteprima+
      rimuovi (`initSinglePhoto`), non più campi "path". Riusa `resizeImageToBase64`. I campi `prop-photo`/
      `prop-logo` restano hidden → salvataggio invariato. Testato.
- [x] Tappa 4 (2026-06-13): aiutini "?" accanto ai campi principali (`buildHelpTips`, HELP_MAP) con
      tooltip nativo tradotto. Si aggiornano al cambio lingua. Testato.
- [x] Tappa 5 (2026-06-13): pulsante "Guida" nell'header apre una modale con manuale passo-passo
      (12 voci, tradotto, scrollabile, chiusura con X/Close/Esc/backdrop). Testato.
- [x] **Dark / light mode (2026-06-13):** toggle sole/luna nell'header di guida ospite E admin.
      La prima volta segue il dispositivo (`prefers-color-scheme`), poi ricorda la scelta in
      `localStorage('bluewelcome_theme')`. Script anti-lampo nel `<head>`. Logica in `js/theme.js`
      (condiviso). Token dark in `tokens.css` e `admin.css`. Testato su entrambe le interfacce.
- [x] **Tappa 6 — riordino + colori (2026-06-13):** scelto "ordine 5 tab principali + colori preimpostati"
      (NON riordino interno totale: troppo complesso, contro l'obiettivo semplice). Nell'admin (sezione
      Struttura): palette di 8 colori cliccabili + lista drag&drop delle 5 tab. Salva in `config.tab_order`.
      La guida ospite riordina la bottom bar con `applyTabOrder()` in `app.js`. Testato.
- [ ] Completare traduzioni DE (tedesco) ed EL (greco) — ora ereditano l'inglese come fallback.
      Servono i testi tradotti (chiedere a Stefano / traduttore).

## RISOLTI il 2026-06-14 — problemi dell'anteprima online

- [x] **#1 BUG navigazione**: erano due bug — scroll non tornava in cima + sub-section di altre tab
  restavano attive. Fix in `app.js navigateTo` (spegne tutte le sub-section, attiva la prima della
  nuova sezione, scrollTo top). Testato.
- [x] **#2 Bandierine**: emoji → bandiere SVG inline (`js/flags.js`, `flagSVG()`), usate in guida
  ospite e admin. Si vedono su ogni sistema. Testato.
- [x] **#3 Colori carichi**: `.btn-add--upload` ora azzurro tenue (non blu pieno), + variante dark. Testato.

> Promemoria: dopo il `git push`, Netlify aggiorna l'anteprima online da solo.

### Coda di follow-up risolta il 2026-06-14
- [x] **Bug nav "vero" (desktop)**: la causa era CSS — `#section-contacts { display:grid }` nella
  media query ≥768px (ID, priorità alta) ignorava `.section.active` → contacts restava visibile
  impilata SOLO su desktop (per questo non si vedeva testando mobile). Limitato a `.active`.
- [x] **Service worker cache-first nascondeva gli aggiornamenti** → riscritto network-first per
  HTML/CSS/JS (v4). Vedi memoria `pwa-service-worker-cache-trap`. **Vale per tutti i programmi Blue.**
- [x] **Emoji-bandiera invisibili su Windows** → bandiere SVG (`js/flags.js`). Vedi memoria
  `emoji-bandiere-non-su-windows`. Riusare `flags.js` nei prossimi programmi con selettore lingua.
- Nota cache: dopo un deploy, se non si vedono le modifiche → finestra incognito, oppure
  F12 → Application → Service Workers → Unregister → Ctrl+F5.

---

## (storico) DA SISTEMARE — emersi dall'anteprima online (2026-06-13)

Sito live di anteprima: **bluewelcome.netlify.app** (deploy automatico da GitHub
`Wiseinblue/bluewelcome`, ogni push aggiorna). Admin: `/admin`, PIN 1234.
Tre problemi visti dalla collaboratrice/Stefano, da correggere:

1. **[BUG nav] Tab "Nearby" si apre SOTTO la sezione precedente** invece di sostituirla.
   La sezione vecchia non viene nascosta. Indagare in `js/app.js` (navigateTo / gestione
   `.section.active`) e `renderer.js`. Probabile interazione col riordino tab (`applyTabOrder`)
   o con le sub-section. PRIORITÀ ALTA.
2. **Bandierine lingua non si vedono online** — i selettori mostrano solo "GB/IT/DE/EL" senza
   le emoji 🇬🇧🇮🇹🇩🇪🇬🇷 (Windows/alcuni browser non renderizzano le emoji-bandiera).
   Sostituire le emoji con vere icone bandiera (SVG o immagini) sia nella guida ospite sia nell'admin.
3. **Colori troppo carichi** — i pulsanti "Upload photos" (e simili in blu pieno) sono troppo
   invadenti. Ammorbidire: versione più tenue o outline, mantenendo la palette Blue.

## Multi-unità con varianti (es. Thalassa Green) — DA FARE IN FASE 3 (deciso 2026-06-13)

**Caso reale:** Thalassa Green ha 3 cottage nello stesso spazio. Serve un link diverso per ogni cottage
(es. `.../thalassa-green/cottage-ulivo`). Tutto è in comune (WiFi, regole, dintorni, contatti…)
TRANNE alcune cose specifiche del cottage: come arrivare e riconoscere il cottage giusto (indicazioni + foto).

**Decisione:** NON 3 copie della guida (incubo di manutenzione: cambi la password WiFi in 3 posti).
Invece: **una guida "madre" condivisa + varianti per cottage** che sovrascrivono solo i campi diversi.
Stefano vuole poter rendere personalizzabili **anche altri campi** oltre alle indicazioni (da definire
quali quando ci arriviamo) — quindi il meccanismo dev'essere generico: "questo campo è ereditato dalla
madre OPPURE sovrascritto dalla variante".

**Perché in Fase 3 e non ora:** con config.json singolo sarebbe un pasticcio; con Supabase le proprietà
sono righe con relazioni (madre → varianti) e regge in modo pulito. Riparlarne al momento con Stefano
per decidere QUALI campi rendere sovrascrivibili.

## Link a guida esterna per le sezioni dintorni (FATTO — 2026-06-13)
- [x] Per ristoranti/attrazioni, l'admin ha un campo "Oppure collega la tua guida" + URL. Se compilato,
      la guida ospite mostra il pulsante "Scopri la zona →" (`discoverArea`) verso quel sito invece
      dell'elenco. Dato in `config.external_links.{restaurants,attractions}`. Per-sezione. Testato.

## FASE 3 — Supabase (IN CORSO, base completata 2026-06-14)

**Progetto Supabase:** `bluewelcome` (ref `nmevhspourehvvxlxksm`), region Frankfurt, piano free.
URL: `https://nmevhspourehvvxlxksm.supabase.co` · publishable key in `js/supabase-config.js` (pubblica, ok).
Schema in `supabase/schema.sql` (tabella `guides`, RLS, GRANT). Modello: **gestito** (account creati da WiB).

- [x] **Schema DB**: tabella `guides` (owner_id, slug, config jsonb). RLS: ospite legge, proprietario
      scrive solo le sue. GRANT a anon/authenticated (servivano oltre alle policy). Testato.
- [x] **Login email/password** (Supabase Auth) al posto del PIN. `js/supabase-client.js` + `initPin` riscritto.
- [x] **Salvataggio reale**: "Save guide" scrive su Supabase (`saveToCloud`). Prima guida → chiede uno slug
      e la crea. Testato: Villa Test salvata e riletta dal DB.
- [x] **Guida ospite legge dal DB**: `config-loader.js` legge per slug dall'URL (`getSlugFromPath` +
      `getGuideBySlug`), fallback a config.json (demo). Testato.
- [x] Primo account proprietario di test: `info@wiseinblue.com` (creato in Supabase Auth, auto-confirm).
- [ ] **Da fare online**: il `_redirects` Netlify deve mappare gli slug → index.html (già presente
      `/* /index.html 200`, verificare che `/villatest` carichi). 
- [ ] **Foto su Supabase Storage** (ora sono ancora base64 nel config): vedi sezione foto sotto.
- [ ] **Ping anti-pausa** Supabase (free va in pausa dopo 7gg inattività).
- [ ] **Multi-cottage** (Thalassa Green) — quando la base è solida.
- [ ] Pulire: `admin_pin` nel config non serve più (login vero); `config.json` resta solo come demo.

## (storico) Da fare PRIMA del lancio — FASE 3 del PERCORSO (Supabase)

### Foto: passaggio da base64-nel-config a Supabase Storage (decisione 2026-06-13)
- **Compressione automatica: GIÀ FATTA** — `resizeImageToBase64` in `admin.js` ridimensiona a max 1200px
  e comprime a qualità 0.82. Usata sia da gallery proprietà sia da foto indicazioni. Non serve rifarla.
- [ ] **Il limite attuale**: le foto caricate finiscono come **base64 dentro `config.json`**. Va bene per
      poche foto, ma con molte il config diventa pesante (ogni ospite lo scarica tutto). In Fase 3:
      caricare il file vero su **Supabase Storage** e salvare nel config solo l'URL del file.
- [ ] Cambia UN punto solo: dove `resizeImageToBase64`/`handle*Upload` oggi fanno `addPhotoItem(base64)`,
      in Fase 3 faranno upload su Supabase e `addPhotoItem(publicUrl)`. Struttura dati
      `directions_photos: [{url, caption}]` e rendering NON cambiano.
- [ ] Valutare se alzare il max a ~1600px quando lo storage non è più nel config (più qualità, costo trascurabile).

### Supabase: evitare la pausa per inattività (decisione 2026-06-13)
- [ ] Configurare un **ping automatico** una volta creato il progetto Supabase (NON ora — non c'è ancora
      nulla da pingare). Opzioni: cron gratuito su GitHub Actions o cron-job.org che fa una query banale
      1 volta al giorno → tiene sveglio il progetto sul piano free (pausa dopo 7 giorni di inattività).
      Alternativa definitiva: piano Pro 25$/mese (nessuna pausa) quando ci sono clienti paganti.

## Rifiniture minori (non bloccanti)
- [ ] Rigenerare le **icone PWA** (`assets/icons/icon-192.png`, `icon-512.png`): ora sono le vecchie
      "SG" su sfondo petrolio → rifarle in blu Blue / con logo WiB.
- [ ] Sostituire meta tag deprecato `apple-mobile-web-app-capable` con `mobile-web-app-capable`
      (warning segnalato dal browser, innocuo).

## Naming
- Deciso il 2026-06-13: il prodotto si chiama **BlueWelcome** (era StayGuide). Aggiornare la scheda
  `..\Programmi Esistenti\stayguide.md` → rinominare in `bluewelcome.md` quando si fa ordine.
