const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "40px 20px",
    textAlign: "center"
  },
  title: { fontSize: "2rem", fontWeight: "700", marginBottom: "12px" },
  text: { color: "#888" }
}



export default function Playlists() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Playlists</h1>
      <p style={styles.text}>Coming soon.</p>
    </div>
  )
}
