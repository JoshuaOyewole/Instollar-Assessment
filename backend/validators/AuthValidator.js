"use strict";
const { validate } = require("../utils/helpers");
const Joi = require("joi");

/**
 * Validate user registration data
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
exports.createUser = async (body) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required().trim()
            .messages({
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name cannot exceed 50 characters',
                'any.required': 'Name is required'
            }),
        email: Joi.string().email().required().trim().lowercase()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string().min(6).max(20).required()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .messages({
                'string.min': 'Password must be at least 6 characters long',
                'string.max': 'Password cannot exceed 20 characters',
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                'any.required': 'Password is required'
            }),
        role: Joi.string().valid('talent', 'admin').default('talent')
            .messages({
                'any.only': 'Role must be either talent or admin'
            })
    });

    return validate(schema, body);
};

/**
 * Validate user login data
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
exports.loginUser = async (body) => {
    const schema = Joi.object({
        email: Joi.string().email().required().trim().lowercase()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string().min(6).required()
            .messages({
                'string.min': 'Password must be at least 6 characters long',
                'any.required': 'Password is required'
            })
    });

    return validate(schema, body);
};

/**
 * Validate password reset request
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
exports.forgotPassword = async (body) => {
    const schema = Joi.object({
        email: Joi.string().email().required().trim().lowercase()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            })
    });

    return validate(schema, body);
};

/**
 * Validate password reset data
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
exports.resetPassword = async (body) => {
    const schema = Joi.object({
        password: Joi.string().min(6).max(20).required()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .messages({
                'string.min': 'Password must be at least 6 characters long',
                'string.max': 'Password cannot exceed 20 characters',
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                'any.required': 'Password is required'
            }),
        confirmPassword: Joi.any().valid(Joi.ref('password')).required()
            .messages({
                'any.only': 'Passwords do not match',
                'any.required': 'Password confirmation is required'
            })
    });

    return validate(schema, body);
};
