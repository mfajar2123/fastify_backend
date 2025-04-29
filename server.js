'use strict'
require('dotenv').config()

const buildApp = require('./src/app')
const createEmailWorker = require('./src/jobs/emailWorker')
const { startSchedulers } = require('./src/jobs/scheduler')

// buat Fastify instance dengan logger
const fastify = buildApp({
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignorePaths: ['req-headers', 'res-headers'],
        singleLine: true
      }
    }
  }
})

// jalankan worker & cron
startSchedulers(fastify)
createEmailWorker(fastify)

// mulai server
const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'
fastify.listen({ port, host }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Server listening at ${address}`)
})
