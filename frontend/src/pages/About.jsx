const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "40px 20px",
    textAlign: "center"
  },
  title: { fontSize: "2rem", fontWeight: "700", marginBottom: "12px" },
  text: { color: "var(--text-secondary)" }
}

export default function About() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>About</h1>
      <p style={styles.text}>
        DJWizard turns a described vibe into a Spotify playlist.
      </p>
    </div>
  )
}
