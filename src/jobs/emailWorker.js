const { Worker } = require('bullmq');
const Redis = require('ioredis');

function createEmailWorker(fastify) {
 
  const connection = new Redis({
    maxRetriesPerRequest: null
  });

  const worker = new Worker('emailQueue', async job => {
    const { email, subject, message } = job.data;
  
    fastify.log.debug('Sending email...');
    fastify.log.debug({ email }, 'To');
    fastify.log.debug({ subject }, 'Subject');
    fastify.log.debug({ message }, 'Message');
    
    // Simulasi delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    fastify.log.debug(`Email sent to ${job.data.email}`);
  }, { connection });

  worker.on('completed', job => {
    fastify.log.debug(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    fastify.log.error(`Job ${job.id} failed:`, err.message);
  });

  return worker;
}

module.exports = createEmailWorker;
