'use strict'
require('dotenv').config()

const buildApp = require('./src/app')
const { startSchedulers } = require('./src/jobs/scheduler')

const IS_PRODUCTION = process.env.RENDER === 'true' || process.env.HOST?.includes('render') 
const LOG_LEVEL = IS_PRODUCTION ? 'warn' : 'debug' 

const loggerConfig = {
  level: LOG_LEVEL,
  // file: './src/logs/server.log',
  serializers: {
    err: ({ name, message, code, statusCode }) => ({ name, message, code, statusCode }),
    req: ({ method, url, id }) => ({ method, url, requestId: id })
  },
  formatters: {
    level: label => ({ level: label.toUpperCase() }),
    bindings: () => ({}),
    log: ({ msg, err }) => ({
      message: msg,
      ...(err && {
        error: `${err.name || 'Error'} (${err.statusCode || err.code || ''}): ${err.message}`
      })
    })
  }
}

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
