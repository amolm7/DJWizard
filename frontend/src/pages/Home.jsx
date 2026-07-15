import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const API = "http://127.0.0.1:5000"

const SUBTITLES = [
  "Describe a vibe. Get a perfect playlist.",
  "What's on your mind? Let's turn it into music.",
  "What kind of music are you feeling?",
  "Tell us your mood, we'll handle the aux.",
  "One sentence in. A playlist out."
]

const LOADING_TEXTS = [
  "DJWizard is curating your playlist",
  "Digging through the crates",
  "Matching tracks to your mood",
  "Mixing the perfect set",
  "Consulting the music gods",
  "Fine-tuning the vibe"
]

export default function Home() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState(null)
  const [tracks, setTracks] = useState([])
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(false)
  const { tokenId, authError } = useAuth()
  const [subtitle] = useState(
    () => SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]
  )
  const [loadingTextIndex, setLoadingTextIndex] = useState(0)

  useEffect(() => {
    if (!loading) return
    setLoadingTextIndex(0)
    const interval = setInterval(() => {
      setLoadingTextIndex(i => (i + 1) % LOADING_TEXTS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [loading])

  const handleLogin = () => {
    window.location.href = `${API}/login`
  }

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResponse(null)
    setTracks([])
    setPlaylist(null)
    try {
      const res = await axios.post(`${API}/chat`, {
        message,
        token_id: tokenId
      })
      setResponse(res.data.response)
      setTracks(res.data.tracks)
      setPlaylist(res.data.playlist)
    } catch (err) {
      setResponse("Something went wrong. Try logging in again.")
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes djwizard-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.header}>
        <h1 style={styles.title}>DJWizard</h1>
        <p style={styles.subtitle}>{subtitle}</p>
      </div>

      {!tokenId ? (
        <div style={styles.loginContainer}>
          <button onClick={handleLogin} style={styles.loginButton}>
            Login with Spotify
          </button>
          {authError && (
            <p style={styles.loading}>
              Spotify login failed ({authError}). Please try again.
            </p>
          )}
        </div>
      ) : (
        <div style={styles.chatContainer}>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. late night drive, melancholic but hopeful..."
            />
            <button
              style={styles.button}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Building..." : "Generate"}
            </button>
          </div>

          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>{LOADING_TEXTS[loadingTextIndex]}</p>
            </div>
          )}

          {response && (
            <div style={styles.responseBox}>
              <p style={styles.responseText}>{response}</p>
            </div>
          )}

          {tracks.length > 0 && (
            <div style={styles.tracklist}>
              <div style={styles.tracklistHeader}>
                <h2 style={styles.tracklistTitle}>
                  {playlist ? playlist.name : "Your Curated Playlist"}
                </h2>
                <Link to="/playlists" style={styles.playlistsLink}>
                  View in My Playlists →
                </Link>
              </div>
              {tracks.map((track, i) => (
                <a
                  key={i}
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.trackItem}
                >
                  {track.album_image && (
                    <img src={track.album_image} alt={track.name} style={styles.albumArt} />
                  )}
                  <div>
                    <p style={styles.trackName}>{track.name}</p>
                    <p style={styles.artistName}>{track.artist}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  header: { textAlign: "center" },
  title: { fontFamily: "'Bungee', cursive", fontSize: "2.5rem", letterSpacing: "1px" },
  subtitle: { color: "var(--text-secondary)", marginTop: "8px", fontSize: "1rem" },
  loginContainer: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  loginButton: {
    backgroundColor: "var(--accent)",
    color: "var(--accent-contrast)",
    border: "none",
    borderRadius: "50px",
    padding: "14px 32px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer"
  },
  chatContainer: { display: "flex", flexDirection: "column", gap: "20px" },
  inputRow: { display: "flex", gap: "12px" },
  input: {
    flex: 1,
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "var(--text-primary)",
    fontSize: "1rem",
    outline: "none"
  },
  button: {
    backgroundColor: "var(--accent)",
    color: "var(--accent-contrast)",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer"
  },
  loading: { color: "var(--text-secondary)", textAlign: "center" },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0"
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid var(--border)",
    borderTopColor: "var(--accent)",
    borderRadius: "50%",
    animation: "djwizard-spin 0.8s linear infinite"
  },
  loadingText: { color: "var(--text-secondary)", textAlign: "center", margin: 0 },
  responseBox: {
    backgroundColor: "var(--bg-elevated)",
    borderRadius: "8px",
    padding: "16px"
  },
  responseText: { color: "var(--text-tertiary)", lineHeight: "1.6" },
  tracklist: { display: "flex", flexDirection: "column", gap: "12px" },
  tracklistHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "4px"
  },
  tracklistTitle: { fontSize: "1.2rem", fontWeight: "600" },
  playlistsLink: { color: "var(--accent)", fontSize: "0.85rem", textDecoration: "none", whiteSpace: "nowrap" },
  trackItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "var(--bg-elevated)",
    borderRadius: "8px",
    padding: "12px",
    textDecoration: "none",
    color: "var(--text-primary)"
  },
  albumArt: { width: "48px", height: "48px", borderRadius: "4px" },
  trackName: { fontWeight: "600", fontSize: "0.95rem" },
  artistName: { color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "2px" }
}
