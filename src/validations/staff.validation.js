const Joi = require('joi');

const createStaffSchema = Joi.object({
  name: Joi.string().min(1).max(150).required(),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().allow('', null),
  salary: Joi.number().min(0).required(),
  joining_date: Joi.date().iso().allow(null),
});

module.exports = { createStaffSchema };
