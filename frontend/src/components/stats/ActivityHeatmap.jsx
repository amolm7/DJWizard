import { useState } from "react"
import { buildHourDayGrid } from "../../utils/statsMath"
import { cardStyle, cardTitleStyle, cardSubtitleStyle } from "./shared"

function cellColor(count) {
  if (count === 0) return "var(--bg-elevated)"
  if (count === 1) return "var(--chart-seq-250)"
  if (count === 2) return "var(--chart-seq-400)"
  if (count === 3) return "var(--chart-seq-550)"
  return "var(--chart-seq-700)"
}

export default function ActivityHeatmap({ plays }) {
  const [hovered, setHovered] = useState(null)

  if (plays.length === 0) {
    return (
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Listening Activity</h2>
        <p style={cardSubtitleStyle}>No recent play history available.</p>
      </div>
    )
  }

  const { grid, dayLabels } = buildHourDayGrid(plays)

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Listening Activity</h2>
      <p style={cardSubtitleStyle}>
        When you've been listening, from your last {plays.length} plays (hour of day × day of week).
      </p>
      <div style={styles.gridWrap}>
        <div style={styles.hourAxis}>
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} style={styles.hourTick}>
              {h % 3 === 0 ? h : ""}
            </span>
          ))}
        </div>
        {grid.map((row, dayIdx) => (
          <div key={dayIdx} style={styles.row}>
            <span style={styles.dayLabel}>{dayLabels[dayIdx]}</span>
            <div style={styles.cells}>
              {row.map((count, hourIdx) => (
                <div
                  key={hourIdx}
                  style={{ ...styles.cell, backgroundColor: cellColor(count) }}
                  onMouseEnter={() => setHovered({ day: dayLabels[dayIdx], hour: hourIdx, count })}
                  onMouseLeave={() => setHovered(null)}
                  title={`${dayLabels[dayIdx]} ${hourIdx}:00 — ${count} play${count === 1 ? "" : "s"}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={styles.footer}>
        <div style={styles.legend}>
          <span style={cardSubtitleStyle}>Fewer</span>
          {[0, 1, 2, 3, 4].map(n => (
            <div key={n} style={{ ...styles.legendSwatch, backgroundColor: cellColor(n) }} />
          ))}
          <span style={cardSubtitleStyle}>More</span>
        </div>
        <span style={styles.hoverReadout}>
          {hovered ? `${hovered.day} ${hovered.hour}:00 — ${hovered.count} play${hovered.count === 1 ? "" : "s"}` : " "}
        </span>
      </div>
    </div>
  )
}

const styles = {
  gridWrap: { display: "flex", flexDirection: "column", gap: "3px", overflowX: "auto" },
  hourAxis: { display: "flex", gap: "3px", paddingLeft: "32px", minWidth: "480px" },
  hourTick: {
    flex: 1,
    fontSize: "0.65rem",
    color: "var(--chart-muted)",
    textAlign: "center"
  },
  row: { display: "flex", alignItems: "center", gap: "6px", minWidth: "480px" },
  dayLabel: { width: "26px", fontSize: "0.75rem", color: "var(--text-secondary)", flexShrink: 0 },
  cells: { display: "flex", gap: "3px", flex: 1 },
  cell: {
    flex: 1,
    aspectRatio: "1",
    borderRadius: "3px",
    cursor: "pointer",
    minWidth: "14px"
  },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" },
  legend: { display: "flex", alignItems: "center", gap: "4px" },
  legendSwatch: { width: "14px", height: "14px", borderRadius: "3px" },
  hoverReadout: { fontSize: "0.8rem", color: "var(--text-secondary)" }
}
