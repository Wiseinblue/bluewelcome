# StayGuide — Roadmap Strategica

---

## ✅ DECISIONE FINALE — Architettura SaaS su Supabase

**Scelta fatta (maggio 2026):**

StayGuide diventerà un SaaS centralizzato dove tutti i clienti — sia abbonamento che one-time — passano attraverso l'infrastruttura di Wise in Blue su Supabase.

**Come funziona:**
- Ogni proprietà ha un ID univoco (es. `villa-rosa`)
- Guida ospiti: `wiseinblue.com/stayguide/villa-rosa`
- Admin proprietario: `wiseinblue.com/stayguide/villa-rosa/admin`
- Login con email + password (Supabase Auth)
- Dati salvati su Supabase, modifiche istantanee senza ricaricare file
- Wise in Blue gestisce un unico progetto Supabase per tutti i clienti

**Modello commerciale:**
- **Abbonamento mensile**: cliente usa il sistema, Wise in Blue gestisce tutto
- **One-time**: cliente compra, i dati stanno comunque su Supabase di Wise in Blue, il cliente è autonomo per le modifiche. Se rescinde, si esporta il config.json e fine.
- In entrambi i casi il cliente non deve mai toccare codice o caricare file

**Perché Supabase:**
- Piano free: 50.000 righe, 500MB — regge centinaia di clienti
- Piano Pro: $25/mese se si scala oltre (costo diluito tra i clienti)
- Autenticazione utenti inclusa
- API automatiche, nessun backend custom da scrivere

**Roadmap di migrazione (dopo che il prototipo è completo):**
1. Creare progetto Supabase
2. Definire schema tabelle (properties, users, configs)
3. Sostituire fetch di config.json con query Supabase
4. Aggiungere Supabase Auth all'admin (email + password al posto del PIN)
5. Deploy su Serverplan o Netlify con variabili d'ambiente per le API key

---

## Fase attuale — Prototipo con config.json

Il prototipo attuale usa un file `config.json` statico. Va completato e rifinito prima di migrare a Supabase. Serve per:
- Avere qualcosa da mostrare ai primi clienti subito
- Validare il prodotto prima di investire nell'infrastruttura SaaS
- Usarlo come base dati per lo schema Supabase

---

## Modelli di distribuzione valutati

### Opzione A — GitHub + Netlify/Vercel
- Per ogni cliente: deploy separato su Netlify
- Aggiornamenti: modifica config.json → deploy automatico
- **Scartata**: non scala, ogni cliente = deploy separato da gestire

### Opzione B — ZIP scaricabile
- Cliente scarica ZIP e carica su proprio hosting
- **Scartata**: aggiornamenti manuali, cliente non autonomo, supporto infinito

### Opzione C — SaaS Supabase ✅ SCELTA
- Un unico sistema centralizzato, tutti i clienti su Supabase di Wise in Blue
- Cliente autonomo per le modifiche, Wise in Blue controlla l'infrastruttura

---

## Modelli di business valutati

### Abbonamento mensile
- Wise in Blue ospita e gestisce
- Cliente paga ricorrente
- **Adottato** come opzione principale

### One-time standalone
- Cliente vuole indipendenza totale
- Problema: non può modificare i contenuti senza caricare file
- **Soluzione adottata**: anche il one-time passa per Supabase di Wise in Blue — il cliente è autonomo nelle modifiche ma i dati restano sull'infrastruttura WiB

### Ibrido (hosted vs self-hosted)
- **Scartato**: troppo complesso da gestire, due sistemi diversi

---

## Admin Panel — evoluzione

### Fase 1 (attuale) — PIN + download config.json
- Protezione PIN configurabile
- Form completo per tutti i campi
- Download config.json da caricare manualmente
- **Limite**: il file va caricato a mano sul server

### Fase 2 (dopo migrazione Supabase) — Login + salvataggio diretto
- Email + password al posto del PIN
- Salvataggio diretto su Supabase con un click
- Modifiche visibili agli ospiti in tempo reale
- Nessun file da caricare

---

## Fasi di sviluppo

| Fase | Descrizione | Stato |
|------|-------------|-------|
| 0 | Setup struttura file, PWA base | ✅ Completata |
| 1–7 | Config loader, renderer, navigazione, i18n, QR, mappa, SW | ✅ Completata |
| 8 | Admin panel con PIN + form completo | ✅ Completata |
| 9 | UX polish, rifinitura visiva | ⏳ In corso |
| 10 | Documentazione + config template | ⏳ Pendente |
| 11 | Migrazione SaaS — Supabase Auth + database | ⏳ Futuro |
| 12 | Deploy produzione su Serverplan/Netlify | ⏳ Futuro |

---

## Hosting

- **Attuale**: Serverplan (sito Wise in Blue)
- **Guide statiche**: `wiseinblue.com/stayguide/nome-casa/`
- **Dopo migrazione**: Supabase per i dati, Serverplan o Netlify per i file statici
- Serverplan regge file statici senza problemi anche con molti clienti
