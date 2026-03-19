export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pin } = req.body || {};

    if (!pin || pin !== process.env.ADMIN_PIN) {
      return res.status(401).json({ error: 'PIN inválido' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Faltam variáveis de ambiente do Supabase' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .delete()
      .eq('status', 'concluido')
      .lt('closed_at', cutoff)
      .select('id');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      ok: true,
      deleted: data ? data.length : 0,
      cutoff
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Erro interno'
    });
  }
}
