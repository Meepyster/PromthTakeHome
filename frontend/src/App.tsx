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

export default function App() {
  const [symbol, setSymbol] = useState('')
  const [stockData, setStockData] = useState<StockResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    catch (error: any) {
      setError(error.message)
    } 
    finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Stock Tracker</h1>
        
        <form onSubmit={fetchStockData} className="flex gap-4 max-w-xl">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g. TSLA)"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
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
          <div className="bg-white p-6 border rounded-md shadow-sm ">
            <h2 className="text-lg font-semibold mb-6">{stockData.symbol} Market Data</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stockData.data}>
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fill: '#676b74', fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="price"
                    domain={['auto', 'auto']}
                    tick={{ fill: '#676b74', fontSize: 12 }} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${val}`} 
                  />
                  <YAxis 
                    yAxisId="volume" 
                    orientation="right" 
                    domain={[0, 'auto']}
                    tick={{ fill: '#676b74', fontSize: 12 }} 
                    axisLine={false} 
                    tickFormatter={(val) => `${(val/1000000).toFixed(2)}M`} 
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #c7c7c9' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#cbd5e1" opacity={0.5} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="price" type="monotone" dataKey="open" name="Open" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line yAxisId="price" type="monotone" dataKey="high" name="High" stroke="#00ce4b" strokeWidth={2} dot={false} />
                  <Line yAxisId="price" type="monotone" dataKey="low" name="Low" stroke="#ec0d0d" strokeWidth={2} dot={false} />
                  <Line yAxisId="price" type="monotone" dataKey="close" name="Close" stroke="#0f172a" strokeWidth={ 2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}