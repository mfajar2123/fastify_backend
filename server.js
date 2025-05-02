'use strict'
require('dotenv').config()

const buildApp = require('./src/app')
const createEmailWorker = require('./src/jobs/emailWorker')
const { startSchedulers } = require('./src/jobs/scheduler')

// Konfigurasi logger berdasarkan environment
const loggerConfig = process.env.NODE_ENV === 'production' 
  ? {
      level: process.env.LOG_LEVEL || 'warn',
      transport: {
        targets: [
          {  
            target: 'pino/file',
            options: {
              destination: './src/logs/production.log',
              mkdir: true
            },
            level: 'warn' // warn, error, fatal saja di production
          }
        ]
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
        targets: [
          {  
            target: 'pino/file',
            options: {
              destination: './src/logs/server.log',
              mkdir: true
            },
            level: 'warn'
          },
          {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              singleLine: true,
              errorLikeObjectKeys: ['err'],
              ignore: 'pid,hostname'
            },
            level: 'debug'
          }
        ]
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
  // startSchedulers(fastify)
  // createEmailWorker(fastify)

const port = process.env.PORT  
const host = process.env.HOST 

const start = async () => {
  try {
    await fastify.listen({ port, host })
    fastify.log.info(`Server running at ${host}:${port}`)
    fastify.log.info(`Environment: ${process.env.NODE_ENV }`)
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