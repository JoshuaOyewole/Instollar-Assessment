"use strict";
const { StatusCodes } = require("http-status-codes");
const UserRepository = require("../repositories/UserRepository");
const authValidator = require("../validators/AuthValidator");
const jwt = require("jsonwebtoken");

/**
 * User Service - Business logic layer
 * Handles user-related business operations
 */
class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }
    /**
     * Create a new user
     * @param {Object} body - Request body containing user data
     * @returns {Promise<Object>} - Service response object
     */
    async createUser(body) {
        try {
            // Validate input data
            const validation = await authValidator.createUser(body);
            if (!validation.isValid) {
                return {
                    error: {
                        message: validation.errors[0].message,
                        details: validation.errors
                    },
                    statusCode: StatusCodes.BAD_REQUEST
                };
            }

            const { email } = validation.data;

            // Check if user already exists
            const existingUser = await this.userRepository.findOne({ email });
            if (existingUser) {
                return {
                    error: {
                        message: "User with this email already exists",
                        field: "email"
                    },
                    statusCode: StatusCodes.CONFLICT
                };
            }

            // Create new user
            const user = await this.userRepository.create({
                name: validation.data.name,
                email: validation.data.email,
                password: validation.data.password,
                role: validation.data.role
            });

            // Generate JWT token
            const token = this.generateToken(user);

            return {
                data: {
                    user: {
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    token: token
                },
                statusCode: StatusCodes.CREATED
            };
        } catch (error) {
            console.error("An unknown error occurred while creating user:", error);
            return {
                error: {
                    message: "Internal server error occurred while creating user",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Authenticate user login
     * @param {Object} body - Request body containing login credentials
     * @returns {Promise<Object>} - Service response object
     */
    async loginUser(body) {
        try {
            // Validate input data
            const validation = await authValidator.loginUser(body);
            if (!validation.isValid) {
                return {
                    error: {
                        message: validation.errors[0].message,
                        details: validation.errors
                    },
                    statusCode: StatusCodes.BAD_REQUEST
                };
            }

            const { email, password } = validation.data;

            // Find user by email
            const user = await this.userRepository.findOne({ email });
            if (!user) {
                return {
                    error: {
                        message: "Invalid credentials",
                        field: "email"
                    },
                    statusCode: StatusCodes.UNAUTHORIZED
                };
            }

            // Verify password
            const isPasswordValid = await user.matchPassword(password);
            if (!isPasswordValid) {
                return {
                    error: {
                        message: "Invalid credentials",
                        field: "password"
                    },
                    statusCode: StatusCodes.UNAUTHORIZED
                };
            }

            // Generate JWT token
            const token = this.generateToken(user);

            return {
                data: {
                    user: {
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    token: token
                },
                statusCode: StatusCodes.OK
            };
        } catch (error) {
            console.error("An unknown error occurred while logging in:", error);
            return {
                error: {
                    message: "Internal server error occurred during login",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Get current user profile
     * @param {String} userId - User ID from JWT token
     * @returns {Promise<Object>} - Service response object
     */
    async getCurrentUser(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                return {
                    error: {
                        message: "User not found",
                        field: "userId"
                    },
                    statusCode: StatusCodes.NOT_FOUND
                };
            }

            return {
                data: {
                    user: {
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                },
                statusCode: StatusCodes.OK
            };
        } catch (error) {
            console.error("An unknown error occurred while fetching user:", error);
            return {
                error: {
                    message: "Internal server error occurred while fetching user",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Get all talents (users with role 'talent')
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Service response object
     */
    async getAllTalents(options = {}) {
        try {
            const talents = await this.userRepository.findTalents({
                select: 'name email createdAt',
                ...options
            });

            return {
                data: {
                    talents: talents.map(talent => ({
                        userId: talent._id,
                        name: talent.name,
                        email: talent.email,
                        createdAt: talent.createdAt
                    })),
                    count: talents.length
                },
                statusCode: StatusCodes.OK
            };
        } catch (error) {
            console.error("An unknown error occurred while fetching talents:", error);
            return {
                error: {
                    message: "Internal server error occurred while fetching talents",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Get users by role or all users
     * @param {Object} filters - Query filters (role, etc.)
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Service response object
     */
    async getUsers(filters = {}, options = {}) {
        try {
            const query = {};
            
            // Add role filter if provided
            if (filters.role) {
                query.role = filters.role;
            }
            
            const users = await this.userRepository.find(query, {
                select: 'name email role createdAt',
                ...options
            });

            return {
                data: {
                    users: users.map(user => ({
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    })),
                    count: users.length
                },
                statusCode: StatusCodes.OK
            };
        } catch (error) {
            console.error("An unknown error occurred while fetching users:", error);
            return {
                error: {
                    message: "Internal server error occurred while fetching users",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Generate JWT token for user
     * @param {Object} user - User object with id, role, etc.
     * @returns {String} - JWT token
     * @private
     */
    generateToken(user) {
        return jwt.sign(
            { 
                id: user._id || user.id,
                role: user.role,
                email: user.email,
                name: user.name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || "7d",
                algorithm: "HS256"
            }
        );
    }
}

module.exports = new UserService();
