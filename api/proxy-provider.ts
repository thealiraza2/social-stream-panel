// api/proxy-provider.ts (Backend)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { apiUrl, apiKey } = req.body || {};
  if (!apiUrl || !apiKey) return res.status(400).json({ error: "apiUrl and apiKey required" });

  try {
    // SMM Panels MUST receive Form Data (URLSearchParams)
    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("action", "services");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
