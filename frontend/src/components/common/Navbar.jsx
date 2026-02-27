import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout }     = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate             = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/dashboard">📈 StockDash</Link>
      </div>

      <div className={styles.links}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/my-panel">My Panel</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={styles.adminLink}>Admin Panel</Link>
        )}
      </div>

      <div className={styles.right}>
        <span className={styles.watchlistBadge}>
          🔖 {user?.watchlist?.length || 0}
        </span>
        <span className={styles.username}>👤 {user?.username}</span>
        <button className={styles.themeBtn} onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className={`btn btn-outline ${styles.logoutBtn}`} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}