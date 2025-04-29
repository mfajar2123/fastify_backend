// Import modul yang diperlukan
const bcrypt = require('bcrypt');
const authService = require('../../src/services/auth.service'); // Sesuaikan path dengan struktur folder Anda

// Mock dependencies
jest.mock('../../src/config/db.js', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
  }
}));

jest.mock('bcrypt');
jest.mock('../../src/db/schema.js', () => ({
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

    it('harus melempar error jika ada kesalahan saat menyimpan pengguna', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      bcrypt.hash.mockResolvedValue('hashed_password');
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Database error');
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

    it('harus melempar error jika pengguna tidak ditemukan', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock db.select().from().where() untuk mengembalikan array kosong
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      });

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
      expect(bcrypt.compare).not.toHaveBeenCalled(); // Pastikan bcrypt.compare tidak dipanggil
    });

    it('harus melempar error jika password tidak cocok', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrong_password'
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

      // Mock bcrypt.compare untuk mengembalikan false (password tidak cocok)
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
    });
  });
});