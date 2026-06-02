export const ProcessedStockDataSchema = {
  type: 'object',
  required: ['symbol', 'data'],
  properties: {
    symbol: { type: 'string' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        required: ['date', 'open', 'high', 'low', 'close', 'volume'],
        properties: {
          date: { type: 'string' }, 
          open: { type: 'number' },
          high: { type: 'number' },
          low: { type: 'number' },
          close: { type: 'number' },
          volume: { type: 'number' }
        }
      }
    }
  }
}