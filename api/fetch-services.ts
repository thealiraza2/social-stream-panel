import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiUrl, apiKey } = req.body || {};

  if (!apiUrl || !apiKey) {
    return res.status(400).json({ error: "apiUrl and apiKey are required" });
  }

  // Basic URL validation
  try {
    const url = new URL(apiUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return res.status(400).json({ error: "Invalid API URL protocol" });
    }
  } catch {
    return res.status(400).json({ error: "Invalid API URL" });
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: apiKey, action: "services" }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Provider API returned ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch from provider" });
  }
}
