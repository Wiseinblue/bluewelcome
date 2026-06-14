# Come aggiungere un nuovo cliente a BlueWelcome

Guida pratica da riusare ogni volta che vuoi dare una guida BlueWelcome a un nuovo
proprietario (oltre a Thalassa Green). **Non serve toccare il codice né pubblicare:
ogni cliente vive nel database.** Tempo: ~3 minuti.

---

## In breve (il modello "gestito")

Tu crei l'accesso → il proprietario fa login → sceglie il nome web → compila la sua guida.
Ogni cliente vede e modifica **solo la sua guida**, mai quella degli altri.

---

## PASSO 1 — Creare l'account del proprietario (lo fai TU, in Supabase)

1. Vai su **https://supabase.com** e fai login col tuo account.
2. Apri il progetto **bluewelcome**.
3. Menu a sinistra → **Authentication**.
4. Scheda **Users** → bottone **Add user** (in alto a destra) → **Create new user**.
5. Inserisci:
   - **Email**: l'email del cliente (es. `mario@esempio.com`)
   - **Password**: una password che scegli tu (es. una robusta, gliela dai poi)
   - ✅ Spunta **Auto Confirm User** (così non deve confermare via email)
6. Premi **Create user**.

✅ Fatto. L'account esiste.

---

## PASSO 2 — Dare le credenziali al cliente

Comunica al cliente (messaggio, email…):
- Il link admin: **https://bluewelcome.netlify.app/admin**
- La sua **email** e la **password** che hai creato al passo 1
- Digli: "Al primo accesso ti chiederà di scegliere un nome breve per il link della
  tua guida (solo lettere/numeri, es. `villarosa`)".

---

## PASSO 3 — Il cliente compila la sua guida (lo fa LUI)

1. Apre il link admin e fa login con email + password.
2. **La prima volta** l'app gli chiede uno **slug** (il nome nell'URL).
   - Es. se sceglie `villarosa` → la sua guida sarà `bluewelcome.netlify.app/villarosa`
3. Compila le sezioni (foto, WiFi, check-in, regole, contatti…) e salva.
4. La guida è subito online a quel link. Può stampare un QR che punta a quel link
   e metterlo in casa.

---

## Cose importanti da sapere

- **Isolamento**: ogni cliente vede SOLO la sua guida. Mario non può vedere/modificare
  Thalassa Green e viceversa (sicurezza a livello di database).
- **Zero costi extra**: nuovo cliente = solo un utente creato in Supabase. Niente deploy,
  niente crediti Netlify. Gratis nei limiti del piano free (decine di guide ci stanno).
- **Un proprietario = una guida** (per ora). Se un proprietario ha più case, al momento
  serve un account per casa, oppure aspettare il multi-cottage (da sviluppare).

## ⚠️ Sicurezza — NON sbagliare questo

- Condividi col cliente SOLO la **sua email + password** (quella creata al passo 1).
- **NON condividere MAI** la chiave segreta di Supabase (`sb_secret_...`) né le password
  del tuo account Supabase/Netlify/GitHub: sono le chiavi maestre di tutto.
- Se un cliente dimentica la password: in Supabase → Authentication → Users → trovi
  l'utente → puoi resettargli la password.

---

*Modello e dettagli tecnici: vedi `PROSSIMI-PASSI.md` e la memoria di Claude.*
