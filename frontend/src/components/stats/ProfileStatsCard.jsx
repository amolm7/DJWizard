import { cardStyle, cardTitleStyle, cardSubtitleStyle } from "./shared"

function curatorLabel(ratio) {
  if (ratio >= 8) return "Playlist Architect"
  if (ratio >= 2) return "Balanced Curator"
  return "Liked Songs Hoarder"
}

export default function ProfileStatsCard({ profileStats }) {
  const { saved_tracks: savedTracks, followed_artists: followedArtists, playlists } = profileStats
  const ratio = savedTracks > 0 ? (playlists / savedTracks) * 100 : 0

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Collector Profile</h2>
      <p style={cardSubtitleStyle}>Your library at a glance.</p>
      <div style={styles.tiles}>
        <div style={styles.tile}>
          <span style={styles.tileValue}>{savedTracks.toLocaleString()}</span>
          <span style={styles.tileLabel}>Saved Tracks</span>
        </div>
        <div style={styles.tile}>
          <span style={styles.tileValue}>{followedArtists.toLocaleString()}</span>
          <span style={styles.tileLabel}>Followed Artists</span>
        </div>
        <div style={styles.tile}>
          <span style={styles.tileValue}>{playlists.toLocaleString()}</span>
          <span style={styles.tileLabel}>Playlists</span>
        </div>
      </div>
      <div style={styles.summary}>
        <span style={styles.badge}>{curatorLabel(ratio)}</span>
        <span style={cardSubtitleStyle}>
          ~{ratio.toFixed(1)} playlists per 100 saved tracks
        </span>
      </div>
    </div>
  )
}

const styles = {
  tiles: { display: "flex", gap: "16px", flexWrap: "wrap" },
  tile: { display: "flex", flexDirection: "column", gap: "2px", flex: "1 1 100px" },
  tileValue: { fontSize: "1.8rem", fontWeight: "700" },
  tileLabel: { color: "var(--text-secondary)", fontSize: "0.8rem" },
  summary: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  badge: {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "0.8rem",
    fontWeight: "700"
  }
}
