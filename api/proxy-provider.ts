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
    return res.status(405).json({ error: "Method not allowed. Please use POST." });
  }

  // Frontend se dynamic data receive karein
  const { apiUrl, apiKey } = req.body ?? {};

  if (!apiUrl || !apiKey) {
    return res.status(400).json({ error: "Both apiUrl and apiKey are required" });
  }

  try {
    // 🔴 SMM Panels MUST receive Form Data (URLSearchParams)
    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("action", "services");

    const providerRes = await fetch(apiUrl, { // <--- Dynamic URL used here
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const text = await providerRes.text();

    if (!providerRes.ok) {
      return res.status(providerRes.status).json({
        error: `Provider request failed (${providerRes.status})`,
        details: text,
      });
    }

    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(500).json({ error: "Invalid JSON response from provider" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Proxy request failed" });
  }
}
