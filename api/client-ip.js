export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apis = [
    {
      url: 'https://ipapi.co/json/',
      map: (d) => ({ ip: d.ip || '', country: d.country_name || '', city: d.city || '', region: d.region || '' }),
    },
    {
      url: 'https://freeipapi.com/api/json',
      map: (d) => ({ ip: d.ipAddress || '', country: d.countryName || '', city: d.cityName || '', region: d.regionName || '' }),
    },
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url, {
        headers: {
          'User-Agent': req.headers['user-agent'] || 'BudgetSMM/1.0',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) continue;
      const data = await response.json();
      const result = api.map(data);

      if (result.ip) {
        return res.status(200).json(result);
      }
    } catch (error) {
      continue;
    }
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const fallbackIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : req.headers['x-real-ip'] || '';

  return res.status(200).json({
    ip: fallbackIp || '',
    country: '',
    city: '',
    region: '',
  });
}
