import { useNavigate } from 'react-router-dom'
import { watchlistAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from './StockCard.module.css'

export default function StockCard({ stock, inWatchlist }) {
  const navigate           = useNavigate()
  const { updateWatchlist } = useAuth()
  const isPositive         = stock.change >= 0

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation()
    try {
      const res = inWatchlist
        ? await watchlistAPI.remove(stock.symbol)
        : await watchlistAPI.add(stock.symbol)
      updateWatchlist(res.data.watchlist)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={`card ${styles.stockCard}`} onClick={() => navigate(`/stock/${stock.symbol}`)}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.symbol}>{stock.symbol}</h3>
          <p className={styles.price}>${stock.price?.toFixed(2)}</p>
        </div>
        <button
          className={`${styles.watchBtn} ${inWatchlist ? styles.inList : ''}`}
          onClick={handleWatchlistToggle}
          title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inWatchlist ? '★' : '☆'}
        </button>
      </div>

      <div className={styles.stats}>
        <span className={isPositive ? 'positive' : 'negative'}>
          {isPositive ? '▲' : '▼'} {Math.abs(stock.change)?.toFixed(2)} ({stock.changePercent})
        </span>
      </div>

      <div className={styles.meta}>
        <span>H: ${stock.high?.toFixed(2)}</span>
        <span>L: ${stock.low?.toFixed(2)}</span>
        <span>Vol: {stock.volume?.toLocaleString()}</span>
      </div>
    </div>
  )
}