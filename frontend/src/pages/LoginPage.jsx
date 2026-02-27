import { Link } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  return (
    <div className={styles.authPage}>
      <div className={`card ${styles.authCard}`}>
        <div className={styles.logo}>📈</div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your stock dashboard</p>
        <LoginForm />
        <p className={styles.switchLink}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}