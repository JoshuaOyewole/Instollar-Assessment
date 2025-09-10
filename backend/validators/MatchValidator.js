const Joi = require('joi');

const matchValidator = Joi.object({
  user: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
      'any.required': 'User ID is required'
    }),
  
  job: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Job ID must be a valid MongoDB ObjectId',
      'any.required': 'Job ID is required'
    }),
  
  matchedBy: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'MatchedBy ID must be a valid MongoDB ObjectId',
      'any.required': 'MatchedBy ID is required'
    }),
  
  status: Joi.string()
    .valid('matched', 'viewed', 'applied')
    .default('matched')
    .messages({
      'any.only': 'Status must be one of: matched, viewed, applied'
    })
});

const matchStatusValidator = Joi.object({
  status: Joi.string()
    .required()
    .valid('matched', 'viewed', 'applied')
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: matched, viewed, applied'
    })
});

// Legacy validators for backward compatibility (if needed)
const { validate } = require("../utils/helpers");

/**
 * Validate match creation data
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
exports.createMatch = async (body) => {
    const schema = Joi.object({
        jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
            .messages({
                'string.pattern.base': 'Job ID must be a valid MongoDB ObjectId',
                'any.required': 'Job ID is required'
            }),
        userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
            .messages({
                'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
                'any.required': 'User ID is required'
            }),
        status: Joi.string().valid('matched', 'viewed', 'applied').default('matched')
            .messages({
                'any.only': 'Status must be one of: matched, viewed, applied'
            })
    });

    return validate(schema, body);
};


module.exports = {
  matchValidator,
  matchStatusValidator,
  createMatch: exports.createMatch,
};
