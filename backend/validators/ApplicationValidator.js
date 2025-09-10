const Joi = require('joi');

class ApplicationValidator {
  /**
   * Validate apply for job data
   */
  static validateApplyForJob(data) {
    const schema = Joi.object({
      jobId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': 'Job ID must be a valid MongoDB ObjectId',
          'any.required': 'Job ID is required'
        })
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validate review application data
   */
  static validateReviewApplication(data) {
    const schema = Joi.object({
      status: Joi.string()
        .valid('pending', 'matched', 'rejected', 'withdrawn')
        .required()
        .messages({
          'any.only': 'Status must be one of: pending, matched, rejected, withdrawn',
          'any.required': 'Status is required'
        })
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validate query parameters for get applications
   */
  static validateGetApplicationsQuery(data) {
    const schema = Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .messages({
          'number.base': 'Page must be a number',
          'number.integer': 'Page must be an integer',
          'number.min': 'Page must be at least 1'
        }),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .messages({
          'number.base': 'Limit must be a number',
          'number.integer': 'Limit must be an integer',
          'number.min': 'Limit must be at least 1',
          'number.max': 'Limit cannot exceed 100'
        }),
      status: Joi.string()
        .valid('pending', 'matched', 'rejected', 'withdrawn')
        .optional()
        .messages({
          'any.only': 'Status must be one of: pending, matched, rejected, withdrawn'
        })
    });

    return schema.validate(data, { abortEarly: false });
  }
}

module.exports = ApplicationValidator;
