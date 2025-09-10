/**
 * Test Setup Configuration
 * Sets up testing environment and global configurations
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.JWT_EXPIRE = '1h';

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'talent',
    createdAt: new Date('2024-01-01')
  },
  
  // Mock job data
  mockJob: {
    _id: '507f1f77bcf86cd799439012',
    title: 'Software Engineer',
    description: 'Full-stack developer position',
    location: 'Remote',
    requiredSkills: ['JavaScript', 'React', 'Node.js'],
    isActive: true,
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date('2024-01-01')
  },
  
  // Mock match data
  mockMatch: {
    _id: '507f1f77bcf86cd799439013',
    userId: '507f1f77bcf86cd799439011',
    jobId: '507f1f77bcf86cd799439012',
    status: 'applied',
    createdAt: new Date('2024-01-01')
  },
  
  // Generate mock ObjectId
  generateObjectId: () => '507f1f77bcf86cd79943901' + Math.floor(Math.random() * 10)
};
