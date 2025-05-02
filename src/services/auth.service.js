const { db } = require('../config/db');
const { users } = require('../db/schema');
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');

class AuthService {
  async register(userData) {
    const hashed = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        password: hashed,
      })
      .returning();
    return user;
  }

  async login({ email, password }) {
  
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) throw new Error('Invalid credentials');
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid credentials');
    
    return { id: user.id, username: user.username, email: user.email };
  }
}

module.exports = new AuthService();