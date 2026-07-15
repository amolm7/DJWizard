export const cardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  flex: "1 1 320px",
  minWidth: 0
}

export const cardTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "700",
  margin: 0
}

export const cardSubtitleStyle = {
  color: "var(--text-secondary)",
  fontSize: "0.85rem",
  margin: 0,
  lineHeight: 1.5
}

export const GENRE_COLOR_VARS = [
  "--chart-1", "--chart-2", "--chart-3", "--chart-4",
  "--chart-5", "--chart-6", "--chart-7", "--chart-8"
]

export function genreColor(index) {
  return `var(${GENRE_COLOR_VARS[index] || "--chart-other"})`
}
