// Import modul yang diperlukan
const productService = require('../../src/services/product.service');

// Mock dependencies
jest.mock('../../src/config/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../../src/db/schema', () => ({
  products: {
    id: 'id', // Mock untuk eq(products.id, id)
  }
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value }))
}));

// Dapatkan referensi ke db yang di-mock
const { db } = require('../../src/config/db');

describe('ProductService', () => {
  // Reset semua mock setelah setiap test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('harus mengembalikan semua produk', async () => {
      // Arrange
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 }
      ];
      
      // Mock db.select().from()
      db.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockProducts)
      });

      // Act
      const result = await productService.getAll();

      // Assert
      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getById', () => {
    it('harus mengembalikan produk berdasarkan ID', async () => {
      // Arrange
      const productId = 1;
      const mockProduct = { id: productId, name: 'Product 1', price: 100 };
      
      // Mock db.select().from().where()
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProduct])
        })
      });

      // Act
      const result = await productService.getById(productId);

      // Assert
      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('create', () => {
    it('harus membuat produk baru', async () => {
      // Arrange
      const productData = { name: 'New Product', price: 300 };
      const mockProduct = { id: 3, ...productData };
      
      // Mock db.insert().values().returning()
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockProduct])
        })
      });

      // Act
      const result = await productService.create(productData);

      // Assert
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('harus memperbarui produk yang ada', async () => {
      // Arrange
      const productId = 2;
      const updateData = { price: 250 };
      const mockProduct = { id: productId, name: 'Product 2', price: 250 };
      
      // Mock db.update().set().where().returning()
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockProduct])
          })
        })
      });

      // Act
      const result = await productService.update(productId, updateData);

      // Assert
      expect(db.update).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('delete', () => {
    it('harus menghapus produk', async () => {
      // Arrange
      const productId = 1;
      const mockProduct = { id: productId, name: 'Product 1', price: 100 };
      
      // Mock db.delete().where().returning()
      db.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockProduct])
        })
      });

      // Act
      const result = await productService.delete(productId);

      // Assert
      expect(db.delete).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });
});