import { Link } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm'
import styles from './AuthPage.module.css'

export default function SignupPage() {
  return (
    <div className={styles.authPage}>
      <div className={`card ${styles.authCard}`}>
        <div className={styles.logo}>📈</div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Start trading on StockDash</p>
        <SignupForm />
        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}