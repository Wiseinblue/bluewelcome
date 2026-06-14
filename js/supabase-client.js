/* ───────────────────────────────────────────────
   BlueWelcome — Client Supabase condiviso
   Crea il client e offre funzioni helper per auth e guide.
   Richiede: supabase-js (CDN) + supabase-config.js prima di questo file.
─────────────────────────────────────────────── */

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const BlueWelcomeDB = {
  // ── AUTH ──────────────────────────────────────────────
  async signIn(email, password) {
    return sb.auth.signInWithPassword({ email, password });
  },
  async signOut() {
    return sb.auth.signOut();
  },
  async getUser() {
    const { data } = await sb.auth.getUser();
    return data?.user || null;
  },
  async changePassword(newPassword) {
    return sb.auth.updateUser({ password: newPassword });
  },

  // ── GUIDE (lato proprietario, richiede login) ─────────
  // Ritorna la PRIMA guida del proprietario loggato (modello "una casa per ora").
  async getMyGuide() {
    const user = await this.getUser();
    if (!user) return null;
    const { data, error } = await sb
      .from('guides')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) { console.error('getMyGuide', error); return null; }
    return data; // { id, slug, config, ... } oppure null se non ne ha ancora
  },

  // Salva (aggiorna) il config della guida data.
  async saveGuide(guideId, config) {
    const { error } = await sb
      .from('guides')
      .update({ config })
      .eq('id', guideId);
    return { error };
  },

  // Cambia lo slug (indirizzo web) di una guida.
  async changeSlug(guideId, newSlug) {
    const { error } = await sb
      .from('guides')
      .update({ slug: newSlug })
      .eq('id', guideId);
    return { error };
  },

  // Crea una guida nuova per il proprietario loggato (usata se non ne ha).
  async createGuide(slug, config) {
    const user = await this.getUser();
    if (!user) return { error: { message: 'not logged in' } };
    const { data, error } = await sb
      .from('guides')
      .insert({ owner_id: user.id, slug, config })
      .select()
      .single();
    return { data, error };
  },

  // ── STORAGE FOTO ──────────────────────────────────────
  // Carica un'immagine (Blob/File) nel bucket guide-photos, nella cartella del
  // proprietario (owner_id/...), e ritorna l'URL pubblico.
  async uploadPhoto(blob, ext = 'jpg') {
    const user = await this.getUser();
    if (!user) return { error: { message: 'not logged in' } };
    const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from('guide-photos').upload(filename, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    });
    if (error) return { error };
    const { data } = sb.storage.from('guide-photos').getPublicUrl(filename);
    return { url: data.publicUrl };
  },

  // ── GUIDE (lato ospite, pubblico, no login) ───────────
  async getGuideBySlug(slug) {
    const { data, error } = await sb
      .from('guides')
      .select('config, slug')
      .eq('slug', slug)
      .maybeSingle();
    if (error) { console.error('getGuideBySlug', error); return null; }
    return data; // { config, slug } oppure null
  },
};
