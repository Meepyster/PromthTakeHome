import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import stockRoutes from './routes.js'
import sensible from '@fastify/sensible'

const fastify = Fastify({ logger: true })

const start = async () => {
  try {
    // 1. Register Plugins
    await fastify.register(cors, {
      origin: true
    })
    
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Stock Tracker API',
          version: '1.0.0'
        }
      }
    })

    await fastify.register(swaggerUi, {
      routePrefix: '/docs'
    })

    // 2. Register Routes
    await fastify.register(stockRoutes)

    await fastify.register(sensible)

    // 3. Start Server
    await fastify.listen({ port: 3000 })
    
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()