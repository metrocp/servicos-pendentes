export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { pin, id } = req.body || {};
    if (!pin || pin !== process.env.ADMIN_PIN) return res.status(401).send('PIN inválido');
    if (!id) return res.status(400).send('ID em falta');

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return res.status(500).send('Env vars em falta');

    const r = await fetch(`${url}/rest/v1/maintenance_tasks?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation'
      }
    });

    const txt = await r.text();
    if (!r.ok) return res.status(r.status).send(txt);
    res.status(200).send(txt || '[]');
  } catch (e) {
    res.status(500).send(String(e));
  }
}