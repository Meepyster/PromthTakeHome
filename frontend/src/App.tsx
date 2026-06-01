import { useState } from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface StockDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockResponse {
  symbol: string
  data: StockDataPoint[]
}

const formatSuffix = (day: number) => {
  const lastDigit = day % 10
  const lastTwoDigits = day % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) return `${day}st`
  if (lastDigit === 2 && lastTwoDigits !== 12) return `${day}nd`
  if (lastDigit === 3 && lastTwoDigits !== 13) return `${day}rd`
  
  return `${day}th`
}

const formatHeader = (data: StockDataPoint[]) => {

  const first = new Date(data[0].date)
  const last = new Date(data[data.length - 1].date)
  
  const firstMonth = first.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })
  const lastMonth = last.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })
  const firstDay = formatSuffix(first.getUTCDate())
  const lastDay = formatSuffix(last.getUTCDate())

  return `${firstMonth} ${firstDay} - ${lastMonth} ${lastDay}`
}

const formatCurrency = (val: number) => `$${val.toFixed(2)}`

const formatVolume = (val: number) => {
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(2)}M`
  }
  return val.toLocaleString()
}

const getTrends = (start: number, end: number, type: 'price' | 'volume' = 'price') => {
  const percentChange = ((end - start) / start) * 100
  
  const strongThreshold = type === 'price' ? 10 : 50
  const trendThreshold = type === 'price' ? 3 : 20

  if (percentChange >= strongThreshold) {
    return { 
      label: 'Strong Up', 
      className: 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)] border-transparent' 
    }
  }
  if (percentChange > trendThreshold) {
    return { 
      label: 'Trending Up', 
      className: 'bg-green-100 text-green-800 border-green-200' 
    }
  }
  if (percentChange <= -strongThreshold) {
    return { 
      label: 'Strong Down', 
      className: 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] border-transparent' 
    }
  }
  if (percentChange < -trendThreshold) {
    return { 
      label: 'Trending Down', 
      className: 'bg-red-100 text-red-800 border-red-200' 
    }
  }
  
  return { 
    label: 'Neutral', 
    className: 'bg-gray-100 text-gray-800 border-gray-200' 
  }
}

const XAxisTick = ({ x, y, payload }: any) => {
  const date = new Date(payload.value)
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
  const day = date.getUTCDate()

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#15141b" fontSize={10} fontWeight="bold">
        {month}
      </text>
      <text x={0} y={0} dy={28} textAnchor="middle" fill="#15141b" fontSize={10} fontWeight="bold">
        {day}
      </text>
    </g>
  )
}

export default function App() {
  const [symbol, setSymbol] = useState('')
  const [stockData, setStockData] = useState<StockResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showOpen, setShowOpen] = useState(true)
  const [showHigh, setShowHigh] = useState(false)
  const [showLow, setShowLow] = useState(false)
  const [showClose, setShowClose] = useState(true)
  const [showVolume, setShowVolume] = useState(true)

  const fetchStockData = async (event: React.SubmitEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setStockData(null)

    try {
      const response = await fetch(`http://localhost:3000/api/stocks/${symbol}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from backend')
      }
      
      const result: StockResponse = await response.json()
      
      if (result.data.length === 0) {
        throw new Error('No data on this symbol')
      }
      
    setStockData(result)
    } 
    catch (err: any) {
      setError(err.message)
    } 
    finally {
      setLoading(false)
    }
  }

  const getDetails = () => {
    if (!stockData || stockData.data.length === 0){
      return null
    }

    const opens = stockData.data.map(data => data.open)
    const highs = stockData.data.map(data => data.high)
    const lows = stockData.data.map(data => data.low)
    const volumes = stockData.data.map(data => data.volume)

    const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

    const firstDay = stockData.data[0]
    const lastDay = stockData.data[stockData.data.length - 1]

    return {
      open: { 
        max: Math.max(...opens), 
        min: Math.min(...opens), 
        avg: average(opens),
        trend: getTrends(firstDay.open, lastDay.open, 'price')
      },
      high: { 
        max: Math.max(...highs), 
        min: Math.min(...highs), 
        avg: average(highs),
        trend: getTrends(firstDay.high, lastDay.high, 'price')
      },
      low: { 
        max: Math.max(...lows), 
        min: Math.min(...lows), 
        avg: average(lows),
        trend: getTrends(firstDay.low, lastDay.low, 'price')
      },
      volume: { 
        max: Math.max(...volumes), 
        min: Math.min(...volumes), 
        avg: average(volumes),
        trend: getTrends(firstDay.volume, lastDay.volume, 'volume')
      }
    }
  }

  const stats = getDetails()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold ">Stock Tracker</h1>
        
        <form onSubmit={fetchStockData} className="flex gap-4 max-w-2xl">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g. TSLA)"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || !symbol}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="p-4 text-red-700 border border-red-200 rounded-md bg-red-50">
            {error}
          </div>
        )}

        {stockData && (
          <div className="space-y-6 bg-white p-6 border rounded-md shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{stockData.symbol} Timeline</h2>
                <span className="text-md font-bold text-gray-900">
                  {formatHeader(stockData.data)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={showOpen} onChange={(e) => setShowOpen(e.target.checked)} className="rounded border-gray-300" />
                  Open
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={showHigh} onChange={(e) => setShowHigh(e.target.checked)} className="rounded border-gray-300" />
                  High
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={showLow} onChange={(e) => setShowLow(e.target.checked)} className="rounded border-gray-300" />
                  Low
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={showClose} onChange={(e) => setShowClose(e.target.checked)} className="rounded border-gray-300" />
                  Close
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} className="rounded border-gray-300" />
                  Volume
                </label>
              </div>
            </div>

            <div className="h-[500px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stockData.data} margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={<XAxisTick />} 
                    tickLine={false} 
                    axisLine={false}
                    interval={0}
                  />
                  
                  <YAxis 
                    yAxisId="price" 
                    domain={['auto', 'auto']}
                    tick={{ fill: '#676b74', fontSize: 12 }} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${val}`} 
                  />
                  
                  <YAxis 
                    yAxisId="volume" 
                    orientation="right" 
                    domain={[0, 'auto']}
                    tick={{ fill: '#676b74', fontSize: 12 }} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
                  />
                  
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '30px' }} />

                  {showVolume && <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#cbd5e1" opacity={0.5} radius={[4, 4, 0, 0]} />}
                  {showOpen && <Line yAxisId="price" type="monotone" dataKey="open" name="Open" stroke="#3b82f6" strokeWidth={2} dot={false} />}
                  {showHigh && <Line yAxisId="price" type="monotone" dataKey="high" name="High" stroke="#22c55e" strokeWidth={2} dot={false} />}
                  {showLow && <Line yAxisId="price" type="monotone" dataKey="low" name="Low" stroke="#ef4444" strokeWidth={2} dot={false} />}
                  {showClose && <Line yAxisId="price" type="monotone" dataKey="close" name="Close" stroke="#0f172a" strokeWidth={2} dot={false} />}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {stats && (
          <div className="bg-white p-6 border rounded-md shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Stock Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-100 pb-4">
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase ">Highest Open</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.open.max)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase ">Lowest Open</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.open.min)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Average Open</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.open.avg)}</div>
                </div>
                <div className={`p-4 rounded-md border flex items-center justify-center font-bold text-lg uppercase ${stats.open.trend.className}`}>
                  {stats.open.trend.label}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-100 pb-4">
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Highest High</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.high.max)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Lowest High</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.high.min)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Average High</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.high.avg)}</div>
                </div>
                <div className={`p-4 rounded-md border flex items-center justify-center font-bold text-lg uppercase ${stats.high.trend.className}`}>
                  {stats.high.trend.label}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-100 pb-4">
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Highest Low</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.low.max)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Lowest Low</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.low.min)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Average Low</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.low.avg)}</div>
                </div>
                <div className={`p-4 rounded-md border flex items-center justify-center font-bold text-lg uppercase ${stats.low.trend.className}`}>
                  {stats.low.trend.label}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Highest Volume</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatVolume(stats.volume.max)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Lowest Volume</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatVolume(stats.volume.min)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Average Volume</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{formatVolume(stats.volume.avg)}</div>
                </div>
                <div className={`p-4 rounded-md border flex items-center justify-center font-bold text-lg uppercase ${stats.volume.trend.className}`}>
                  {stats.volume.trend.label}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}