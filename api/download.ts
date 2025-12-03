import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' in request body" });
  }

  try {
    const cobaltResponse = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        audioFormat: "mp3",
        downloadMode: "audio",
      }),
    });

    const data = await cobaltResponse.json();

    // Forward the response from Cobalt
    return res.status(cobaltResponse.status).json(data);
  } catch (error) {
    console.error("Cobalt API error:", error);
    return res.status(500).json({ error: "Failed to reach Cobalt API" });
  }
}

