'use strict'
require('dotenv').config()

const buildApp = require('./src/app')
const createEmailWorker = require('./src/jobs/emailWorker')
const { startSchedulers } = require('./src/jobs/scheduler')


const fastify = buildApp({
  logger: {
    level: 'debug',
    transport: {
      targets: [
        {  
          target: 'pino/file',
          options: {
            destination: './src/logs/server.log',
            mkdir: true
          },
          level: 'warn' // warn, error, fatal 
        },
        {

          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            singleLine: true,
            errorLikeObjectKeys: ['err'],   // hanya ambil error.message
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
          // stack: err.stack // tidak ditampilkan agar ringkas
        }
      }
    }
  }
})



//startSchedulers(fastify)
//createEmailWorker(fastify)


const port = process.env.PORT 
const host = process.env.HOST 
fastify.listen({ port, host }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Server listening at ${address}`)
})
