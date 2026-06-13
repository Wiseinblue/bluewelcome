# Progetto: Siti vetrina + app multi-tenant per i programmi Wise in Blue

Documento di partenza per la creazione di siti/applicazioni dedicate ai programmi venduti da Wise in Blue (primo caso d'uso: welcome digitale per case vacanze).

Spostare questo file nella nuova cartella di lavoro dedicata al progetto, mantenendo pulita la cartella `Website WiB` (sito wiseinblue.com).

---

## 1. Obiettivo

Creare per ogni programma Wise in Blue:

- Un **sito vetrina** dedicato (es. `welcomestay.com`) per vendere il programma
- Un'**applicazione multi-tenant** che genera un sotto-sito per ogni cliente (es. `villamare.welcomestay.com`, `casarosa.welcomestay.com`, ecc.)
- Un **pannello admin** dove ogni proprietario può modificare contenuti (foto, testi, eventualmente colori/layout)
- Un **link pubblico** che il proprietario gira al guest (no login lato guest)

Tutti i siti restano "powered by Wise in Blue".

Target: ~100 clienti per ogni programma, più programmi nel tempo (stessa architettura riutilizzata).

---

## 2. Scelte strategiche fatte

### 2.1 Un dominio per ogni programma (non sottodominio di wiseinblue.com)
- **Scelto**: dominio dedicato per programma (es. `welcomestay.com`)
- **Motivo**: branding del prodotto, SEO migliore sulle keyword del programma, percezione cliente più professionale, possibilità di email dedicate (`info@welcomestay.com`), prodotto scorporabile in futuro
- Wiseinblue.com resta la "casa madre" che elenca tutti i programmi

### 2.2 Sottodomini illimitati per i clienti
- **Scelto**: `nomecliente.nomeprogramma.com` per ogni cliente
- **Tecnica**: DNS wildcard `*.welcomestay.com` + SSL wildcard (Let's Encrypt gratis)
- Nessun limite pratico al numero di sottodomini, non si crea nulla a mano

### 2.3 Architettura: applicazione multi-tenant (NON sito statico)
- **Scelto**: una sola applicazione che riconosce il sottodominio e carica i dati del cliente corrispondente dal database
- **Motivo**: il proprietario deve poter modificare contenuti in autonomia → serve database + login. Lo statico puro renderebbe Stefano il collo di bottiglia con 100 clienti.

### 2.4 Stack tecnico scelto

| Componente | Strumento | Note |
|---|---|---|
| Registrar dominio | **Cloudflare Registrar** | Costo a prezzo di costo (~10$/anno per .com), wildcard DNS facile |
| Hosting frontend | **Netlify** o **Cloudflare Pages** | Gratis, deploy da Git, wildcard SSL automatico |
| Database + Auth + Storage foto | **Supabase** | Tutto-in-uno: PostgreSQL, login utenti, upload foto. Gratis fino a 500MB DB + 1GB storage, poi ~25€/mese |
| Frontend | HTML/CSS/JS | Come wiseinblue.com, con un piccolo motore JS che carica dati da Supabase |

### 2.5 Un solo hosting per tutti i domini
- **Scelto**: un account Netlify (o Cloudflare Pages) che ospita TUTTI i programmi futuri
- **Motivo**: nessun senso pagare hosting separati. Stack riusabile tra programmi.

### 2.6 Costo realistico
- **Primo anno con pochi clienti**: ~15€ (solo dominio), tutto il resto gratis
- **A regime (centinaia di clienti)**: ~25€/mese Supabase + ~15€/anno per dominio
- Ogni nuovo programma: +15€/anno di dominio, stesso stack

---

## 3. Come funziona l'infrastruttura (modello separato vs cPanel)

### 3.1 Il modello vecchio (Serverplan / cPanel)
Dominio + hosting + CMS tutto dallo stesso fornitore. Comodo per siti standard, ma non scala e crea dipendenza totale dal fornitore.

### 3.2 Il modello nuovo (pezzi separati e specializzati)

```
Cloudflare Registrar  →  compri e gestisci il dominio + DNS
        ↓ (record DNS punta il dominio a Netlify)
Netlify               →  ospita e serve il sito/app (deploy automatico da GitHub)
        ↓ (l'app legge/scrive dati)
Supabase              →  database, login utenti, storage foto
```

- **Cloudflare**: compri il dominio (~10$/anno), gestisci il DNS. Un solo record wildcard `*.welcomestay.com → Netlify` copre tutti i sottodomini cliente senza lavoro manuale.
- **Netlify**: riceve il traffico, serve il frontend. Si collega a GitHub: ogni push aggiorna il sito automaticamente. SSL gratis e automatico.
- **Supabase**: il "backend" — database PostgreSQL, autenticazione proprietari, upload foto. Interfaccia web per vedere i dati. Gratis fino a volumi ragionevoli.
- **GitHub**: dove vive il codice. Obbligatorio per il deploy automatico su Netlify.

### 3.3 Pro e contro rispetto al modello cPanel

| | Modello vecchio (cPanel) | Modello nuovo |
|---|---|---|
| Costo iniziale | Medio (hosting annuale) | Bassissimo (~10$/anno solo dominio) |
| Semplicità di partenza | Alta | Media (curva iniziale) |
| Flessibilità / lock-in | Bassa (legato al fornitore) | Alta (ogni pezzo è sostituibile) |
| Scalabilità | Limitata (spazio fisso) | Illimitata |
| CMS | Pronto (WordPress) | Da costruire (è il pannello admin) |
| Adatto a siti standard | Ottimo | Eccessivo |
| Adatto a app multi-tenant | Impossibile o molto costoso | Ideale |
| Deploy | Manuale via FTP | Automatico da GitHub |
| SSL sottodomini multipli | Extra o manuale | Gratis e automatico |

**Conclusione**: il modello vecchio è giusto per siti statici o blog. Per un'app dove 100 proprietari accedono ognuno al proprio pannello e modificano il proprio sotto-sito, cPanel/WordPress non è praticabile.

---

## 4. Risposte alle domande chiave

**D: Si possono comprare domini con sottodomini illimitati gratis?**
R: Sì, è standard. Tutti i registrar decenti lo permettono. La cosa che conta è avere wildcard DNS + wildcard SSL.

**D: Meglio un hosting per dominio o multi-dominio?**
R: Multi-dominio. Un solo Netlify/Cloudflare Pages per tutti i programmi.

**D: Continuare con stessa strada per i programmi futuri?**
R: Sì. Per ogni nuovo programma: nuovo dominio + riuso completo dello stack (Supabase, Netlify, template).

**D: Sito statico HTML come wiseinblue.com va bene?**
R: NO per questo caso d'uso. Serve database perché i proprietari devono modificare contenuti da soli. Resta HTML/CSS/JS lato frontend, ma con backend dinamico (Supabase).

---

## 4. Requisiti funzionali (dal confronto)

### 4.1 Lato proprietario (cliente Wise in Blue)
- Login al pannello admin su **`app.welcomestay.com`** — indirizzo unico e fisso per tutti i proprietari, indipendentemente dal sottodominio del loro sotto-sito
  - **Motivo**: separazione netta tra area pubblica (`nomecliente.welcomestay.com`) e area privata (`app.`); più semplice da sviluppare, da proteggere e da manutenere; il link al pannello non cambia mai anche se il sottodominio del cliente viene rinominato
  - Flusso: proprietario va su `app.welcomestay.com` → fa login → vede e modifica solo i suoi contenuti → le modifiche appaiono su `villamare.welcomestay.com` per i guest
- Modifica contenuti: foto, testi (nome casa, orari check-in, wifi, regole, ecc.)
- **Livelli di personalizzazione differenti per cliente diverso**:
  - Clienti "base": cambiano solo foto + testi predefiniti
  - Clienti "avanzati": cambiano anche colori, layout, eventualmente sezioni intere
  - → Servirà gestire **piani/livelli** o un sistema di permessi che abilita certe funzioni

### 4.2 Lato guest (ospite finale)
- Apre link pubblico (`villamare.welcomestay.com`) — nessun login
- Riceve il link via WhatsApp/email dal proprietario, oppure via QR code in casa
- Vede la pagina personalizzata con info benvenuto

### 4.3 Lato Wise in Blue (Stefano)
- Crea account proprietario quando vende il programma
- Imposta il sottodominio del cliente
- Eventualmente pre-imposta contenuti iniziali per clienti che non vogliono fare da soli
- Gestisce fatturazione/abbonamenti (da definire: Stripe?)

---

## 5. Roadmap di lavoro (primo programma: welcome case vacanze)

1. **Scegliere nome + dominio** del programma (es. welcomestay.com o simili) — da decidere
2. **Comprare dominio** su Cloudflare Registrar
3. **Creare account**: Netlify + Supabase + Cloudflare (DNS)
4. **Progettare il database** Supabase: tabelle clienti, contenuti, foto, livelli/piani
5. **Sviluppare**:
   - Sito vetrina `welcomestay.com` (HTML statico, come wiseinblue.com)
   - Template della pagina-cliente (quella che vede il guest)
   - Pannello admin per il proprietario su `app.welcomestay.com` (login + form di modifica)
   - Sistema di routing che da `villamare.welcomestay.com` carica i dati di "villamare"
6. **Configurare DNS wildcard** `*.welcomestay.com` → Netlify
7. **Configurare SSL wildcard**
8. **Testare** con un cliente pilota
9. **Procedura di onboarding** standard per nuovi clienti

---

## 6. Punti aperti / da decidere

- Nome e dominio del primo programma (welcome case vacanze)
- Sistema di pagamento ricorrente per i clienti (Stripe? bonifico? abbonamento annuale?)
- Livelli/piani: quanti, cosa include ognuno, prezzi
- Lingua: solo italiano? multilingua per i guest stranieri?
- QR code: lo generiamo noi nel pannello? lo stampa il proprietario?
- Email transazionali (benvenuto proprietario, reset password): servizio da scegliere (Resend, Postmark, ecc.)
- Branding "powered by Wise in Blue": dove e come mostrarlo nei siti cliente

---

## 7. Note finali

- Tutto lo stack è scelto in ottica "imparare facendo": Supabase ha curva dolce, niente server da amministrare
- L'architettura è riutilizzabile: ogni nuovo programma futuro parte da questa stessa base, cambia solo dominio + template grafico + struttura dati specifica
- Mantenere la cartella `Website WiB` dedicata SOLO a wiseinblue.com. Il nuovo progetto va in una cartella separata.
