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
            }),
        location: Joi.when('role', {
            is: 'talent',
            then: Joi.string().min(2).max(100).required().trim()
                .messages({
                    'string.min': 'Location must be at least 2 characters long',
                    'string.max': 'Location cannot exceed 100 characters',
                    'any.required': 'Location is required for talents'
                }),
            otherwise: Joi.string().optional()
        }),
        skills: Joi.when('role', {
            is: 'talent',
            then: Joi.array().items(Joi.string().min(1).max(50).trim()).min(1).required()
                .messages({
                    'array.min': 'At least one skill is required for talents',
                    'any.required': 'Skills are required for talents'
                }),
            otherwise: Joi.array().optional()
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
