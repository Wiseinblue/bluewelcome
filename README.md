# StayGuide 🏡
### La guida digitale per gli ospiti delle tue case vacanza — by Wise in Blue

---

## A cosa serve

**StayGuide** è una mini web app (PWA) pensata per i proprietari di case vacanza che vogliono offrire ai propri ospiti un'esperienza di accoglienza professionale, senza stampare fogli o mandare decine di messaggi WhatsApp.

L'ospite riceve (via QR code o link) una guida digitale personalizzata per la proprietà, installabile sullo smartphone come un'app, consultabile anche offline.

---

## Il problema che risolve

Ogni proprietario sa che gli ospiti fanno sempre le stesse domande:
- "Qual è la password del Wi-Fi?"
- "A che ora devo fare il check-out?"
- "Dove si mangia bene vicino?"
- "Chi chiamo se c'è un problema?"

StayGuide raccoglie tutto in un unico posto, sempre aggiornabile, sempre disponibile — anche senza connessione.

---

## Cosa contiene la guida

| Sezione | Contenuto |
|---------|-----------|
| 🏠 **Benvenuto** | Foto della proprietà, nome, messaggio personalizzato |
| 📶 **Wi-Fi** | Nome rete e password (con QR code per connessione immediata) |
| 🔑 **Check-in** | Istruzioni passo-passo per l'arrivo |
| 🚪 **Check-out** | Istruzioni per la partenza, orari, cosa fare |
| 📋 **Regole della casa** | Lista regole chiara e ben formattata |
| 📞 **Contatti** | Proprietario, emergenze, numeri utili locali |
| 🗺️ **Mappa** | Posizione della proprietà su Google Maps |
| 🍽️ **Ristoranti** | Consigli selezionati con categoria, distanza e link |
| 🎭 **Attrazioni** | Cose da fare e vedere nelle vicinanze |
| 🚌 **Trasporti** | Come muoversi: bus, taxi, treno, parcheggio |
| ❓ **FAQ** | Risposte alle domande più frequenti degli ospiti |

---

## Come si usa

1. Wise in Blue configura la guida per ogni proprietà modificando un file `config.json`
2. La guida viene pubblicata online (hosting statico gratuito o su dominio Wise in Blue)
3. Viene stampato un QR code da apporre all'ingresso della proprietà
4. L'ospite scansiona il QR → apre la guida → può installarla come app sul telefono

---

## Come si vende

| Modello | Descrizione | Target |
|---------|-------------|--------|
| **Incluso nel pacchetto** | Attivato per tutti i clienti Wise in Blue gestiti | Differenziazione commerciale |
| **Add-on premium** | Aggiunto come extra al contratto di gestione | Proprietari con più immobili |
| **Servizio standalone** | Venduto separatamente a chi non vuole la gestione completa | Proprietari fai-da-te |

---

## Caratteristiche tecniche

- **PWA** — installabile su iOS e Android, funziona offline dopo il primo accesso
- **Nessun backend** — configurazione tramite file JSON, zero database
- **Mobile-first** — progettata per smartphone, ottimizzata anche su desktop
- **Multi-proprietà** — ogni casa ha il proprio `config.json`, stesso codebase
- **Personalizzabile** — colori, logo, foto, contenuti tutti modificabili per proprietà
- **Zero app store** — nessuna pubblicazione su Apple Store o Google Play necessaria

---

## File del progetto

| File | Descrizione |
|------|-------------|
| `README.md` | Questo file |
| `CLAUDE.md` | Guida tecnica completa per Claude Code |
| `TODO.md` | Lista dei task di sviluppo in fasi sequenziali |

---

## Stato attuale

> 🟡 **In fase di pianificazione** — documentazione completa, sviluppo non ancora avviato.

Per avviare lo sviluppo: apri la cartella in Claude Code e di'' *"Leggi CLAUDE.md e TODO.md, poi implementa la Fase 0"*.

---

*Progetto Wise in Blue — uso interno*
