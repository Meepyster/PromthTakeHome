export const SymbolSchema = {
  type: 'object',
  properties: {
    symbol: { type: 'string' }
  },
  required: ['symbol']
}

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

export const RawDataSchema = {
  type: 'object',
  properties: {
    chart: {
      type: 'object',
      properties: {
        result: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              meta: SymbolSchema,
              timestamp: {
                type: 'array',
                items: { type: 'number' }
              },
              indicators: {
                type: 'object',
                properties: {
                  quote: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        open: { type: 'array', items: { type: 'number' } },
                        high: { type: 'array', items: { type: 'number' } },
                        low: { type: 'array', items: { type: 'number' } },
                        close: { type: 'array', items: { type: 'number' } },
                        volume: { type: 'array', items: { type: 'number' } }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        error: { nullable: true }
      }
    }
  }
}