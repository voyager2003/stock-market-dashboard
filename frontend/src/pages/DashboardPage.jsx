import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { stockAPI } from '../services/api'
import StockCard from '../components/stock/StockCard'
import styles from './DashboardPage.module.css'

const DEFAULT_STOCKS = ['AAPL', 'TSLA', 'MSFT']

export default function DashboardPage() {
  const { user }                    = useAuth()
  const [searchSymbol, setSearch]   = useState('')
  const [stocks, setStocks]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [searching, setSearching]   = useState(false)
  const [error, setError]           = useState('')

  const loadDefault = async () => {
    setLoading(true)
    setError('')
    try {
      const results = await Promise.allSettled(DEFAULT_STOCKS.map((s) => stockAPI.getQuote(s)))
      setStocks(results.filter((r) => r.status === 'fulfilled').map((r) => r.value.data))
    } catch (err) {
      setError('Failed to load stocks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDefault() }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchSymbol.trim()) return
    setSearching(true)
    setError('')
    try {
      const { data } = await stockAPI.getQuote(searchSymbol.trim().toUpperCase())
      setStocks([data])
    } catch (err) {
      setError(err.response?.data?.message || 'Stock not found')
    } finally {
      setSearching(false)
    }
  }

  const handleWatchlistClick = async (sym) => {
    setError('')
    try {
      const { data } = await stockAPI.getQuote(sym)
      setStocks([data])
    } catch (err) {
      setError('Failed to load stock')
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            Good day, {user?.username} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Balance: <strong style={{ color: 'var(--success)' }}>${user?.balance?.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className={`card ${styles.searchCard}`}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            value={searchSymbol}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Search stock symbol (AAPL, TSLA, GOOGL...)"
            className={styles.searchInput}
          />
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? '...' : '🔍 Search'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => { setSearch(''); loadDefault() }}>
            Reset
          </button>
        </form>
      </div>

      {/* Watchlist shortcuts */}
      {user?.watchlist?.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>⭐ Your Watchlist</h2>
          <div className={styles.symbols}>
            {user.watchlist.map((sym) => (
              <button
                key={sym}
                className="btn btn-outline"
                style={{ fontWeight: 700, fontSize: '0.85rem' }}
                onClick={() => handleWatchlistClick(sym)}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Grid */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📊 Stocks</h2>
        {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}
        {loading ? (
          <div className="loading">Loading stocks...</div>
        ) : (
          <div className={styles.grid}>
            {stocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                inWatchlist={user?.watchlist?.includes(stock.symbol)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}