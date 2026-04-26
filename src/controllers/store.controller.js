const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const storeService = require('../services/store.service');

const createStore = catchAsync(async (req, res) => {
  const store = await storeService.createStore(req.body);
  sendSuccess(res, store, 'Store created successfully.', 201);
});

const getAllStores = catchAsync(async (req, res) => {
  const stores = await storeService.getAllStores();
  sendSuccess(res, stores, 'Stores retrieved successfully.');
});

const getStoreById = catchAsync(async (req, res) => {
  const store = await storeService.getStoreById(req.params.id);
  sendSuccess(res, store, 'Store retrieved successfully.');
});

module.exports = { createStore, getAllStores, getStoreById };
