import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const API = "http://127.0.0.1:5000"

export default function Playlists() {
  const { tokenId } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [generatingId, setGeneratingId] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const toggleExpanded = id => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  useEffect(() => {
    if (!tokenId) {
      setLoading(false)
      return
    }
    setLoading(true)
    axios
      .get(`${API}/playlists`, { params: { token_id: tokenId } })
      .then(res => setPlaylists(res.data))
      .catch(() => setPlaylists([]))
      .finally(() => setLoading(false))
  }, [tokenId])

  const startRename = playlist => {
    setEditingId(playlist.id)
    setEditValue(playlist.name)
  }

  const cancelRename = () => {
    setEditingId(null)
    setEditValue("")
  }

  const saveRename = async playlistId => {
    if (!editValue.trim()) return
    const res = await axios.patch(`${API}/playlists/${playlistId}`, {
      token_id: tokenId,
      name: editValue.trim()
    })
    setPlaylists(prev => prev.map(p => (p.id === playlistId ? res.data : p)))
    setEditingId(null)
    setEditValue("")
  }

  const generateMore = async playlistId => {
    setGeneratingId(playlistId)
    try {
      const res = await axios.post(`${API}/playlists/${playlistId}/more`, {
        token_id: tokenId
      })
      setPlaylists(prev => prev.map(p => (p.id === playlistId ? res.data : p)))
    } finally {
      setGeneratingId(null)
    }
  }

  const saveToSpotify = async playlistId => {
    setSavingId(playlistId)
    try {
      const res = await axios.post(`${API}/playlists/${playlistId}/save-to-spotify`, {
        token_id: tokenId
      })
      setPlaylists(prev => prev.map(p => (p.id === playlistId ? res.data : p)))
    } finally {
      setSavingId(null)
    }
  }

  if (!tokenId) {
    return (
      <div style={styles.emptyContainer}>
        <h1 style={styles.title}>My Playlists</h1>
        <p style={styles.text}>Log in with Spotify on the Home page to see your playlists.</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Playlists</h1>

      {loading && <p style={styles.text}>Loading...</p>}

      {!loading && playlists.length === 0 && (
        <p style={styles.text}>No playlists yet. Generate one from the Home page.</p>
      )}

      <div style={styles.list}>
        {playlists.map(playlist => {
          const isExpanded = expandedIds.has(playlist.id)
          return (
            <div key={playlist.id} style={styles.card}>
              {editingId === playlist.id ? (
                <div style={styles.renameRow}>
                  <input
                    style={styles.renameInput}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveRename(playlist.id)}
                    autoFocus
                  />
                  <button style={styles.smallButton} onClick={() => saveRename(playlist.id)}>
                    Save
                  </button>
                  <button style={styles.smallButtonSecondary} onClick={cancelRename}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={styles.titleRow}>
                  <h2 style={styles.playlistName}>{playlist.name}</h2>
                  <div style={styles.titleActions}>
                    <button style={styles.smallButtonSecondary} onClick={() => startRename(playlist)}>
                      Rename
                    </button>
                    <button
                      style={styles.toggleButton}
                      onClick={() => toggleExpanded(playlist.id)}
                      aria-label={isExpanded ? "Collapse playlist" : "Expand playlist"}
                    >
                      <span
                        style={{
                          ...styles.chevron,
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                        }}
                      >
                        ▾
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {isExpanded && (
                <>
                  {playlist.summary && <p style={styles.summary}>{playlist.summary}</p>}

                  <div style={styles.tracklist}>
                    {playlist.tracks.map((track, i) => (
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

                  <div style={styles.actionsRow}>
                    <button
                      style={styles.moreButton}
                      onClick={() => generateMore(playlist.id)}
                      disabled={generatingId === playlist.id}
                    >
                      {generatingId === playlist.id ? "Finding more songs..." : "Generate More Like This"}
                    </button>
                    {playlist.spotify_url ? (
                      <a
                        href={playlist.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.spotifyButton}
                      >
                        Open in Spotify ↗
                      </a>
                    ) : (
                      <button
                        style={styles.spotifyButton}
                        onClick={() => saveToSpotify(playlist.id)}
                        disabled={savingId === playlist.id}
                      >
                        {savingId === playlist.id ? "Saving..." : "Save to Spotify"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "700px",
    margin: "0 auto",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  emptyContainer: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "40px 20px",
    textAlign: "center"
  },
  title: { fontSize: "2rem", fontWeight: "700", marginBottom: "12px" },
  text: { color: "var(--text-secondary)" },
  list: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  playlistName: { fontSize: "1.3rem", fontWeight: "700", margin: 0 },
  titleActions: { display: "flex", alignItems: "center", gap: "8px" },
  toggleButton: {
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0
  },
  chevron: {
    display: "inline-block",
    fontSize: "0.9rem",
    lineHeight: 1,
    transition: "transform 0.2s"
  },
  renameRow: { display: "flex", gap: "8px" },
  renameInput: {
    flex: 1,
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "var(--text-primary)",
    fontSize: "1rem",
    outline: "none"
  },
  smallButton: {
    backgroundColor: "var(--accent)",
    color: "var(--accent-contrast)",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  smallButtonSecondary: {
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  summary: { color: "var(--text-tertiary)", lineHeight: "1.5", margin: 0 },
  tracklist: { display: "flex", flexDirection: "column", gap: "10px" },
  trackItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "var(--bg-elevated)",
    borderRadius: "8px",
    padding: "10px 12px",
    textDecoration: "none",
    color: "var(--text-primary)"
  },
  albumArt: { width: "44px", height: "44px", borderRadius: "4px" },
  trackName: { fontWeight: "600", fontSize: "0.9rem", margin: 0 },
  artistName: { color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "2px" },
  moreButton: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    color: "var(--accent)",
    border: "1px solid var(--accent)",
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer"
  },
  actionsRow: { display: "flex", flexWrap: "wrap", gap: "12px" },
  spotifyButton: {
    alignSelf: "flex-start",
    backgroundColor: "var(--accent)",
    color: "var(--accent-contrast)",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center"
  }
}
