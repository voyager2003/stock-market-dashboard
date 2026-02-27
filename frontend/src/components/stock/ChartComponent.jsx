import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import styles from './ChartComponent.module.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipDate}>{label}</p>
        <p>Close: <strong>${payload[0].value.toFixed(2)}</strong></p>
      </div>
    )
  }
  return null
}

export default function ChartComponent({ data }) {
  if (!data || data.length === 0) return <div className="loading">No chart data</div>

  const minClose  = Math.min(...data.map((d) => d.close))
  const maxClose  = Math.max(...data.map((d) => d.close))
  const avgClose  = data.reduce((a, b) => a + b.close, 0) / data.length
  const firstClose = data[0]?.close
  const lastClose  = data[data.length - 1]?.close
  const lineColor  = lastClose >= firstClose ? '#10b981' : '#ef4444'

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickFormatter={(val) => val.slice(5)}
          />
          <YAxis
            domain={[minClose * 0.98, maxClose * 1.02]}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickFormatter={(val) => `$${val.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={avgClose} stroke="var(--primary)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="close"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}