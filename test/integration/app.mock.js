'use strict';

const Fastify = require('fastify');

function buildTestApp(opts = {}) {
  const fastify = Fastify(opts);

  // Decorate with authenticate method
  fastify.decorate('authenticate', function(request, reply, done) {
    request.user = { id: 1, username: 'testuser' };
    done();
  });

  // Register routes directly
  fastify.register(require('../../src/routes/product.routes'), { prefix: '/api' });

  return fastify;
}

module.exports = buildTestApp;