import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts"
import { buildGenreTimeRangeSeries } from "../../utils/statsMath"
import { cardStyle, cardTitleStyle, cardSubtitleStyle, genreColor } from "./shared"

const RANGE_LABELS = {
  short_term: "Last 4 Weeks",
  medium_term: "Last 6 Months",
  long_term: "All Time"
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  const sorted = [...payload].filter(p => p.value > 0.5).sort((a, b) => b.value - a.value)
  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipTitle}>{RANGE_LABELS[label] || label}</p>
      {sorted.map(p => (
        <div key={p.dataKey} style={styles.tooltipRow}>
          <span style={{ ...styles.tooltipDot, backgroundColor: p.color }} />
          <span>{p.dataKey}</span>
          <span style={styles.tooltipValue}>{p.value.toFixed(0)}%</span>
        </div>
      ))}
    </div>
  )
}

export default function GenreBreakdown({ rangesArtists }) {
  const { genres, rows } = buildGenreTimeRangeSeries(rangesArtists)
  const data = rows.map(row => ({ ...row, rangeLabel: RANGE_LABELS[row.range] }))

  if (genres.length === 0) {
    return (
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Genre Breakdown</h2>
        <p style={cardSubtitleStyle}>Not enough artist/genre data yet.</p>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Genre Breakdown</h2>
      <p style={cardSubtitleStyle}>
        Share of genres across your top artists, split by time range — watch your taste shift.
      </p>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
              tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="range"
              tickFormatter={r => RANGE_LABELS[r]}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-elevated)" }} />
            <Legend wrapperStyle={{ fontSize: "0.8rem", color: "var(--text-secondary)" }} />
            {genres.map((genre, i) => (
              <Bar
                key={genre}
                dataKey={genre}
                stackId="genres"
                fill={genreColor(i)}
                stroke="var(--bg-card)"
                strokeWidth={2}
                radius={i === genres.length - 1 ? [0, 0, 0, 0] : undefined}
              />
            ))}
            <Bar dataKey="Other" stackId="genres" fill="var(--chart-other)" stroke="var(--bg-card)" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const styles = {
  tooltip: {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "0.8rem",
    color: "var(--text-primary)"
  },
  tooltipTitle: { fontWeight: "700", marginBottom: "6px" },
  tooltipRow: { display: "flex", alignItems: "center", gap: "6px", padding: "2px 0" },
  tooltipDot: { width: "8px", height: "8px", borderRadius: "50%", display: "inline-block", flexShrink: 0 },
  tooltipValue: { marginLeft: "auto", fontWeight: "600" }
}
