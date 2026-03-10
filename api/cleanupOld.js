export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { pin } = req.body || {};
    if (!pin || pin !== process.env.ADMIN_PIN) return res.status(401).send('PIN inválido');

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return res.status(500).send('Env vars em falta');

    const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString();

    const r = await fetch(`${url}/rest/v1/maintenance_tasks?created_at=lt.${encodeURIComponent(thirtyDaysAgo)}`, {
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