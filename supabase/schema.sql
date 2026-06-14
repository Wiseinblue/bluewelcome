-- ============================================================
-- BlueWelcome — Schema database Supabase (Tappa A, Fase 3)
-- Da incollare nel SQL Editor di Supabase ed eseguire una volta.
-- ============================================================

-- Tabella delle guide: una riga = una proprietà.
-- Il "config" è il JSON che oggi sta in config.json (tutta la guida).
-- Così aggiungere nuove funzioni alla guida NON richiede di cambiare il database.
create table if not exists public.guides (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  slug        text not null unique,                 -- nome nell'URL, es. "villarosa"
  config      jsonb not null default '{}'::jsonb,   -- la guida completa (ex config.json)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indice per cercare velocemente per slug (lo usa la pagina ospite)
create index if not exists guides_slug_idx on public.guides (slug);
create index if not exists guides_owner_idx on public.guides (owner_id);

-- Aggiorna updated_at automaticamente a ogni modifica
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists guides_set_updated_at on public.guides;
create trigger guides_set_updated_at
  before update on public.guides
  for each row execute function public.set_updated_at();

-- ============================================================
-- SICUREZZA (Row Level Security)
-- Regola d'oro: ogni proprietario tocca SOLO le sue guide.
-- L'ospite (non loggato) può LEGGERE la guida pubblicamente via slug.
-- ============================================================
alter table public.guides enable row level security;

-- 1) LETTURA PUBBLICA: chiunque (anche senza login) può leggere una guida.
--    Serve perché l'ospite apre dominio/villarosa senza account.
drop policy if exists "guide leggibile da tutti" on public.guides;
create policy "guide leggibile da tutti"
  on public.guides for select
  using (true);

-- 2) IL PROPRIETARIO può creare le proprie guide
drop policy if exists "proprietario crea le sue guide" on public.guides;
create policy "proprietario crea le sue guide"
  on public.guides for insert
  with check (auth.uid() = owner_id);

-- 3) IL PROPRIETARIO può modificare solo le proprie guide
drop policy if exists "proprietario modifica le sue guide" on public.guides;
create policy "proprietario modifica le sue guide"
  on public.guides for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- 4) IL PROPRIETARIO può cancellare solo le proprie guide
drop policy if exists "proprietario cancella le sue guide" on public.guides;
create policy "proprietario cancella le sue guide"
  on public.guides for delete
  using (auth.uid() = owner_id);

-- ============================================================
-- PRIVILEGI (GRANT)
-- Con "Automatically expose new tables" DISATTIVATO, le policy RLS non bastano:
-- bisogna concedere esplicitamente i privilegi ai ruoli. Le policy poi filtrano
-- COSA ogni ruolo può effettivamente toccare riga per riga.
-- ============================================================
-- anon = ospite non loggato (legge la guida pubblica via slug)
grant select on public.guides to anon;
-- authenticated = proprietario loggato (legge/scrive le sue guide; le policy limitano alle sue)
grant select, insert, update, delete on public.guides to authenticated;
