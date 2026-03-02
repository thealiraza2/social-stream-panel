import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp, getApps, initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";

type ProviderCredentials = {
  apiUrl: string;
  apiKey: string;
};

const firebaseConfig = {
  apiKey: "AIzaSyBNPRfwfqogpA1ryn5PRX9iKFFJ4FXvGb0",
  authDomain: "smm-panel-45f15.firebaseapp.com",
  projectId: "smm-panel-45f15",
  storageBucket: "smm-panel-45f15.firebasestorage.app",
  messagingSenderId: "398245193553",
  appId: "1:398245193553:web:0f207a07800f2ea5411570",
  measurementId: "G-JPZE1RSP7Q",
};

const getAllowedOrigin = (origin?: string) => {
  if (!origin) return "*";
  if (origin === "https://my-server-one-lake.vercel.app/api/fetch-services") return origin;
  if (origin.endsWith(".vercel.app")) return origin;
  return "https://social-stream-panel-one.vercel.app";
};

const getDb = () => {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
};

const asNonEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : "";

const resolveProviderCredentials = async (body: any): Promise<ProviderCredentials | null> => {
  const providerId = asNonEmptyString(body?.providerId);

  if (providerId) {
    const providerSnap = await getDoc(doc(getDb(), "providers", providerId));

    if (providerSnap.exists()) {
      const provider = providerSnap.data() as Record<string, unknown>;
      const apiUrl =
        asNonEmptyString(provider.apiUrl) ||
        asNonEmptyString(provider.api_url) ||
        asNonEmptyString(provider.url);
      const apiKey =
        asNonEmptyString(provider.apiKey) ||
        asNonEmptyString(provider.api_key) ||
        asNonEmptyString(provider.key);

      if (apiUrl && apiKey) {
        return { apiUrl, apiKey };
      }
    }
  }

  const apiUrl = asNonEmptyString(body?.apiUrl);
  const apiKey = asNonEmptyString(body?.apiKey);

  if (apiUrl && apiKey) {
    return { apiUrl, apiKey };
  }

  return null;
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

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const provider = await resolveProviderCredentials(body);

    if (!provider) {
      return res.status(400).json({ error: "providerId or apiUrl/apiKey is required" });
    }

    const response = await fetch(provider.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key: provider.apiKey,
        action: "services",
      }),
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

