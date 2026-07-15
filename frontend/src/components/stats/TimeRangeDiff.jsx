import { diffTopEntities } from "../../utils/statsMath"
import { cardStyle, cardTitleStyle, cardSubtitleStyle } from "./shared"

const BADGE_META = {
  new: { label: "New", icon: "🔥", color: "var(--chart-good)" },
  "all-time": { label: "All-time", icon: "⭐", color: "var(--accent)" },
  fading: { label: "Fading", icon: "📉", color: "var(--text-secondary)" }
}

function DiffColumn({ title, items, nameKey }) {
  return (
    <div style={styles.column}>
      <h3 style={styles.columnTitle}>{title}</h3>
      <div style={styles.list}>
        {items.map((item, i) => {
          const badge = item.badge && BADGE_META[item.badge]
          return (
            <div key={item.id || i} style={styles.row}>
              <span style={styles.rank}>{i + 1}</span>
              <span style={styles.name}>{item[nameKey]}</span>
              {badge && (
                <span style={{ ...styles.badge, color: badge.color, borderColor: badge.color }}>
                  {badge.icon} {badge.label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TimeRangeDiff({ ranges }) {
  const artistDiff = diffTopEntities(
    ranges.short_term.artists,
    ranges.medium_term.artists,
    ranges.long_term.artists,
    8
  )
  const trackDiff = diffTopEntities(
    ranges.short_term.tracks,
    ranges.medium_term.tracks,
    ranges.long_term.tracks,
    8
  )

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>What's New vs. All-Time</h2>
      <p style={cardSubtitleStyle}>
        Your current (6-month) top list, flagged against what's freshly hot (4 weeks) and what's
        stuck around forever.
      </p>
      <div style={styles.columns}>
        <DiffColumn title="Top Artists" items={artistDiff} nameKey="name" />
        <DiffColumn title="Top Tracks" items={trackDiff} nameKey="name" />
      </div>
    </div>
  )
}

const styles = {
  columns: { display: "flex", gap: "24px", flexWrap: "wrap" },
  column: { flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "8px" },
  columnTitle: { fontSize: "0.9rem", fontWeight: "700", margin: 0, color: "var(--text-secondary)" },
  list: { display: "flex", flexDirection: "column", gap: "4px" },
  row: { display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" },
  rank: { color: "var(--text-secondary)", fontSize: "0.75rem", width: "16px", flexShrink: 0 },
  name: { fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  badge: {
    marginLeft: "auto",
    fontSize: "0.7rem",
    fontWeight: "600",
    border: "1px solid",
    borderRadius: "999px",
    padding: "2px 8px",
    whiteSpace: "nowrap",
    flexShrink: 0
  }
}
