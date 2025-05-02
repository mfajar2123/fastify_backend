// const { Queue } = require('bullmq')
// const  Redis = require('ioredis')

// //const connection = new Redis()
// const connection = new Redis({
//     maxRetriesPerRequest: null
//   });
// const emailQueue = new Queue('emailQueue', { connection })

// async function addEmailToQueue(data) {
//     await emailQueue.add('sendEmail', data)
// }

// module.exports = { addEmailToQueue }