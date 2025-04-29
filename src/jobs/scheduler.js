const cron = require('node-cron')
const productService = require('../services/product.service');
const { default: fastify } = require('fastify');

function startSchedulers(fastify) {
    cron.schedule('*/10 * * * * *', async () => {
        fastify.log.debug(`Running job every 5 seconds`);
        try {
            const products = await productService.getAll();
            
            fastify.log.debug( `Total products in database: ${products.length}` )
            
        } catch (error) {
            fastify.log.error('Error while counting products:', error.message);
        }
    });

    cron.schedule('0 0 * * *', () => {
        fastify.log.info(`[${new Date().toISOString()}] Running job every midnight`)
    })
}

module.exports = { startSchedulers }