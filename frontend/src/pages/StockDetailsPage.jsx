import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { stockAPI, transactionAPI, watchlistAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ChartComponent from '../components/stock/ChartComponent'
import styles from './StockDetailsPage.module.css'

export default function StockDetailsPage() {
  const { symbol }   = useParams()
  const navigate     = useNavigate()
  const { user, updateWatchlist, updateBalance } = useAuth()

  const [quote, setQuote]         = useState(null)
  const [history, setHistory]     = useState([])
  const [days, setDays]           = useState(30)
  const [loading, setLoading]     = useState(true)
  const [tradeForm, setTradeForm] = useState({ type: 'buy', quantity: 1 })
  const [tradeMsg, setTradeMsg]   = useState({ text: '', type: '' })
  const [submitting, setSubmitting] = useState(false)

  const inWatchlist = user?.watchlist?.includes(symbol)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [q, h] = await Promise.all([
          stockAPI.getQuote(symbol),
          stockAPI.getHistory(symbol, days),
        ])
        setQuote(q.data)
        setHistory(h.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [symbol, days])

  const handleWatchlistToggle = async () => {
    try {
      const res = inWatchlist
        ? await watchlistAPI.remove(symbol)
        : await watchlistAPI.add(symbol)
      updateWatchlist(res.data.watchlist)
    } catch (err) {
      console.error(err)
    }
  }

  const handleTrade = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTradeMsg({ text: '', type: '' })
    try {
      const { data } = await transactionAPI.create({
        symbol,
        type:     tradeForm.type,
        quantity: parseInt(tradeForm.quantity),
        price:    quote.price,
      })
      updateBalance(data.balance)
      setTradeMsg({
        text: `${tradeForm.type.toUpperCase()} order for ${tradeForm.quantity} shares executed successfully!`,
        type: 'success',
      })
    } catch (err) {
      setTradeMsg({ text: err.response?.data?.message || 'Trade failed', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading">Loading stock data...</div>
  if (!quote)  return <div className="loading">Stock not found</div>

  const isPositive = quote.change >= 0
  const total      = (tradeForm.quantity * quote.price).toFixed(2)

  return (
    <div className="page-container">
      <button className="btn btn-outline" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Quote Header */}
      <div className={`card ${styles.quoteCard}`}>
        <div className={styles.quoteLeft}>
          <h1 className={styles.symbol}>{quote.symbol}</h1>
          <p className={styles.price}>${quote.price.toFixed(2)}</p>
          <span className={isPositive ? 'positive' : 'negative'} style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {isPositive ? '▲' : '▼'} {Math.abs(quote.change).toFixed(2)} ({quote.changePercent})
          </span>
        </div>

        <div className={styles.quoteRight}>
          <div className={styles.statGrid}>
            <div><label>Open</label>      <span>${quote.open?.toFixed(2)}</span></div>
            <div><label>High</label>      <span className="positive">${quote.high?.toFixed(2)}</span></div>
            <div><label>Low</label>       <span className="negative">${quote.low?.toFixed(2)}</span></div>
            <div><label>Prev Close</label><span>${quote.prevClose?.toFixed(2)}</span></div>
            <div><label>Volume</label>    <span>{quote.volume?.toLocaleString()}</span></div>
            <div><label>Date</label>      <span>{quote.latestDay}</span></div>
          </div>
          <button
            className={`btn ${inWatchlist ? 'btn-warning' : 'btn-outline'}`}
            onClick={handleWatchlistToggle}
          >
            {inWatchlist ? '★ In Watchlist' : '☆ Add to Watchlist'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className={styles.chartHeader}>
          <h2>Price History</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                className={`btn ${days === d ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => setDays(d)}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>
        <ChartComponent data={history} />
      </div>

      {/* Trade Form */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>📋 Place Order</h2>
        <form onSubmit={handleTrade} className={styles.tradeForm}>
          <div className="form-group">
            <label>Order Type</label>
            <select value={tradeForm.type} onChange={(e) => setTradeForm({ ...tradeForm, type: e.target.value })}>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={tradeForm.quantity}
              onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })}
            />
          </div>
          <div className={styles.summary}>
            <span>Price per share: <strong>${quote.price.toFixed(2)}</strong></span>
            <span>Estimated Total: <strong>${total}</strong></span>
          </div>
          {tradeMsg.text && (
            <p className={tradeMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
              {tradeMsg.text}
            </p>
          )}
          <button
            type="submit"
            className={`btn ${tradeForm.type === 'buy' ? 'btn-success' : 'btn-danger'}`}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : `Submit ${tradeForm.type.toUpperCase()} Order`}
          </button>
        </form>
      </div>
    </div>
  )
}