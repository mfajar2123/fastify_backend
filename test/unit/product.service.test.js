
const productService = require('../../src/services/product.service');


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
    id: 'id', 
  }
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value }))
}));


const { db } = require('../../src/config/db');

describe('ProductService', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('harus mengembalikan semua produk', async () => {
      
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 }
      ];
      
      
      db.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockProducts)
      });

      
      const result = await productService.getAll();

      
      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getById', () => {
    it('harus mengembalikan produk berdasarkan ID', async () => {
      
      const productId = 1;
      const mockProduct = { id: productId, name: 'Product 1', price: 100 };
      
      
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProduct])
        })
      });

      
      const result = await productService.getById(productId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('create', () => {
    it('harus membuat produk baru', async () => {
     
      const productData = { name: 'New Product', price: 300 };
      const mockProduct = { id: 3, ...productData };
      
      
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockProduct])
        })
      });

     
      const result = await productService.create(productData);

      
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('harus memperbarui produk yang ada', async () => {
      
      const productId = 2;
      const updateData = { price: 250 };
      const mockProduct = { id: productId, name: 'Product 2', price: 250 };
      
      
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockProduct])
          })
        })
      });

      
      const result = await productService.update(productId, updateData);

      
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