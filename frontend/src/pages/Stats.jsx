import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import GenreBreakdown from "../components/stats/GenreBreakdown"
import TimeRangeDiff from "../components/stats/TimeRangeDiff"
import ConcentrationScore from "../components/stats/ConcentrationScore"
import DiversityScore from "../components/stats/DiversityScore"
import ActivityHeatmap from "../components/stats/ActivityHeatmap"
import SessionHistogram from "../components/stats/SessionHistogram"
import RepeatPlays from "../components/stats/RepeatPlays"
import ProfileStatsCard from "../components/stats/ProfileStatsCard"
import TasteRadar from "../components/stats/TasteRadar"

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
const TIME_RANGES = ["short_term", "medium_term", "long_term"]

const emptyRanges = () => ({
  short_term: [],
  medium_term: [],
  long_term: []
})

export default function Stats() {
  const { tokenId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rangesArtists, setRangesArtists] = useState(emptyRanges)
  const [rangesTracks, setRangesTracks] = useState(emptyRanges)
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [profileStats, setProfileStats] = useState(null)
  const [audioFeatures, setAudioFeatures] = useState(null)

  useEffect(() => {
    if (!tokenId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const fetchAll = async () => {
      try {
        const [artistResults, trackResults, recentRes, profileRes] = await Promise.all([
          Promise.all(
            TIME_RANGES.map(time_range =>
              axios.get(`${API}/top-artists`, { params: { token_id: tokenId, time_range } })
            )
          ),
          Promise.all(
            TIME_RANGES.map(time_range =>
              axios.get(`${API}/top-tracks`, { params: { token_id: tokenId, time_range } })
            )
          ),
          axios.get(`${API}/recently-played`, { params: { token_id: tokenId } }),
          axios.get(`${API}/profile-stats`, { params: { token_id: tokenId } })
        ])

        if (cancelled) return

        const artists = emptyRanges()
        const tracks = emptyRanges()
        TIME_RANGES.forEach((range, i) => {
          artists[range] = artistResults[i].data
          tracks[range] = trackResults[i].data
        })
        setRangesArtists(artists)
        setRangesTracks(tracks)
        setRecentlyPlayed(recentRes.data)
        setProfileStats(profileRes.data)

        const featureTrackIds = tracks.medium_term.slice(0, 30).map(t => t.id).join(",")
        if (featureTrackIds) {
          try {
            const featuresRes = await axios.get(`${API}/audio-features`, {
              params: { token_id: tokenId, track_ids: featureTrackIds }
            })
            if (!cancelled) setAudioFeatures(featuresRes.data)
          } catch {
            if (!cancelled) setAudioFeatures({ available: false })
          }
        } else {
          setAudioFeatures({ available: false })
        }
      } catch {
        if (!cancelled) {
          setError(
            "Couldn't load your stats — if you logged in before this feature was added, try logging out and back in."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [tokenId])

  if (!tokenId) {
    return (
      <div style={styles.emptyContainer}>
        <h1 style={styles.title}>Advanced Stats</h1>
        <p style={styles.text}>Log in with Spotify on the Home page to see your stats.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={styles.emptyContainer}>
        <h1 style={styles.title}>Advanced Stats</h1>
        <p style={styles.text}>Crunching your listening history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.emptyContainer}>
        <h1 style={styles.title}>Advanced Stats</h1>
        <p style={styles.text}>{error}</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Advanced Stats</h1>
      <div style={styles.grid}>
        <GenreBreakdown rangesArtists={rangesArtists} />
        <TimeRangeDiff ranges={{
          short_term: { artists: rangesArtists.short_term, tracks: rangesTracks.short_term },
          medium_term: { artists: rangesArtists.medium_term, tracks: rangesTracks.medium_term },
          long_term: { artists: rangesArtists.long_term, tracks: rangesTracks.long_term }
        }} />
        <div style={styles.row}>
          <ConcentrationScore topTracks={rangesTracks.medium_term} />
          <DiversityScore artists={rangesArtists.medium_term} />
        </div>
        <ActivityHeatmap plays={recentlyPlayed} />
        <div style={styles.row}>
          <SessionHistogram plays={recentlyPlayed} />
          <RepeatPlays plays={recentlyPlayed} />
        </div>
        <div style={styles.row}>
          {profileStats && <ProfileStatsCard profileStats={profileStats} />}
          <TasteRadar features={audioFeatures?.available ? audioFeatures.features : null} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  emptyContainer: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "40px 20px",
    textAlign: "center"
  },
  title: { fontSize: "2rem", fontWeight: "700", marginBottom: "12px" },
  text: { color: "var(--text-secondary)" },
  grid: { display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "flex", gap: "20px", flexWrap: "wrap" }
}
