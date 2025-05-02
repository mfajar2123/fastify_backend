'use strict'
require('dotenv').config()

const buildApp = require('./src/app')
const createEmailWorker = require('./src/jobs/emailWorker')
const { startSchedulers } = require('./src/jobs/scheduler')
const NODE_ENV = process.env.NODE_ENV || 'production'
const LOG_LEVEL = process.env.LOG_LEVEL || 'warn'

// Configure logger based on environment
const loggerConfig = NODE_ENV === 'production' 
  ? {
      level: LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: false,
          translateTime: 'SYS:standard',
          singleLine: true
        }
      },
      serializers: {
        err (err) {
          return {
            name: err.name,
            message: err.message,
            code: err.code,
            statusCode: err.statusCode
          }
        }
      }
    }
  : {
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          singleLine: true,
          errorLikeObjectKeys: ['err'],
          ignore: 'pid,hostname'
        }
      },
      serializers: {
        err (err) {
          return {
            type: err.type,
            name: err.name,
            message: err.message,
            code: err.code,
            statusCode: err.statusCode
          }
        }
      }
    }

const fastify = buildApp({ logger: loggerConfig })
// Uncomment these if needed after fixing the server startup issues
// startSchedulers(fastify)
// createEmailWorker(fastify)


const port = process.env.PORT || 10000
const host = '0.0.0.0' // Always use 0.0.0.0 for cloud deployments

const start = async () => {
  try {
    await fastify.listen({ port, host })
    fastify.log.info(`Server running at ${host}:${port}`)
    fastify.log.info(`Environment: ${NODE_ENV}`)
    fastify.log.info(`Documentation available at: http://${host}:${port}/documentation`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown handler
const closeGracefully = async (signal) => {
  fastify.log.info(`Received signal to terminate: ${signal}`)
  
  await fastify.close()
  fastify.log.info('Fastify server closed')
  process.exit(0)
}

// Register signal handlers
process.on('SIGINT', closeGracefully)
process.on('SIGTERM', closeGracefully)

start()