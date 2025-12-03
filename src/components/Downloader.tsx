import { useState } from "react";

interface VideoInfo {
  title: string;
  author: string;
  duration: string;
  thumbnail: string;
}

interface DownloadResult {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  downloadUrl?: string;
  filename?: string;
  videoInfo?: VideoInfo;
}

export const Downloader = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<DownloadResult>({ status: "idle" });

  const formatDuration = (seconds: string) => {
    const sec = parseInt(seconds, 10);
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownload = async () => {
    if (!url) return;

    setResult({ status: "loading" });

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.error) {
        setResult({
          status: "error",
          message: data.error,
        });
      } else if (data.status === "success" && data.url) {
        setResult({
          status: "success",
          downloadUrl: data.url,
          filename: data.filename || "download.mp3",
          videoInfo: {
            title: data.title,
            author: data.author,
            duration: formatDuration(data.duration),
            thumbnail: data.thumbnail,
          },
        });

        // Open the download URL in a new tab
        window.open(data.url, "_blank");
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && url && result.status !== "loading") {
      handleDownload();
    }
  };

  return (
    <div className="paper-scroll">
      <div className="input-group">
        <label htmlFor="url-input">🎵 The Bard's Song Request</label>
        <input
          id="url-input"
          type="text"
          className="rustic-input"
          placeholder="Paste a YouTube link here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        className="wood-button"
        onClick={handleDownload}
        disabled={result.status === "loading" || !url}
      >
        {result.status === "loading"
          ? "🔮 Conjuring Music..."
          : "📜 Transcribe to Audio"}
      </button>

      {result.status === "error" && (
        <div className="result-message error">⚠️ {result.message}</div>
      )}

      {result.status === "success" && result.videoInfo && (
        <div className="success-card">
          <div className="video-info">
            {result.videoInfo.thumbnail && (
              <img
                src={result.videoInfo.thumbnail}
                alt="Video thumbnail"
                className="video-thumbnail"
              />
            )}
            <div className="video-details">
              <h3>{result.videoInfo.title}</h3>
              <p className="video-author">by {result.videoInfo.author}</p>
              <p className="video-duration">⏱️ {result.videoInfo.duration}</p>
            </div>
          </div>
          <div className="result-message success">
            ✨ Success! Your scroll is ready.
            <br />
            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="download-link"
            >
              🎧 Click here if download didn't start
            </a>
          </div>
        </div>
      )}

      <div className="footer-note">
        <p>
          Works with YouTube videos.
          <br />
          <span className="magic-text">
            Powered by ancient village magic ✨
          </span>
        </p>
      </div>
    </div>
  );
};
