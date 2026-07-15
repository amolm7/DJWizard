export function giniCoefficient(values) {
  const vals = values.filter(v => v > 0).sort((a, b) => a - b)
  const n = vals.length
  if (n === 0) return 0
  const sum = vals.reduce((a, b) => a + b, 0)
  if (sum === 0) return 0
  let cumulative = 0
  for (let i = 0; i < n; i++) {
    cumulative += (i + 1) * vals[i]
  }
  return (2 * cumulative) / (n * sum) - (n + 1) / n
}

export function artistConcentration(topTracks) {
  const counts = {}
  for (const track of topTracks) {
    counts[track.artist] = (counts[track.artist] || 0) + 1
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return {
    gini: giniCoefficient(entries.map(([, c]) => c)),
    topArtist: entries[0] ? { name: entries[0][0], count: entries[0][1] } : null,
    uniqueArtists: entries.length,
    totalTracks: topTracks.length
  }
}

export function concentrationLabel(gini) {
  if (gini >= 0.5) return "On Repeat"
  if (gini >= 0.3) return "Balanced Listener"
  return "Wide Net Listener"
}

export function shannonEntropy(counts) {
  const positive = counts.filter(c => c > 0)
  const total = positive.reduce((a, b) => a + b, 0)
  if (total === 0 || positive.length <= 1) return 0
  const probs = positive.map(c => c / total)
  const rawEntropy = -probs.reduce((sum, p) => sum + p * Math.log2(p), 0)
  const maxEntropy = Math.log2(positive.length)
  return maxEntropy > 0 ? rawEntropy / maxEntropy : 0
}

export function diversityLabel(entropy) {
  if (entropy >= 0.7) return "Genre Omnivore"
  if (entropy >= 0.4) return "Genre Explorer"
  return "Genre Purist"
}

export function genreDistribution(artists, topN = 7) {
  const counts = {}
  for (const artist of artists) {
    for (const genre of artist.genres || []) {
      counts[genre] = (counts[genre] || 0) + 1
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, topN)
  const rest = sorted.slice(topN)
  const otherCount = rest.reduce((sum, [, c]) => sum + c, 0)
  const result = top.map(([genre, count]) => ({ genre, count }))
  if (otherCount > 0) result.push({ genre: "Other", count: otherCount })
  return result
}

function countGenres(artists) {
  const counts = {}
  for (const artist of artists) {
    for (const genre of artist.genres || []) {
      counts[genre] = (counts[genre] || 0) + 1
    }
  }
  return counts
}

// Builds one stacked-bar row per time range, using a single genre->color slot
// assignment (from the combined ranking) so the same genre keeps the same
// color across all three rows.
export function buildGenreTimeRangeSeries(rangesArtists, topN = 7) {
  const combined = [
    ...rangesArtists.short_term,
    ...rangesArtists.medium_term,
    ...rangesArtists.long_term
  ]
  const globalCounts = countGenres(combined)
  const genres = Object.entries(globalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([genre]) => genre)

  const rows = ["short_term", "medium_term", "long_term"].map(range => {
    const rangeCounts = countGenres(rangesArtists[range])
    const total = Object.values(rangeCounts).reduce((a, b) => a + b, 0)
    const row = { range }
    let otherCount = 0
    for (const [genre, count] of Object.entries(rangeCounts)) {
      if (!genres.includes(genre)) otherCount += count
    }
    for (const genre of genres) {
      row[genre] = total > 0 ? ((rangeCounts[genre] || 0) / total) * 100 : 0
    }
    row.Other = total > 0 ? (otherCount / total) * 100 : 0
    return row
  })

  return { genres, rows }
}

export function diffTopEntities(shortList, mediumList, longList, topN = 10) {
  const shortIds = new Set(shortList.slice(0, topN).map(i => i.id))
  const longIds = new Set(longList.slice(0, topN).map(i => i.id))
  return mediumList.slice(0, topN).map(item => {
    const inShort = shortIds.has(item.id)
    const inLong = longIds.has(item.id)
    let badge = null
    if (inShort && !inLong) badge = "new"
    else if (inShort && inLong) badge = "all-time"
    else if (!inShort && inLong) badge = "fading"
    return { ...item, badge }
  })
}

export function detectSessions(plays, gapMinutes = 30) {
  if (plays.length === 0) return []
  const sorted = [...plays].sort((a, b) => new Date(a.played_at) - new Date(b.played_at))
  const sessions = []
  let current = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const gapMs = new Date(sorted[i].played_at) - new Date(sorted[i - 1].played_at)
    if (gapMs <= gapMinutes * 60 * 1000) {
      current.push(sorted[i])
    } else {
      sessions.push(current)
      current = [sorted[i]]
    }
  }
  sessions.push(current)
  return sessions.map(session => {
    const start = new Date(session[0].played_at).getTime()
    const last = session[session.length - 1]
    const end = new Date(last.played_at).getTime() + (last.duration_ms || 0)
    return {
      trackCount: session.length,
      durationMinutes: Math.max(1, Math.round((end - start) / 60000))
    }
  })
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function buildHourDayGrid(plays) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0))
  for (const play of plays) {
    const d = new Date(play.played_at)
    grid[d.getDay()][d.getHours()]++
  }
  return { grid, dayLabels: DAY_LABELS }
}

export function repeatPlays(plays) {
  const counts = {}
  const meta = {}
  for (const p of plays) {
    counts[p.id] = (counts[p.id] || 0) + 1
    meta[p.id] = p
  }
  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ ...meta[id], count }))
    .sort((a, b) => b.count - a.count)
}

export function moodLabel({ energy, valence, danceability }) {
  let base
  if (energy >= 0.5 && valence < 0.5) base = "Intense & Moody"
  else if (energy >= 0.5 && valence >= 0.5) base = "Euphoric & Upbeat"
  else if (energy < 0.5 && valence >= 0.5) base = "Chill & Feel-good"
  else base = "Mellow & Melancholic"
  return danceability >= 0.65 ? `Danceable ${base}` : base
}
