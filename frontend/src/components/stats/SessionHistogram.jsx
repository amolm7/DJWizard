import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { detectSessions } from "../../utils/statsMath"
import { cardStyle, cardTitleStyle, cardSubtitleStyle } from "./shared"

function bucketSessions(sessions) {
  const buckets = { "1": 0, "2": 0, "3": 0, "4": 0, "5+": 0 }
  for (const session of sessions) {
    const key = session.trackCount >= 5 ? "5+" : String(session.trackCount)
    buckets[key]++
  }
  return Object.entries(buckets).map(([tracks, sessions]) => ({ tracks, sessions }))
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div style={styles.tooltip}>
      {label} track{label === "1" ? "" : "s"} per session: <strong>{payload[0].value}</strong>
    </div>
  )
}

export default function SessionHistogram({ plays }) {
  const sessions = detectSessions(plays)
  const data = bucketSessions(sessions)
  const avgDuration = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.durationMinutes, 0) / sessions.length)
    : 0

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Listening Sessions</h2>
      <p style={cardSubtitleStyle}>
        {sessions.length} session{sessions.length === 1 ? "" : "s"} detected in your recent plays
        (gaps &gt; 30 min start a new one) — averaging {avgDuration} min each.
      </p>
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="tracks"
              tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              label={{ value: "tracks / session", position: "insideBottom", offset: -4, fill: "var(--chart-muted)", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-elevated)" }} />
            <Bar dataKey="sessions" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
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
    padding: "8px 12px",
    fontSize: "0.8rem",
    color: "var(--text-primary)"
  }
}
