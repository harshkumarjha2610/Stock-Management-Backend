const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  category: Joi.string().max(100).allow('', null),
  brand: Joi.string().max(100).allow('', null),
  purchase_price: Joi.number().min(0).required(),
  selling_price: Joi.number().min(0).required(),
  gst_percent: Joi.number().min(0).max(100).default(0),
  stock_quantity: Joi.number().integer().min(0).default(0),
  min_stock_level: Joi.number().integer().min(0).default(5),
  description: Joi.string().allow('', null),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  category: Joi.string().max(100).allow('', null),
  brand: Joi.string().max(100).allow('', null),
  purchase_price: Joi.number().min(0),
  selling_price: Joi.number().min(0),
  gst_percent: Joi.number().min(0).max(100),
  stock_quantity: Joi.number().integer().min(0),
  min_stock_level: Joi.number().integer().min(0),
  description: Joi.string().allow('', null),
}).min(1); // At least one field must be provided

module.exports = { createProductSchema, updateProductSchema };
