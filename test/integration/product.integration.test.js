'use strict';

const buildTestApp = require('./app.mock');
const productService = require('../../src/services/product.service');


jest.mock('../../src/services/product.service');

describe('Product Routes Integration Tests', () => {
  let app;

  beforeEach(async () => {
   
    jest.clearAllMocks();
    
 
    app = buildTestApp({
      logger: false
    });
    
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/products', () => {
    test('should return all products', async () => {
      
      const products = [
        { id: 1, name: 'Product 1', description: 'Description 1', code: 'P001' },
        { id: 2, name: 'Product 2', description: 'Description 2', code: 'P002' }
      ];
      
      
      productService.getAll.mockResolvedValue(products);
      
     
      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });
      
      
      expect(response.statusCode).toBe(200);
      expect(productService.getAll).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: true,
        data: products
      });
    });

    test('should handle errors and return 500', async () => {
     
      productService.getAll.mockRejectedValue(new Error('Database error'));
      
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });
      
     
      expect(response.statusCode).toBe(500);
      expect(productService.getAll).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return a product by id', async () => {
      
      const product = { id: 1, name: 'Product 1', description: 'Description 1', code: 'P001' };
      
      
      productService.getById.mockResolvedValue(product);
      
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/1'
      });
      
   
      expect(response.statusCode).toBe(200);
      expect(productService.getById).toHaveBeenCalledTimes(1);
      expect(productService.getById).toHaveBeenCalledWith(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: true,
        data: product
      });
    });

    test('should return 404 if product not found', async () => {
      
      productService.getById.mockResolvedValue(null);
      
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/999'
      });
      
      
      expect(response.statusCode).toBe(404);
      expect(productService.getById).toHaveBeenCalledTimes(1);
      expect(productService.getById).toHaveBeenCalledWith(999);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Product not found'
      });
    });

    test('should handle errors and return 500', async () => {
     
      productService.getById.mockRejectedValue(new Error('Database error'));
      
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/1'
      });
      
    
      expect(response.statusCode).toBe(500);
      expect(productService.getById).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('POST /api/products', () => {
    test('should create a new product', async () => {
      
      const newProduct = { name: 'New Product', description: 'New Description', code: 'NEW001' };
      const createdProduct = { id: 1, ...newProduct };
      
      
      productService.create.mockResolvedValue(createdProduct);
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: newProduct
      });
      
   
      expect(response.statusCode).toBe(201);
      expect(productService.create).toHaveBeenCalledTimes(1);
      expect(productService.create).toHaveBeenCalledWith(newProduct);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: true,
        data: createdProduct
      });
    });

    test('should return 400 if product code already exists', async () => {
      
      const newProduct = { name: 'New Product', description: 'New Description', code: 'EXISTING' };
      
      
      productService.create.mockRejectedValue(new Error('duplicate key value violates unique constraint'));
      
     
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: newProduct
      });
      
     
      expect(response.statusCode).toBe(400);
      expect(productService.create).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Product code already exists'
      });
    });

    test('should handle other errors and return 500', async () => {
     
      const newProduct = { name: 'New Product', description: 'New Description', code: 'NEW001' };
      
      
      productService.create.mockRejectedValue(new Error('Some other error'));
      
    
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: newProduct
      });
      
     
      expect(response.statusCode).toBe(500);
      expect(productService.create).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update an existing product', async () => {
    
      const updateData = { name: 'Updated Product', description: 'Updated Description' };
      const updatedProduct = { id: 1, name: 'Updated Product', description: 'Updated Description', code: 'P001' };
      
   
      productService.update.mockResolvedValue(updatedProduct);
      
     
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: updateData
      });
      
      
      expect(response.statusCode).toBe(200);
      expect(productService.update).toHaveBeenCalledTimes(1);
      expect(productService.update).toHaveBeenCalledWith(1, updateData);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: true,
        data: updatedProduct
      });
    });

    test('should return 404 if product to update not found', async () => {
      
      const updateData = { name: 'Updated Product' };
      
      
      productService.update.mockResolvedValue(null);
      
      
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/999',
        payload: updateData
      });
      
      
      expect(response.statusCode).toBe(404);
      expect(productService.update).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Product not found'
      });
    });

    test('should return 400 if updated product code already exists', async () => {
   
      const updateData = { code: 'EXISTING' };
      
      
      productService.update.mockRejectedValue(new Error('duplicate key value violates unique constraint'));
      
      
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: updateData
      });
      
      
      expect(response.statusCode).toBe(400);
      expect(productService.update).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Product code already exists'
      });
    });

    test('should handle other errors and return 500', async () => {
      
      const updateData = { name: 'Updated Product' };
      
    
      productService.update.mockRejectedValue(new Error('Some other error'));
      
    
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/1',
        payload: updateData
      });
      
      
      expect(response.statusCode).toBe(500);
      expect(productService.update).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete a product', async () => {
    
      const deletedProduct = { id: 1, name: 'Product 1', description: 'Description 1', code: 'P001' };
      
      
      productService.delete.mockResolvedValue(deletedProduct);
      
      
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/1'
      });
      
      
      expect(response.statusCode).toBe(200);
      expect(productService.delete).toHaveBeenCalledTimes(1);
      expect(productService.delete).toHaveBeenCalledWith(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: true
      });
    });

    test('should return 404 if product to delete not found', async () => {
      
      productService.delete.mockResolvedValue(null);
     
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/999'
      });
      
    
      expect(response.statusCode).toBe(404);
      expect(productService.delete).toHaveBeenCalledTimes(1);
      expect(productService.delete).toHaveBeenCalledWith(999);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Product not found'
      });
    });

    test('should handle errors and return 500', async () => {
     
      productService.delete.mockRejectedValue(new Error('Database error'));
      
      
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/1'
      });
      
     
      expect(response.statusCode).toBe(500);
      expect(productService.delete).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });
});