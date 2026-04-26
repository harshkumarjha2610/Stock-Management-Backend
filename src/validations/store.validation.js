const Joi = require('joi');

const createStoreSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  owner_name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().allow('', null),
});

module.exports = { createStoreSchema };
