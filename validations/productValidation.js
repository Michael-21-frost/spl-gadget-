const Joi = require('joi');

// Joi schema for validating product input
const productSchema = Joi.object({
  productName: Joi.string().min(3).required(),
  price: Joi.number().positive().required(),
  description: Joi.string().min(10).required(),
});

// Export the schema directly for validation
module.exports = productSchema;
