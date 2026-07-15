import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"
import { moodLabel } from "../../utils/statsMath"
import { cardStyle, cardTitleStyle, cardSubtitleStyle } from "./shared"

function average(features, key) {
  if (features.length === 0) return 0
  return features.reduce((sum, f) => sum + f[key], 0) / features.length
}

export default function TasteRadar({ features }) {
  if (!features || features.length === 0) {
    return (
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Taste Profile</h2>
        <p style={cardSubtitleStyle}>
          Spotify's audio-features endpoint isn't available for this app right now, so this
          section is sitting this one out.
        </p>
      </div>
    )
  }

  const danceability = average(features, "danceability")
  const energy = average(features, "energy")
  const valence = average(features, "valence")
  const tempo = average(features, "tempo")
  const normalizedTempo = Math.max(0, Math.min(1, (tempo - 60) / 140))

  const data = [
    { metric: "Danceability", value: Math.round(danceability * 100) },
    { metric: "Energy", value: Math.round(energy * 100) },
    { metric: "Valence", value: Math.round(valence * 100) },
    { metric: "Tempo", value: Math.round(normalizedTempo * 100) }
  ]

  const label = moodLabel({ energy, valence, danceability })

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Taste Profile</h2>
      <p style={cardSubtitleStyle}>Averaged audio features across your top tracks.</p>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--chart-grid)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--chart-muted)", fontSize: 10 }} axisLine={false} />
            <Radar
              dataKey="value"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "0.8rem",
                color: "var(--text-primary)"
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={styles.summary}>
        <span style={styles.badge}>{label}</span>
        <span style={styles.tempoText}>~{Math.round(tempo)} BPM avg</span>
      </div>
    </div>
  )
}

const styles = {
  summary: { display: "flex", alignItems: "center", gap: "10px" },
  badge: {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "0.8rem",
    fontWeight: "700"
  },
  tempoText: { color: "var(--text-secondary)", fontSize: "0.85rem" }
}
