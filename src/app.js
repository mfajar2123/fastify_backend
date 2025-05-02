'use strict'

const Fastify = require('fastify')

function buildApp(opts = {}) {
  
  const fastify = Fastify({
    ...opts,
    ajv: {
      customOptions: {
        allErrors: true,         
        removeAdditional: true, 
        useDefaults: true,      
        coerceTypes: true       
      }
    }
  })
  
  fastify.register(require('./plugins/auth'))
  fastify.register(require('./plugins/swagger'))
  fastify.register(require('@fastify/cors'), {
    origin: true, 
  })

  fastify.register(require('./routes/auth.routes'), { prefix: '/api' })
  fastify.register(require('./routes/product.routes'), { prefix: '/api' })

  fastify.setErrorHandler((err, request, reply) => {
    if (err.validation) {
      request.log.warn({ err }, 'Validation failed')
      return reply.code(400).send({
        success: false,
        message: 'Validation error',
        errors: err.validation
      })
    }
  
    request.log.error({ err }, 'Unhandled error')
    reply.code(500).send({ success: false, message: 'Internal Server Error' })
  })
  

  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            documentation: { type: 'string' }
          }
        }
      }
    }
  }, async () => ({
    message: 'Fastify JWT Auth CRUD API',
    documentation: '/documentation'
  }))

  return fastify
}

module.exports = buildApp
