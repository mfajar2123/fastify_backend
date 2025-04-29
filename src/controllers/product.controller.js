const productService = require('../services/product.service');

class ProductController {
  async getAll(request, reply) {
    try {
      const list = await productService.getAll();
      reply.send({ success: true, data: list });
    } catch (err) {
      request.log.error(err);
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }

  async getById(request, reply) {
    try {
      const id = Number(request.params.id);
      const product = await productService.getById(id);
      
      if (!product) {
        return reply.code(404).send({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      
      reply.send({ success: true, data: product });
    } catch (err) {
      request.log.error(err);
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }

  async create(request, reply) {
    try {
      const product = await productService.create(request.body);
      reply.code(201).send({ success: true, data: product });
    } catch (err) {
      request.log.error(err);
      
      if (err.message.includes('duplicate key')) {
        reply.code(400).send({ 
          success: false, 
          message: 'Product code already exists' 
        });
      } else {
        reply.code(500).send({ success: false, message: 'Internal server error' });
      }
    }
  }

  async update(request, reply) {
    try {
      const id = Number(request.params.id);
      const product = await productService.update(id, request.body);
      
      if (!product) {
        return reply.code(404).send({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      
      reply.send({ success: true, data: product });
    } catch (err) {
      request.log.error(err);
      
      if (err.message.includes('duplicate key')) {
        reply.code(400).send({ 
          success: false, 
          message: 'Product code already exists' 
        });
      } else {
        reply.code(500).send({ success: false, message: 'Internal server error' });
      }
    }
  }

  async delete(request, reply) {
    try {
      const id = Number(request.params.id);
      const product = await productService.delete(id);
      
      if (!product) {
        return reply.code(404).send({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      
      reply.send({ success: true });
    } catch (err) {
      request.log.error(err);
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
}

module.exports = new ProductController();