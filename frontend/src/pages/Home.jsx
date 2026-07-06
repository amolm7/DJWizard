import { useState } from "react"
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

export default function Home() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const { tokenId, authError } = useAuth()
  const [subtitle] = useState(
    () => SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]
  )

  const handleLogin = () => {
    window.location.href = `${API}/login`
  }

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResponse(null)
    setTracks([])
    try {
      const res = await axios.post(`${API}/chat`, {
        message,
        token_id: tokenId
      })
      setResponse(res.data.response)
      setTracks(res.data.tracks)
    } catch (err) {
      setResponse("Something went wrong. Try logging in again.")
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
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
            <p style={styles.loading}>🎵 DJWizard is curating your playlist...</p>
          )}

          {response && (
            <div style={styles.responseBox}>
              <p style={styles.responseText}>{response}</p>
            </div>
          )}

          {tracks.length > 0 && (
            <div style={styles.tracklist}>
              <h2 style={styles.tracklistTitle}>Your Playlist</h2>
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
  subtitle: { color: "#888", marginTop: "8px", fontSize: "1rem" },
  loginContainer: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  loginButton: {
    backgroundColor: "#1DB954",
    color: "#000",
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
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#fff",
    fontSize: "1rem",
    outline: "none"
  },
  button: {
    backgroundColor: "#1DB954",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer"
  },
  loading: { color: "#888", textAlign: "center" },
  responseBox: {
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    padding: "16px"
  },
  responseText: { color: "#ccc", lineHeight: "1.6" },
  tracklist: { display: "flex", flexDirection: "column", gap: "12px" },
  tracklistTitle: { fontSize: "1.2rem", fontWeight: "600", marginBottom: "4px" },
  trackItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    padding: "12px",
    textDecoration: "none",
    color: "#fff"
  },
  albumArt: { width: "48px", height: "48px", borderRadius: "4px" },
  trackName: { fontWeight: "600", fontSize: "0.95rem" },
  artistName: { color: "#888", fontSize: "0.85rem", marginTop: "2px" }
}
