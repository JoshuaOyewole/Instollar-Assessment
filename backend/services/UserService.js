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
            const userData = {
                name: validation.data.name,
                email: validation.data.email,
                password: validation.data.password,
                role: validation.data.role
            };

            // Add location and skills for talents
            if (validation.data.role === 'talent') {
                userData.location = validation.data.location;
                userData.skills = validation.data.skills;
            }

            const user = await this.userRepository.create(userData);

            // Generate JWT token
            const token = this.generateToken(user);

            // Prepare user response data
            const userResponse = {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            };

            // Add location and skills to response for talents
            if (user.role === 'talent') {
                userResponse.location = user.location;
                userResponse.skills = user.skills;
            }

            return {
                data: {
                    user: userResponse,
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

            // Prepare user response data
            const userResponse = {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            };

            // Add location and skills to response for talents
            if (user.role === 'talent') {
                userResponse.location = user.location;
                userResponse.skills = user.skills;
            }

            return {
                data: {
                    user: userResponse,
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

            // Prepare user response data
            const userResponse = {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            };

            // Add location and skills to response for talents
            if (user.role === 'talent') {
                userResponse.location = user.location;
                userResponse.skills = user.skills;
            }

            return {
                data: {
                    user: userResponse
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
     * Update user profile
     * @param {String} userId - User ID
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} - Service response object
     */
    async updateProfile(userId, profileData) {
        try {
            const { name, email, location, skills } = profileData;

            // Find the user first
            const existingUser = await this.userRepository.findById(userId);
            if (!existingUser) {
                return {
                    error: {
                        message: "User not found"
                    },
                    statusCode: StatusCodes.NOT_FOUND
                };
            }

            // Validate that email is unique if it's being changed
            if (email && email !== existingUser.email) {
                const emailExists = await this.userRepository.findOne({ email });
                if (emailExists) {
                    return {
                        error: {
                            message: "Email already in use"
                        },
                        statusCode: StatusCodes.CONFLICT
                    };
                }
            }

            // Prepare update data
            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            
            // Only update location and skills for talents
            if (existingUser.role === 'talent') {
                if (location !== undefined) updateData.location = location;
                if (skills !== undefined) updateData.skills = skills;
            }

            // Update the user
            const updatedUser = await this.userRepository.updateById(userId, updateData);

            // Prepare user response data (exclude sensitive fields)
            const userResponse = {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                ...(updatedUser.role === 'talent' && {
                    location: updatedUser.location,
                    skills: updatedUser.skills
                })
            };

            return {
                data: {
                    user: userResponse
                },
                statusCode: StatusCodes.OK
            };

        } catch (error) {
            console.error("UserService.updateProfile error:", error);
            return {
                error: {
                    message: "Error updating profile",
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
                expiresIn: process.env.JWT_EXPIRE || "1d",
                algorithm: "HS256"
            }
        );
    }
}

module.exports = new UserService();
