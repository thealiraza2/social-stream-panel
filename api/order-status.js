export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { apiUrl, apiKey, orderId } = req.body || {};

  if (!apiUrl || !apiKey || !orderId) {
    return res.status(400).json({ error: "Missing required fields (apiUrl, apiKey, orderId)" });
  }

  try {
    const formData = new URLSearchParams();
    formData.append("key", String(apiKey));
    formData.append("action", "status");
    formData.append("order", String(orderId));

    const response = await fetch(String(apiUrl), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data?.error) {
      return res.status(400).json({ error: data.error });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Failed to fetch order status" });
  }
}
