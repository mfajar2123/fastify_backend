const { db } = require('../config/db');
const { products } = require('../db/schema');
const { eq } = require('drizzle-orm');

class ProductService {
  async getAll() {
    return await db.select().from(products);
  }
  
  async getById(id) {
    const [p] = await db.select().from(products).where(eq(products.id, id));
    return p;
  }
  
  async create(data) {
    const [p] = await db.insert(products).values(data).returning();
    return p;
  }
  
  async update(id, data) {
    const [p] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return p;
  }
  
  async delete(id) {
    const [p] = await db.delete(products).where(eq(products.id, id)).returning();
    return p;
  }
}

module.exports = new ProductService();