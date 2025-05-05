'use strict';

const buildTestApp = require('./app.mock');
const productService = require('../../src/services/product.service');

// Mock the product service
jest.mock('../../src/services/product.service');

describe('Product Routes Integration Tests', () => {
  let app;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Initialize the test app with disabled logger for cleaner test output
    app = buildTestApp({
      logger: false
    });
    
    // Ensure app is ready before running tests
    await app.ready();
  });

  afterEach(async () => {
    // Properly close the app to avoid memory leaks
    await app.close();
  });

  describe('GET /api/products', () => {
    test('should return all products with status 200', async () => {
      // Arrange: Mock sample product data matching actual API response structure
      const mockProducts = [
        { id: 1, name: 'Product 1', description: 'Description 1', code: 'P001' },
        { id: 2, name: 'Product 2', description: 'Description 2', code: 'P002' }
      ];
      
      productService.getAll.mockResolvedValue(mockProducts);
      
      // Act: Send request to the endpoint
      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });
      
      // Assert: Verify response
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.getAll).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', true);
      expect(payload).toHaveProperty('data');
      expect(Array.isArray(payload.data)).toBe(true);
      expect(payload.data).toEqual(mockProducts);
      expect(payload.data).toHaveLength(2);
    });

    test('should handle service errors and return 500 with error message', async () => {
      // Arrange: Mock service error
      const mockError = new Error('Database connection failed');
      productService.getAll.mockRejectedValue(mockError);
      
      // Act: Send request to the endpoint
      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });
      
      // Assert: Verify error response
      expect(response.statusCode).toBe(500);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.getAll).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Internal server error');
      expect(payload).not.toHaveProperty('data');
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return a specific product by id with status 200', async () => {
      // Arrange: Mock sample product
      const productId = 1;
      const mockProduct = { 
        id: productId, 
        name: 'Product 1', 
        description: 'Description 1',
        code: 'P001'
      };
      
      productService.getById.mockResolvedValue(mockProduct);
      
      // Act: Send request to the endpoint
      const response = await app.inject({
        method: 'GET',
        url: `/api/products/${productId}`
      });
      
      // Assert: Verify response
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.getById).toHaveBeenCalledTimes(1);
      expect(productService.getById).toHaveBeenCalledWith(productId);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', true);
      expect(payload).toHaveProperty('data');
      expect(payload.data).toEqual(mockProduct);
      expect(payload.data.id).toBe(productId);
    });

    test('should return 404 when product does not exist', async () => {
      // Arrange: Mock product not found scenario
      const nonExistentId = 999;
      productService.getById.mockResolvedValue(null);
      
      // Act: Send request to the endpoint
      const response = await app.inject({
        method: 'GET',
        url: `/api/products/${nonExistentId}`
      });
      
      // Assert: Verify not found response
      expect(response.statusCode).toBe(404);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.getById).toHaveBeenCalledTimes(1);
      expect(productService.getById).toHaveBeenCalledWith(nonExistentId);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Product not found');
      expect(payload).not.toHaveProperty('data');
    });

    test('should handle invalid id format and return 400', async () => {
      // Arrange: Invalid ID scenario
      const invalidId = 'invalid-id';
      
      // Act: Send request with invalid ID
      const response = await app.inject({
        method: 'GET',
        url: `/api/products/${invalidId}`
      });
      
      // Assert: Verify bad request response
      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.getById).not.toHaveBeenCalled();
      
      const payload = JSON.parse(response.payload);
      // The actual error format differs from our expectation
      expect(payload).toHaveProperty('statusCode', 400);
      expect(payload).toHaveProperty('error', 'Bad Request');
      expect(payload).toHaveProperty('message', 'params/id must be integer');
    });

    test('should handle service errors and return 500', async () => {
      // Arrange: Mock service error
      const productId = 1;
      const mockError = new Error('Database query failed');
      productService.getById.mockRejectedValue(mockError);
      
      // Act: Send request to the endpoint
      const response = await app.inject({
        method: 'GET',
        url: `/api/products/${productId}`
      });
      
      // Assert: Verify error response
      expect(response.statusCode).toBe(500);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.getById).toHaveBeenCalledTimes(1);
      expect(productService.getById).toHaveBeenCalledWith(productId);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('POST /api/products', () => {
    test('should create a new product and return 201 with created product', async () => {
      // Arrange: Mock product creation data and response
      const newProductData = { 
        name: 'New Product', 
        description: 'New Description',
        code: 'NEW001' 
      };
      
      const createdProduct = { 
        id: 3, 
        ...newProductData
      };
      
      productService.create.mockResolvedValue(createdProduct);
      
      // Act: Send request to create product
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(newProductData)
      });
      
      // Assert: Verify creation response
      expect(response.statusCode).toBe(201);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.create).toHaveBeenCalledTimes(1);
      expect(productService.create).toHaveBeenCalledWith(newProductData);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', true);
      expect(payload).toHaveProperty('data');
      expect(payload.data).toEqual(createdProduct);
      expect(payload.data.id).toBeDefined();
    });

    test('should return 400 when required fields are missing', async () => {
      // Arrange: Mock incomplete product data
      const incompleteData = { 
        name: 'Incomplete Product'
        // Missing required fields
      };
      
      // Act: Send request with incomplete data
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(incompleteData)
      });
      
      // Assert: Verify validation error response
      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.create).not.toHaveBeenCalled();
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('statusCode', 400);
      expect(payload).toHaveProperty('error', 'Bad Request');
      expect(payload.message).toBeTruthy(); // Fixed: directly check that message exists and is truthy
    });
    
    test('should return 400 when product code already exists', async () => {
      // Arrange: Mock duplicate code error
      const duplicateData = { 
        name: 'Duplicate Product', 
        description: 'Duplicate Description', 
        price: 299.99,
        code: 'EXISTING' 
      };
      
      const duplicateError = new Error('duplicate key value violates unique constraint');
      productService.create.mockRejectedValue(duplicateError);
      
      // Act: Send request with duplicate code
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(duplicateData)
      });
      
      // Assert: Verify duplicate error response
      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.create).toHaveBeenCalledTimes(1);
      expect(productService.create).toHaveBeenCalledWith(duplicateData);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Product code already exists');
    });

    test('should handle service errors and return 500', async () => {
      // Arrange: Mock service error
      const validData = { 
        name: 'Test Product', 
        description: 'Test Description', 
        price: 149.99,
        code: 'TEST001' 
      };
      
      const serviceError = new Error('Database connection failed');
      productService.create.mockRejectedValue(serviceError);
      
      // Act: Send request that will trigger service error
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(validData)
      });
      
      // Assert: Verify error response
      expect(response.statusCode).toBe(500);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.create).toHaveBeenCalledTimes(1);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update an existing product and return 200 with updated product', async () => {
      // Arrange: Mock product update data and response
      const productId = 1;
      const updateData = { 
        name: 'Updated Product', 
        description: 'Updated Description',
        price: 129.99
      };
      
      const updatedProduct = { 
        id: productId, 
        name: 'Updated Product', 
        description: 'Updated Description',
        code: 'P001'
      };
      
      productService.update.mockResolvedValue(updatedProduct);
      
      // Act: Send request to update product
      const response = await app.inject({
        method: 'PUT',
        url: `/api/products/${productId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(updateData)
      });
      
      // Assert: Verify update response
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.update).toHaveBeenCalledTimes(1);
      expect(productService.update).toHaveBeenCalledWith(productId, updateData);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', true);
      expect(payload).toHaveProperty('data');
      expect(payload.data).toEqual(updatedProduct);
      expect(payload.data.name).toBe(updateData.name);
      expect(payload.data.description).toBe(updateData.description);
    });

    test('should return 404 when product to update does not exist', async () => {
      // Arrange: Mock product not found scenario
      const nonExistentId = 999;
      const updateData = { name: 'Non-existent Update' };
      
      productService.update.mockResolvedValue(null);
      
      // Act: Send request to update non-existent product
      const response = await app.inject({
        method: 'PUT',
        url: `/api/products/${nonExistentId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(updateData)
      });
      
      // Assert: Verify not found response
      expect(response.statusCode).toBe(404);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.update).toHaveBeenCalledTimes(1);
      expect(productService.update).toHaveBeenCalledWith(nonExistentId, updateData);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Product not found');
    });

    test('should handle invalid id format and return 400', async () => {
      // Arrange: Invalid ID scenario
      const invalidId = 'invalid-id';
      const updateData = { name: 'Invalid ID Update' };
      
      // Act: Send request with invalid ID
      const response = await app.inject({
        method: 'PUT',
        url: `/api/products/${invalidId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(updateData)
      });
      
      // Assert: Verify bad request response
      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.update).not.toHaveBeenCalled();
      
      const payload = JSON.parse(response.payload);
      // Match actual error format
      expect(payload).toHaveProperty('statusCode', 400);
      expect(payload).toHaveProperty('error', 'Bad Request');
      expect(payload).toHaveProperty('message', 'params/id must be integer');
    });

    test('should return 400 when updated product code already exists', async () => {
      // Arrange: Mock duplicate code error
      const productId = 1;
      const updateData = { code: 'EXISTING' };
      
      const duplicateError = new Error('duplicate key value violates unique constraint');
      productService.update.mockRejectedValue(duplicateError);
      
      // Act: Send request with duplicate code
      const response = await app.inject({
        method: 'PUT',
        url: `/api/products/${productId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(updateData)
      });
      
      // Assert: Verify duplicate error response
      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.update).toHaveBeenCalledTimes(1);
      expect(productService.update).toHaveBeenCalledWith(productId, updateData);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Product code already exists');
    });

    test('should handle service errors and return 500', async () => {
      // Arrange: Mock service error
      const productId = 1;
      const updateData = { name: 'Error Update' };
      
      const serviceError = new Error('Database connection failed');
      productService.update.mockRejectedValue(serviceError);
      
      // Act: Send request that will trigger service error
      const response = await app.inject({
        method: 'PUT',
        url: `/api/products/${productId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(updateData)
      });
      
      // Assert: Verify error response
      expect(response.statusCode).toBe(500);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.update).toHaveBeenCalledTimes(1);
      expect(productService.update).toHaveBeenCalledWith(productId, updateData);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete a product and return 200 with success message', async () => {
      // Arrange: Mock product deletion
      const productId = 1;
      const deletedProduct = { 
        id: productId, 
        name: 'Product to Delete', 
        description: 'Will be deleted', 
        code: 'DEL001' 
      };
      
      productService.delete.mockResolvedValue(deletedProduct);
      
      // Act: Send request to delete product
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/products/${productId}`
      });
      
      // Assert: Verify deletion response
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.delete).toHaveBeenCalledTimes(1);
      expect(productService.delete).toHaveBeenCalledWith(productId);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', true);
      // API doesn't return message property on successful delete
    });

    test('should return 404 when product to delete does not exist', async () => {
      // Arrange: Mock product not found scenario
      const nonExistentId = 999;
      
      productService.delete.mockResolvedValue(null);
      
      // Act: Send request to delete non-existent product
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/products/${nonExistentId}`
      });
      
      // Assert: Verify not found response
      expect(response.statusCode).toBe(404);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.delete).toHaveBeenCalledTimes(1);
      expect(productService.delete).toHaveBeenCalledWith(nonExistentId);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Product not found');
    });

    test('should handle invalid id format and return 400', async () => {
      // Arrange: Invalid ID scenario
      const invalidId = 'invalid-id';
      
      // Act: Send request with invalid ID
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/products/${invalidId}`
      });
      
      // Assert: Verify bad request response
      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.delete).not.toHaveBeenCalled();
      
      const payload = JSON.parse(response.payload);
      // Match actual error format
      expect(payload).toHaveProperty('statusCode', 400);
      expect(payload).toHaveProperty('error', 'Bad Request');
      expect(payload).toHaveProperty('message', 'params/id must be integer');
    });

    test('should handle service errors and return 500', async () => {
      // Arrange: Mock service error
      const productId = 1;
      
      const serviceError = new Error('Database connection failed');
      productService.delete.mockRejectedValue(serviceError);
      
      // Act: Send request that will trigger service error
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/products/${productId}`
      });
      
      // Assert: Verify error response
      expect(response.statusCode).toBe(500);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(productService.delete).toHaveBeenCalledTimes(1);
      expect(productService.delete).toHaveBeenCalledWith(productId);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('success', false);
      expect(payload).toHaveProperty('message', 'Internal server error');
    });
  });
});