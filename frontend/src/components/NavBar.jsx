import { NavLink } from "react-router-dom"

const links = [
  { to: "/", label: "Home" },
  { to: "/playlists", label: "My Playlists" },
  { to: "/stats", label: "Advanced Stats" },
  { to: "/about", label: "About" }
]

export default function NavBar() {
  return (
    <nav style={styles.nav}>
      <NavLink to="/" style={styles.brand}>
        DJWizard
      </NavLink>
      <div style={styles.links}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {})
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: "1px solid #1f1f1f"
  },
  brand: {
    fontFamily: "'Bungee', cursive",
    fontSize: "1.1rem",
    color: "#fff",
    textDecoration: "none",
    letterSpacing: "1px"
  },
  links: { display: "flex", gap: "24px" },
  link: {
    color: "#888",
    textDecoration: "none",
    fontSize: "0.9rem"
  },
  linkActive: { color: "#1DB954" }
}
