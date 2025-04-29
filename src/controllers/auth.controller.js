const { addEmailToQueue } = require('../jobs/emailQueue');
const authService = require('../services/auth.service');

class AuthController {
  async register(request, reply) {
    try {
      // Debug log untuk body request
      request.log.debug({ body: request.body }, 'Register request received');

      const userData = await authService.register(request.body);
      const { password, ...user } = userData; // Remove password from response

      // Info log setelah user berhasil register
      request.log.info({ user: user.username }, 'User successfully registered');

      // Job kirim email ke queue
      await addEmailToQueue({
        email: user.email,
        subject: 'Welcome',
        message: `Hi ${user.username}, thanks for registering!`
      });

      reply.code(201).send({ success: true, data: user });
    } catch (err) {
      // Error log jika terjadi kegagalan saat register
      request.log.error({ err }, 'Registration failed');

      reply.code(400).send({ 
        success: false, 
        message: err.message 
      });
    }
  }

  async login(request, reply) {
    try {
      // Debug log untuk body login
      request.log.debug({ body: request.body }, 'Login attempt');

      const userData = await authService.login(request.body);
      const token = await reply.jwtSign(userData, { expiresIn: '24h' });

      // Info log setelah user berhasil login
      request.log.info({ user: userData.email }, 'User logged in');

      reply.send({ success: true, token });
    } catch (err) {
      // Error log jika login gagal
      request.log.error({ err }, 'Login failed');

      reply.code(401).send({ 
        success: false, 
        message: err.message 
      });
    }
  }
}

module.exports = new AuthController();
