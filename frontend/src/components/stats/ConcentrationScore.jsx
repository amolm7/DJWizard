import { artistConcentration, concentrationLabel } from "../../utils/statsMath"
import { cardStyle, cardTitleStyle, cardSubtitleStyle } from "./shared"

export default function ConcentrationScore({ topTracks }) {
  const { gini, topArtist, uniqueArtists, totalTracks } = artistConcentration(topTracks)
  const label = concentrationLabel(gini)
  const pct = Math.round(gini * 100)

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Artist Loyalty</h2>
      <p style={cardSubtitleStyle}>
        How concentrated your top {totalTracks} tracks are across {uniqueArtists} artists.
      </p>
      <div style={styles.meterWrap}>
        <div style={styles.meterTrack}>
          <div style={{ ...styles.meterFill, width: `${pct}%` }} />
        </div>
        <div style={styles.meterLabels}>
          <span>Wide Net</span>
          <span>On Repeat</span>
        </div>
      </div>
      <div style={styles.summary}>
        <span style={styles.badge}>{label}</span>
        <span style={styles.giniValue}>Gini {gini.toFixed(2)}</span>
      </div>
      {topArtist && (
        <p style={cardSubtitleStyle}>
          Most repeated: <strong style={{ color: "var(--text-primary)" }}>{topArtist.name}</strong>{" "}
          ({topArtist.count} track{topArtist.count === 1 ? "" : "s"} in your top {totalTracks})
        </p>
      )}
    </div>
  )
}

const styles = {
  meterWrap: { display: "flex", flexDirection: "column", gap: "6px" },
  meterTrack: {
    height: "10px",
    borderRadius: "999px",
    backgroundColor: "var(--border)",
    overflow: "hidden"
  },
  meterFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, var(--chart-seq-250), var(--chart-seq-700))",
    transition: "width 0.3s ease"
  },
  meterLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "var(--text-secondary)"
  },
  summary: { display: "flex", alignItems: "center", gap: "10px" },
  badge: {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "0.8rem",
    fontWeight: "700"
  },
  giniValue: { color: "var(--text-secondary)", fontSize: "0.85rem" }
}
