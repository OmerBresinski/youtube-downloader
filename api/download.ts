import type { VercelRequest, VercelResponse } from "@vercel/node";
import ytdl from "@distube/ytdl-core";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Support both GET and POST
  const url = req.method === "POST" ? req.body?.url : req.query?.url;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' parameter" });
  }

  // Validate YouTube URL
  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    // Get video info
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, "").trim();
    
    // Get the best audio format
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    
    if (audioFormats.length === 0) {
      return res.status(404).json({ error: "No audio formats available for this video" });
    }

    // Sort by audio quality (bitrate)
    const bestAudio = audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];

    return res.status(200).json({
      status: "success",
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails[0]?.url,
      url: bestAudio.url,
      filename: `${title}.mp3`,
      format: {
        container: bestAudio.container,
        bitrate: bestAudio.audioBitrate,
        codec: bestAudio.audioCodec,
      },
    });
  } catch (error) {
    console.error("ytdl error:", error);
    
    const message = error instanceof Error ? error.message : "Unknown error";
    
    // Common errors
    if (message.includes("Sign in to confirm")) {
      return res.status(403).json({ 
        error: "This video requires sign-in verification. YouTube is blocking automated access." 
      });
    }
    if (message.includes("Video unavailable")) {
      return res.status(404).json({ error: "Video is unavailable or private" });
    }
    if (message.includes("age-restricted")) {
      return res.status(403).json({ error: "This video is age-restricted" });
    }
    
    return res.status(500).json({ error: `Failed to process video: ${message}` });
  }
}
