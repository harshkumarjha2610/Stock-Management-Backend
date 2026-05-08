const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const storeService = require('../services/store.service');

const createStore = catchAsync(async (req, res) => {
  const store = await storeService.createStore(req.body);
  sendSuccess(res, store, 'Store created successfully.', 201);
});

const getAllStores = catchAsync(async (req, res) => {
  // If storeId is provided (e.g. by storeAccessGuard for ADMINs), filter by it.
  const filter = req.storeId ? { id: req.storeId } : {};
  const stores = await storeService.getAllStores(filter);
  sendSuccess(res, stores, 'Stores retrieved successfully.');
});

const getStoreById = catchAsync(async (req, res) => {
  const store = await storeService.getStoreById(req.params.id);
  sendSuccess(res, store, 'Store retrieved successfully.');
});

const updateStore = catchAsync(async (req, res) => {
  const store = await storeService.updateStore(req.params.id, req.body);
  sendSuccess(res, store, 'Store updated successfully.');
});

const deleteStore = catchAsync(async (req, res) => {
  const result = await storeService.deleteStore(req.params.id);
  sendSuccess(res, result, 'Store deleted successfully.');
});

module.exports = { createStore, getAllStores, getStoreById, updateStore, deleteStore };
