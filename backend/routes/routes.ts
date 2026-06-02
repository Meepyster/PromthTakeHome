import type { FastifyInstance } from 'fastify'
import { SymbolSchema } from '../schemas/SymbolSchema.js'
import { ProcessedStockDataSchema } from '../schemas/ProcessedStockDataSchema.js'
import { fetchRawYahooData, processYahooData } from '../service/service.js'

export default async function stockRoutes(fastify: FastifyInstance) {
  
fastify.get(
    '/api/stocks/:symbol',
    {
      schema: {
        params: SymbolSchema,
        response: {
          200: ProcessedStockDataSchema
        }
      }
    },
    async (request) => {
      const { symbol } = request.params as { symbol: string }
      try {
        const rawData = await fetchRawYahooData(symbol)
        const result = processYahooData(symbol, rawData)
        return result
      } 
      catch (error: any) {
        throw fastify.httpErrors.internalServerError(`Could Not Process Stock Smybol: ${symbol}`)
      }
    }
  )
}