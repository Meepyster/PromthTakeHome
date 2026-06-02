import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import stockRoutes from './routes/routes.js'
import sensible from '@fastify/sensible'

const fastify = Fastify({ logger: true })

const start = async () => {
  try {
    // cors
    await fastify.register(cors, {origin: true})

    //swagger
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Stock Tracker API',
          version: '1.0.0'
        }
      }
    })
    // docs setup
    await fastify.register(swaggerUi, {routePrefix: '/docs'})

    // routes
    await fastify.register(stockRoutes)

    // sensible error checking
    await fastify.register(sensible)

    // start on port 3000
    await fastify.listen({ port: 3000 })
  } 
  catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

start()