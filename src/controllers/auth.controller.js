const { addEmailToQueue } = require('../jobs/emailQueue');
const authService = require('../services/auth.service');

class AuthController {
  async register(request, reply) {
    try {
      const userData = await authService.register(request.body);
      const { password, ...user } = userData; 
      // Job kirim email ke queue
      await addEmailToQueue({
        email: user.email,
        subject: 'Welcome',
        message: `Hi ${user.username}, thanks for registering!`
      });

      reply.code(201).send({ success: true, data: user });
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
