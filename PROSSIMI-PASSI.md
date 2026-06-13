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

## Da fare PRIMA del lancio — siamo in FASE 3 del PERCORSO (Supabase)

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
