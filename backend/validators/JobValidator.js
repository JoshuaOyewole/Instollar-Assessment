"use strict";
const { validate } = require("../utils/helpers");
const Joi = require("joi");

/**
 * Validate job creation data
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
exports.createJob = async (body) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(100).required().trim().messages({
      "string.min": "Job title must be at least 2 characters long",
      "string.max": "Job title cannot exceed 100 characters",
      "any.required": "Job title is required",
    }),
    description: Joi.string().min(10).max(3000).required().trim().messages({
      "string.min": "Job description must be at least 10 characters long",
      "string.max": "Job description cannot exceed 3000 characters",
      "any.required": "Job description is required",
    }),
    location: Joi.string().min(2).max(100).required().trim().messages({
      "string.min": "Location must be at least 2 characters long",
      "string.max": "Location cannot exceed 100 characters",
      "any.required": "Location is required",
    }),
    requiredSkills: Joi.array()
      .items(Joi.string().max(200).trim())
      .messages({
        "string.max": "Each required skill cannot exceed 200 characters",
      }),
  });

  return validate(schema, body);
};

/**
 * Validate job update data
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
exports.updateJob = async (body) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(100).optional().trim().messages({
      "string.min": "Job title must be at least 2 characters long",
      "string.max": "Job title cannot exceed 100 characters",
    }),
    description: Joi.string().min(10).max(3000).optional().trim().messages({
      "string.min": "Job description must be at least 10 characters long",
      "string.max": "Job description cannot exceed 3000 characters",
    }),
    location: Joi.string().min(2).max(100).optional().trim().messages({
      "string.min": "Location must be at least 2 characters long",
      "string.max": "Location cannot exceed 100 characters",
    }),
    requiredSkills: Joi.array()
      .items(Joi.string().max(200).trim())
      .optional()
      .messages({
        "string.max": "Each required skill cannot exceed 200 characters",
      }),
    isActive: Joi.boolean().optional(),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    });

  return validate(schema, body);
};
