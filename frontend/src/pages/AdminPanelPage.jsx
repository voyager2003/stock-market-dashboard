import { useState, useEffect } from 'react'
import { transactionAPI, authAPI } from '../services/api'
import TransactionTable from '../components/trading/TransactionTable'
import styles from './AdminPanelPage.module.css'

export default function AdminPanelPage() {
  const [transactions, setTx] = useState([])
  const [users, setUsers]     = useState([])
  const [activeTab, setTab]   = useState('transactions')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    Promise.all([transactionAPI.getAll(), authAPI.getAllUsers()])
      .then(([t, u]) => { setTx(t.data); setUsers(u.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await transactionAPI.updateStatus(id, status, '')
      setTx((prev) => prev.map((t) => (t._id === id ? { ...t, status: data.status } : t)))
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed')
    }
  }

  const filtered  = filter === 'all' ? transactions : transactions.filter((t) => t.status === filter)
  const pending   = transactions.filter((t) => t.status === 'pending').length

  return (
    <div className="page-container">
      <h1 className="page-title">🛡️ Admin Panel</h1>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className="card"><p className={styles.statLabel}>Total Users</p><p className={styles.statValue}>{users.length}</p></div>
        <div className="card"><p className={styles.statLabel}>Total Orders</p><p className={styles.statValue}>{transactions.length}</p></div>
        <div className="card"><p className={styles.statLabel}>Pending</p><p className={styles.statValue} style={{ color: 'var(--warning)' }}>{pending}</p></div>
        <div className="card"><p className={styles.statLabel}>Approved</p><p className={styles.statValue} style={{ color: 'var(--success)' }}>{transactions.filter((t) => t.status === 'approved').length}</p></div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('transactions')}>📋 Transactions</button>
        <button className={`btn ${activeTab === 'users'        ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('users')}>👥 Users</button>
      </div>

      {loading ? <div className="loading">Loading...</div> : activeTab === 'transactions' ? (
        <>
          <div className={styles.filters}>
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && pending > 0 && (
                  <span className={styles.badge}>{pending}</span>
                )}
              </button>
            ))}
          </div>
          <TransactionTable transactions={filtered} isAdmin onStatusUpdate={handleStatusUpdate} />
        </>
      ) : (
        <div className={styles.usersTable}>
          <table>
            <thead>
              <tr>
                <th>Username</th><th>Email</th><th>Role</th>
                <th>Balance</th><th>Watchlist</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-approved' : 'badge-pending'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>${u.balance?.toFixed(2)}</td>
                  <td>{u.watchlist?.length || 0} stocks</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}