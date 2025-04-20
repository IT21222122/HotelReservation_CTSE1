const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userController = require('./authController');
const User = require('../models/User');

// Create express app and routes
const app = express();
app.use(bodyParser.json());
app.post('/api/auth/register', userController.registerUser);
app.post('/api/auth/login', userController.loginUser);

// Mock generateToken function
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-token'),
}));

// Mock User model
jest.mock('../models/User');

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        mobile: '1234567890',
        nic: '123456789V',
        userType: 'staff',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        mobile: '1234567890',
        nic: '123456789V',
        userType: 'staff',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(User.create).toHaveBeenCalled();
    });

    it('should not register if email or NIC exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        mobile: '1234567890',
        nic: '123456789V',
        userType: 'staff',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email or NIC already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        mobile: '1234567890',
        nic: '123456789V',
        userType: 'staff',
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(mockUser.matchPassword).toHaveBeenCalled();
    });

    it('should fail login with invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'wrong@example.com',
        password: 'wrongpass',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
