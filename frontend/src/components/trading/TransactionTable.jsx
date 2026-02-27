import styles from './TransactionTable.module.css'

export default function TransactionTable({ transactions, isAdmin, onStatusUpdate }) {
  const formatDate = (str) =>
    new Date(str).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className={styles.tableWrapper}>
      <table>
        <thead>
          <tr>
            {isAdmin && <th>User</th>}
            <th>Symbol</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 9 : 7}
                style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}
              >
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t._id}>
                {isAdmin && <td>{t.username || t.user?.username}</td>}
                <td><strong>{t.symbol}</strong></td>
                <td><span className={`badge badge-${t.type}`}>{t.type.toUpperCase()}</span></td>
                <td>{t.quantity}</td>
                <td>${t.price.toFixed(2)}</td>
                <td><strong>${t.total.toFixed(2)}</strong></td>
                <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                <td>{formatDate(t.createdAt)}</td>
                {isAdmin && (
                  <td>
                    {t.status === 'pending' ? (
                      <div className={styles.actionBtns}>
                        <button
                          className="btn btn-success"
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                          onClick={() => onStatusUpdate(t._id, 'approved')}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                          onClick={() => onStatusUpdate(t._id, 'rejected')}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Done</span>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}