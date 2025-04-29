'use strict'

const Fastify = require('fastify')

function buildApp(opts = {}) {
  const fastify = Fastify(opts)

  // register plugin auth & swagger
  fastify.register(require('./plugins/auth'))
  fastify.register(require('./plugins/swagger'))

  // register routes
  fastify.register(require('./routes/auth.routes'), { prefix: '/api' })
  fastify.register(require('./routes/product.routes'), { prefix: '/api' })

  // healthcheck / root endpoint
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
