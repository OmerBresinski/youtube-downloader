import { useState } from "react";

interface DownloadResult {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  downloadUrl?: string;
  filename?: string;
}

export const Downloader = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<DownloadResult>({ status: "idle" });

  const handleDownload = async () => {
    if (!url) return;

    setResult({ status: "loading" });

    try {
      // Using Cobalt API (https://github.com/imputnet/cobalt)
      // Public instance: https://api.cobalt.tools
      const response = await fetch("https://api.cobalt.tools/api/json", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          vCodec: "h264",
          vQuality: "720",
          aFormat: "mp3",
          isAudioOnly: true,
        }),
      });

      const data = await response.json();

      if (data.status === "error") {
        setResult({
          status: "error",
          message: data.text || "Failed to fetch download link.",
        });
      } else if (data.url) {
        setResult({
          status: "success",
          downloadUrl: data.url,
          filename: data.filename || "download.mp3",
        });

        // Auto-trigger download if possible
        const a = document.createElement("a");
        a.href = data.url;
        a.download = data.filename || "audio.mp3";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (data.picker) {
        // Handle picker (multiple items), for simplicity just take the first or warn
        setResult({
          status: "error",
          message:
            "Playlist or picker not fully supported in this simple demo. Try a single video.",
        });
      } else {
        setResult({
          status: "error",
          message: "Unknown response from server.",
        });
      }
    } catch (error) {
      console.error(error);
      setResult({
        status: "error",
        message:
          "Network error or CORS issue. This API might not work directly from localhost without a proxy.",
      });
    }
  };

  return (
    <div className="paper-scroll">
      <div className="input-group">
        <label htmlFor="url-input">The Bard's Song Request</label>
        <input
          id="url-input"
          type="text"
          className="rustic-input"
          placeholder="Paste a YouTube or Spotify link here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button
        className="wood-button"
        onClick={handleDownload}
        disabled={result.status === "loading" || !url}
      >
        {result.status === "loading"
          ? "Conjuring Music..."
          : "Transcribe to MP3"}
      </button>

      {result.status === "error" && (
        <div
          style={{ color: "#8b0000", marginTop: "1rem", fontWeight: "bold" }}
        >
          ⚠ {result.message}
        </div>
      )}

      {result.status === "success" && (
        <div
          style={{ color: "#4a7023", marginTop: "1rem", fontWeight: "bold" }}
        >
          ✨ Success! Your scroll is ready. <br />
          <a
            href={result.downloadUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit" }}
          >
            Click here if download didn't start.
          </a>
        </div>
      )}

      <div className="playlist-preview">
        <p style={{ textAlign: "center", opacity: 0.6, fontStyle: "italic" }}>
          Works with YouTube & Spotify links. <br />
          Powered by Cobalt magic.
        </p>
      </div>
    </div>
  );
};
