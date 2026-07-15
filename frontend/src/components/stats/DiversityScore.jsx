import { genreDistribution, shannonEntropy, diversityLabel } from "../../utils/statsMath"
import { cardStyle, cardTitleStyle, cardSubtitleStyle } from "./shared"

export default function DiversityScore({ artists }) {
  const distribution = genreDistribution(artists, 100)
  const entropy = shannonEntropy(distribution.map(d => d.count))
  const label = diversityLabel(entropy)
  const uniqueGenres = distribution.length
  const topGenre = distribution[0]

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Genre Diversity</h2>
      <p style={cardSubtitleStyle}>
        How spread out your listening is across {uniqueGenres} genres (last 6 months).
      </p>
      <div style={styles.scoreRow}>
        <span style={styles.scoreValue}>{Math.round(entropy * 100)}</span>
        <span style={styles.scoreOutOf}>/ 100</span>
      </div>
      <div style={styles.meterTrack}>
        <div style={{ ...styles.meterFill, width: `${Math.round(entropy * 100)}%` }} />
      </div>
      <div style={styles.summary}>
        <span style={styles.badge}>{label}</span>
        {topGenre && (
          <span style={styles.topGenre}>
            top genre: <strong style={{ color: "var(--text-primary)" }}>{topGenre.genre}</strong>
          </span>
        )}
      </div>
    </div>
  )
}

const styles = {
  scoreRow: { display: "flex", alignItems: "baseline", gap: "4px" },
  scoreValue: { fontSize: "2.2rem", fontWeight: "700", lineHeight: 1 },
  scoreOutOf: { color: "var(--text-secondary)", fontSize: "1rem" },
  meterTrack: {
    height: "10px",
    borderRadius: "999px",
    backgroundColor: "var(--border)",
    overflow: "hidden"
  },
  meterFill: {
    height: "100%",
    borderRadius: "999px",
    backgroundColor: "var(--chart-2)",
    transition: "width 0.3s ease"
  },
  summary: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  badge: {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "0.8rem",
    fontWeight: "700"
  },
  topGenre: { color: "var(--text-secondary)", fontSize: "0.85rem" }
}
