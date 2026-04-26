const { Customer, Bill } = require('../models');
const AppError = require('../utils/AppError');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

const createCustomer = async (data, storeId) => {
  const customer = await Customer.create({ ...data, store_id: storeId });
  return customer;
};

const getCustomers = async (storeId, query = {}) => {
  const { page, limit, offset } = parsePagination(query);
  const { rows, count } = await Customer.findAndCountAll({
    where: { store_id: storeId },
    order: [['created_at', 'DESC']],
    limit, offset,
  });
  return paginatedResponse(rows, count, page, limit);
};

const getCustomerById = async (id, storeId) => {
  const customer = await Customer.findOne({ where: { id, store_id: storeId } });
  if (!customer) throw new AppError('Customer not found.', 404);
  return customer;
};

const getPurchaseHistory = async (customerId, storeId, query = {}) => {
  const { page, limit, offset } = parsePagination(query);
  const customer = await Customer.findOne({ where: { id: customerId, store_id: storeId } });
  if (!customer) throw new AppError('Customer not found.', 404);

  const { rows, count } = await Bill.findAndCountAll({
    where: { customer_id: customerId, store_id: storeId },
    include: [{ association: 'items', include: [{ association: 'product', attributes: ['id', 'name'] }] }],
    order: [['created_at', 'DESC']],
    limit, offset,
  });
  return paginatedResponse(rows, count, page, limit);
};

module.exports = { createCustomer, getCustomers, getCustomerById, getPurchaseHistory };
