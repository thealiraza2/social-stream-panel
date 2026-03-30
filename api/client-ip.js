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

  const country = getHeader('x-vercel-ip-country') || '';
  const region = getHeader('x-vercel-ip-country-region') || getHeader('x-vercel-ip-region') || '';
  const city = getHeader('x-vercel-ip-city') || '';

  return res.status(200).json({
    ip,
    country,
    city,
    region,
  });
}
