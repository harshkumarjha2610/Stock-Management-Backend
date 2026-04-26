const { Store } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Create a new store.
 */
const createStore = async (data) => {
  const store = await Store.create(data);
  return store;
};

/**
 * Get all stores (Super Admin only).
 */
const getAllStores = async () => {
  const stores = await Store.findAll({
    order: [['created_at', 'DESC']],
  });
  return stores;
};

/**
 * Get a single store by ID.
 */
const getStoreById = async (id) => {
  const store = await Store.findByPk(id);
  if (!store) {
    throw new AppError('Store not found.', 404);
  }
  return store;
};

module.exports = { createStore, getAllStores, getStoreById };
