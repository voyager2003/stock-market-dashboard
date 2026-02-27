import { useState, useEffect } from 'react'
import { transactionAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import TransactionTable from '../components/trading/TransactionTable'
import styles from './UserPanelPage.module.css'

export default function UserPanelPage() {
  const { user }                  = useAuth()
  const [transactions, setTx]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')

  useEffect(() => {
    transactionAPI.getMy()
      .then(({ data }) => setTx(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.status === filter)

  const stats = {
    pending:  transactions.filter((t) => t.status === 'pending').length,
    approved: transactions.filter((t) => t.status === 'approved').length,
    rejected: transactions.filter((t) => t.status === 'rejected').length,
  }

  return (
    <div className="page-container">
      <h1 className="page-title">My Trading Panel</h1>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className="card">
          <p className={styles.statLabel}>Balance</p>
          <p className={styles.statValue} style={{ color: 'var(--success)' }}>${user?.balance?.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className={styles.statLabel}>Total Orders</p>
          <p className={styles.statValue}>{transactions.length}</p>
        </div>
        <div className="card">
          <p className={styles.statLabel}>Pending</p>
          <p className={styles.statValue} style={{ color: 'var(--warning)' }}>{stats.pending}</p>
        </div>
        <div className="card">
          <p className={styles.statLabel}>Approved</p>
          <p className={styles.statValue} style={{ color: 'var(--success)' }}>{stats.approved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading transactions...</div>
      ) : (
        <TransactionTable transactions={filtered} isAdmin={false} />
      )}
    </div>
  )
}