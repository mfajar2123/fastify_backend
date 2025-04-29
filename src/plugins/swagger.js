// src/plugins/swagger.js
const fp = require('fastify-plugin');

async function swaggerPlugin(fastify, options) {
  // Register Swagger
  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      info: {
        title: 'Fastify JWT Auth CRUD API',
        description: 'API with JWT Auth, User Registration, and Product CRUD',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'products', description: 'Product management endpoints' }
      ]
    },
    hideUntagged: false, // Show untagged routes
    exposeRoute: true
  });

  // Register Swagger UI
  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecification: (swaggerObject) => {
      // You can transform the specification here if needed
      return swaggerObject;
    },
    transformSpecificationClone: true
  });
}

// Export plugin wrapped in fastify-plugin to avoid encapsulation
module.exports = fp(swaggerPlugin);