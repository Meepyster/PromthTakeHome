export async function fetchRawYahooData(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=15m&range=1mo`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  if (!response.ok) {
    throw new Error(`Error Fetching from yahoo${response}`)
  }

  return await response.json()
}

export function processYahooData(symbol: string, rawData: any) {
  const result = rawData.chart.result[0]
  const timestamps = result.timestamp
  const quote = result.indicators.quote[0]
  
  const dailyData: Record<string, any> = {}

  for (let i = 0; i < timestamps.length; i++) {
    const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0]
    
    if (!date) continue
    if (quote.open[i] === null) continue

    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i]
      }
    } 
    else {
      dailyData[date].high = Math.max(dailyData[date].high, quote.high[i])
      dailyData[date].low = Math.min(dailyData[date].low, quote.low[i])
      dailyData[date].close = quote.close[i]
      dailyData[date].volume += quote.volume[i]
    }
  }

  return {
    symbol,
    data: Object.values(dailyData)
  }
}