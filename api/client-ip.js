export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const getHeader = (name) => {
    const value = req.headers[name];
    return Array.isArray(value) ? value[0] : value || '';
  };

  const forwardedFor = getHeader('x-forwarded-for');
  const vercelForwardedFor = getHeader('x-vercel-forwarded-for');
  const vercelProxiedFor = getHeader('x-vercel-proxied-for');
  const realIp = getHeader('x-real-ip');

  const ip = (
    forwardedFor.split(',')[0]?.trim() ||
    vercelForwardedFor.split(',')[0]?.trim() ||
    vercelProxiedFor.split(',')[0]?.trim() ||
    realIp ||
    ''
  );

  let country = '';
  let city = '';
  let region = '';

  // Try ip-api.com first
  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    const data = await resp.json();
    if (data.status === 'success') {
      country = data.country || '';
      city = data.city || '';
      region = data.regionName || '';
    }
  } catch (_) {}

  // Fallback to ipwho.is
  if (!country && !city) {
    try {
      const resp = await fetch(`https://ipwho.is/${ip}`);
      const data = await resp.json();
      if (data.success !== false) {
        country = data.country || '';
        city = data.city || '';
        region = data.region || '';
      }
    } catch (_) {}
  }

  // Last fallback: Vercel headers
  if (!country) country = getHeader('x-vercel-ip-country') || '';
  if (!city) city = getHeader('x-vercel-ip-city') || '';
  if (!region) region = getHeader('x-vercel-ip-country-region') || '';

  return res.status(200).json({ ip, country, city, region });
}
