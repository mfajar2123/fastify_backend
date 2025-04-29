const fp = require('fastify-plugin');

async function authPlugin(fastify, options) {
  await fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'supersecretkey'
  });


  fastify.decorate('authenticate', async function(request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      request.log.error({ err }, 'Authentication Failed');
      reply.code(401).send({ 
        success: false, 
        message: 'Authentication failed: ' + err.message 
      });
    }
  });
}

module.exports = fp(authPlugin);