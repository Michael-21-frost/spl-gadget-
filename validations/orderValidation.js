//====ORDER VALIDATION =====//
const Joi = require('joi');

// Validate order schema
const validateOrder = (order) => {
  const schema = Joi.object({
      username: Joi.string().required(),
      phonenumber: Joi.string().required(),
      email: Joi.string().email().required(),
      state: Joi.string().required(),
      address: Joi.string().required(),
      local_government_area: Joi.string().required(),  
      product_name: Joi.string().required(),
      number_of_items: Joi.number().required(),
      total_price: Joi.number().required(),
      note: Joi.string().optional(),
  });

  return schema.validate(order);  // .validate should be called directly on the schema
};

exports.validateOrder = validateOrder;  // Export the function directly

