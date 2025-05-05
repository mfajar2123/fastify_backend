'use strict'
require('dotenv').config()

const buildApp = require('./src/app')
const { startSchedulers } = require('./src/jobs/scheduler')
const { loggerConfig, LOG_LEVEL } = require('./src/config/logger');


const fastify = buildApp({ logger: loggerConfig })

//startSchedulers(fastify)
  
const port = process.env.PORT || 10000
const host = '0.0.0.0'

const start = async () => {
  try {
    await fastify.listen({ port, host })
    fastify.log.info(`Server running at ${host}:${port}`)
    fastify.log.info(`Logging level: ${LOG_LEVEL}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

const closeGracefully = async (signal) => {
  fastify.log.info(`Received signal to terminate: ${signal}`)
  await fastify.close()
  fastify.log.info('Fastify server closed')
  process.exit(0)
}

process.on('SIGINT', closeGracefully)
process.on('SIGTERM', closeGracefully)

start()
