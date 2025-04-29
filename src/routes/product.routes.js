const productController = require('../controllers/product.controller');

async function productRoutes(fastify) {

  const productSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      description: { type: 'string' },
      code: { type: 'string' }
    }
  };

  
  const successResponseSchema = {
    type: 'object',
    properties: {
      success: { type: 'boolean' }
    }
  };


  const getAllSchema = {
    schema: {
      tags: ['products'],
      summary: 'Get all products',
      description: 'Retrieve a list of all products',
      response: {
        200: {
          description: 'List of products',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: productSchema
            }
          }
        }
      }
    },
    handler: productController.getAll
  };


  const getByIdSchema = {
    schema: {
      tags: ['products'],
      summary: 'Get product by ID',
      description: 'Retrieve a specific product by its ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' }
        }
      },
      response: {
        200: {
          description: 'Product details',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: productSchema
          }
        },
        404: {
          description: 'Product not found',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: productController.getById
  };


  const createSchema = {
    schema: {
      tags: ['products'],
      summary: 'Create a new product',
      description: 'Create a new product (requires authentication)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'description', 'code'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', minLength: 1 },
          code: { type: 'string', minLength: 1, maxLength: 20 }
        }
      },
      response: {
        201: {
          description: 'Product created successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: productSchema
          }
        }
      }
    },
    onRequest: [fastify.authenticate],
    handler: productController.create
  };


  const updateSchema = {
    schema: {
      tags: ['products'],
      summary: 'Update an existing product',
      description: 'Update a product by ID (requires authentication)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', minLength: 1 },
          code: { type: 'string', minLength: 1, maxLength: 20 }
        }
      },
      response: {
        200: {
          description: 'Product updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: productSchema
          }
        }
      }
    },
    onRequest: [fastify.authenticate],
    handler: productController.update
  };


  const deleteSchema = {
    schema: {
      tags: ['products'],
      summary: 'Delete a product',
      description: 'Delete a product by ID (requires authentication)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' }
        }
      },
      response: {
        200: {
          description: 'Product deleted successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    },
    onRequest: [fastify.authenticate],
    handler: productController.delete
  };

  fastify.get('/products', getAllSchema);
  fastify.get('/products/:id', getByIdSchema);
  fastify.post('/products', createSchema);
  fastify.put('/products/:id', updateSchema);
  fastify.delete('/products/:id', deleteSchema);
}

module.exports = productRoutes;