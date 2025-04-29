// Import modul yang diperlukan
const bcrypt = require('bcrypt');
const authService = require('../../src/services/auth.service');

// Mock dependencies
jest.mock('../../src/config/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
  }
}));

jest.mock('bcrypt');

jest.mock('../../src/db/schema', () => ({
  users: {
    email: 'email', // Mock untuk eq(users.email, email)
  }
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value }))
}));

// Dapatkan referensi ke db yang di-mock
const { db } = require('../../src/config/db');

describe('AuthService', () => {
  // Reset semua mock setelah setiap test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('harus melakukan hash password dan menyimpan pengguna baru', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 1,
        username: userData.username,
        email: userData.email,
        password: hashedPassword
      };
      
      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue(hashedPassword);
      
      // Mock db.insert().values().returning()
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser])
        })
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('harus mengembalikan data pengguna jika kredensial valid', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: loginData.email,
        password: 'hashed_password'
      };

      // Mock db.select().from().where()
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser])
        })
      });

      // Mock bcrypt.compare
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(db.select).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email
      });
    });
  });
});