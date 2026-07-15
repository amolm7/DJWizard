import { repeatPlays } from "../../utils/statsMath"
import { cardStyle, cardTitleStyle, cardSubtitleStyle } from "./shared"

export default function RepeatPlays({ plays }) {
  const repeats = repeatPlays(plays)

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>On Repeat Right Now</h2>
      <p style={cardSubtitleStyle}>
        Tracks that showed up more than once in your last {plays.length} plays.
      </p>
      {repeats.length === 0 ? (
        <p style={cardSubtitleStyle}>Nothing on repeat lately — pretty varied listening!</p>
      ) : (
        <div style={styles.list}>
          {repeats.slice(0, 8).map(track => (
            <a
              key={track.id}
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.row}
            >
              {track.album_image && (
                <img src={track.album_image} alt={track.name} style={styles.art} />
              )}
              <div style={styles.trackMeta}>
                <p style={styles.trackName}>{track.name}</p>
                <p style={styles.artistName}>{track.artist}</p>
              </div>
              <span style={styles.countBadge}>×{track.count}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "var(--bg-elevated)",
    borderRadius: "8px",
    padding: "8px 10px",
    textDecoration: "none",
    color: "var(--text-primary)"
  },
  art: { width: "36px", height: "36px", borderRadius: "4px", flexShrink: 0 },
  trackMeta: { flex: 1, minWidth: 0 },
  trackName: { fontWeight: "600", fontSize: "0.85rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  artistName: { color: "var(--text-secondary)", fontSize: "0.78rem", margin: 0 },
  countBadge: {
    color: "var(--accent)",
    fontWeight: "700",
    fontSize: "0.85rem",
    flexShrink: 0
  }
}
