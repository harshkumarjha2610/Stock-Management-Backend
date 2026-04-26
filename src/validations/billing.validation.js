const Joi = require('joi');

const createBillSchema = Joi.object({
  customer_id: Joi.number().integer().positive().allow(null),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().positive().required(),
    })
  ).min(1).required().messages({
    'array.min': 'At least one item is required to create a bill',
  }),
  discount: Joi.number().min(0).default(0),
  payment_method: Joi.string().valid('CASH', 'UPI', 'CARD', 'BANK_TRANSFER').default('CASH'),
  paid_status: Joi.string().valid('PAID', 'UNPAID', 'PARTIAL').default('PAID'),
});

module.exports = { createBillSchema };
