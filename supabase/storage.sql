-- ============================================================
-- BlueWelcome — Storage foto (Supabase Storage)
-- Da incollare nel SQL Editor di Supabase ed eseguire una volta.
-- ============================================================

-- Bucket pubblico per le foto delle guide (gli ospiti le vedono senza login).
insert into storage.buckets (id, name, public)
values ('guide-photos', 'guide-photos', true)
on conflict (id) do nothing;

-- ── Regole di accesso allo storage ──────────────────────────
-- Lettura: pubblica (chiunque vede le foto via URL — sono nelle guide pubbliche).
drop policy if exists "foto leggibili da tutti" on storage.objects;
create policy "foto leggibili da tutti"
  on storage.objects for select
  using (bucket_id = 'guide-photos');

-- Caricamento: solo utenti loggati (i proprietari), nella loro cartella (owner_id/...).
drop policy if exists "proprietario carica le sue foto" on storage.objects;
create policy "proprietario carica le sue foto"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'guide-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Aggiornamento/sovrascrittura: solo nelle proprie foto.
drop policy if exists "proprietario aggiorna le sue foto" on storage.objects;
create policy "proprietario aggiorna le sue foto"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'guide-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Cancellazione: solo le proprie foto.
drop policy if exists "proprietario cancella le sue foto" on storage.objects;
create policy "proprietario cancella le sue foto"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'guide-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
