const Joi = require('joi');

const createCustomerSchema = Joi.object({
  name: Joi.string().min(1).max(150).required(),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().allow('', null),
});

module.exports = { createCustomerSchema };
