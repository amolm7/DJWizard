import { NavLink } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"

const links = [
  { to: "/", label: "Home" },
  { to: "/playlists", label: "My Playlists" },
  { to: "/stats", label: "Advanced Stats" },
  { to: "/about", label: "About" }
]

export default function NavBar() {
  const { theme, toggleTheme } = useTheme()
  const { tokenId, logout } = useAuth()

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
        {tokenId && (
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        )}
        <button
          onClick={toggleTheme}
          style={styles.themeToggle}
          aria-label="Toggle light/dark mode"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
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
    borderBottom: "1px solid var(--nav-border)"
  },
  brand: {
    fontFamily: "'Bungee', cursive",
    fontSize: "1.1rem",
    color: "var(--text-primary)",
    textDecoration: "none",
    letterSpacing: "1px"
  },
  links: { display: "flex", alignItems: "center", gap: "24px" },
  link: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.9rem"
  },
  linkActive: { color: "var(--accent)" },
  logoutButton: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontFamily: "inherit",
    padding: 0
  },
  themeToggle: {
    background: "transparent",
    border: "none",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1rem",
    lineHeight: 1
  }
}
