const { sendWelcomeEmail } = require('../jobs/mailers')
const authService = require('../services/auth.service');

class AuthController {
  async register(request, reply) {
    try {
      const userData = await authService.register(request.body);
      const { password, ...user } = userData; 
    
      reply.code(201).send({ success: true, data: user });

      setImmediate(() => {
        sendWelcomeEmail(user.email, user.username)
          .then(() => request.log.info(`Email sent to ${user.email}`))
          .catch(err => request.log.error({ err }, 'Failed to send welcome email'));
      });

      
    } catch (err) {
     
      request.log.error({ err }, 'Registration failed');

      reply.code(400).send({ 
        success: false, 
        message: err.message 
      });
    }
  }

  async login(request, reply) {
    try {
      const userData = await authService.login(request.body);
      const token = await reply.jwtSign(userData, { expiresIn: '24h' });

      reply.send({ success: true, token });
    } catch (err) {
      
      request.log.error({ err }, 'Login failed');

      reply.code(401).send({ 
        success: false, 
        message: err.message 
      });
    }
  }
}

module.exports = new AuthController();
