import type { VercelRequest, VercelResponse } from "@vercel/node";

const PROVIDER_URL = "https://smmpakpanel.com/api/v2";

const getAllowedOrigin = (origin?: string) => {
  if (!origin) return "*";
  if (origin === "https://social-stream-panel-one.vercel.app") return origin;
  if (origin.endsWith(".vercel.app")) return origin;
  return "https://social-stream-panel-one.vercel.app";
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  res.setHeader("Access-Control-Allow-Origin", getAllowedOrigin(origin));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.SMM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server API key is not configured" });
  }

  try {
    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("action", "services");

    const response = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const raw = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Provider API returned ${response.status}`,
        details: raw,
      });
    }

    try {
      const data = JSON.parse(raw);
      return res.status(200).json(data);
    } catch {
      return res.status(502).json({ error: "Invalid JSON from provider", details: raw });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to fetch from provider" });
  }
}

