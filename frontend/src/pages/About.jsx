const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "40px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  title: { fontSize: "2rem", fontWeight: "700", marginBottom: "4px" },
  text: { color: "var(--text-secondary)" },
  links: { display: "flex", justifyContent: "center", gap: "16px", marginTop: "4px" },
  link: {
    color: "var(--accent)",
    textDecoration: "none",
    fontWeight: "600"
  }
}

export default function About() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>About</h1>
      <p style={styles.text}>
        DJWizard turns a described vibe into a Spotify playlist.
      </p>
      <p style={styles.text}>
        Created by Amol Mathur, a frequent Spotify user. If you want to check out more of my
        work, feel free to visit my GitHub or connect on LinkedIn.
      </p>
      <div style={styles.links}>
        <a
          href="https://github.com/amolm7"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          GitHub ↗
        </a>
        <a
          href="https://www.linkedin.com/in/amolmathur12"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          LinkedIn ↗
        </a>
      </div>
    </div>
  )
}
