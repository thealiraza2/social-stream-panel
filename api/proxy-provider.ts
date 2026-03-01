import type { VercelRequest, VercelResponse } from "@vercel/node";

const PROVIDER_URL = "https://smmfollows.com/api/v2";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { key, action = "services" } = req.body ?? {};

  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Provider API key is required" });
  }

  try {
    const providerRes = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, action }),
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
