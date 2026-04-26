const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const userService = require('../services/user.service');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body, req.user.role);
  sendSuccess(res, user, 'User created successfully.', 201);
});

const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  sendSuccess(res, user, 'Profile retrieved successfully.');
});

const getUsersByStore = catchAsync(async (req, res) => {
  const storeId = req.params.storeId || req.user.store_id;
  const users = await userService.getUsersByStore(storeId);
  sendSuccess(res, users, 'Users retrieved successfully.');
});

module.exports = { createUser, getProfile, getUsersByStore };
