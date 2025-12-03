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
      // Call our own API route (which proxies to Cobalt)
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.status === "error" || data.error) {
        setResult({
          status: "error",
          message:
            data.error?.code ||
            data.error ||
            data.text ||
            "Failed to fetch download link.",
        });
      } else if (data.url) {
        setResult({
          status: "success",
          downloadUrl: data.url,
          filename: data.filename || "download.mp3",
        });

        // Open the download URL in a new tab (more reliable than anchor click)
        window.open(data.url, "_blank");
      } else if (data.picker) {
        // Handle picker (multiple audio tracks, e.g., from a video with multiple formats)
        const firstItem = data.picker[0];
        if (firstItem?.url) {
          setResult({
            status: "success",
            downloadUrl: firstItem.url,
            filename: "download.mp3",
          });
          window.open(firstItem.url, "_blank");
        } else {
          setResult({
            status: "error",
            message:
              "Multiple items found but couldn't extract a download link.",
          });
        }
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
        message: "Network error. Please try again.",
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
