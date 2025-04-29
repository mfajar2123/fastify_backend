const authController = require('../controllers/auth.controller');

async function authRoutes(fastify) {

  const registerSchema = {
    schema: {
      tags: ['auth'],
      summary: 'Register a new user',
      description: 'Register a new user with username, email, and password',
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email', maxLength: 100 },
          password: { type: 'string', minLength: 6, maxLength: 100 }
        }
      },
      response: {
        201: {
          description: 'Successful registration',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        400: {
          description: 'Registration error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: authController.register
  };

 
  const loginSchema = {
    schema: {
      tags: ['auth'],
      summary: 'Login with user credentials',
      description: 'Login with email and password to receive JWT token',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Successful login',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' }
          }
        },
        401: {
          description: 'Authentication failed',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: authController.login
  };

  fastify.post('/register', registerSchema);
  fastify.post('/login', loginSchema);
}

module.exports = authRoutes;