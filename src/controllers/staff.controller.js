const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const staffService = require('../services/staff.service');

const createStaff = catchAsync(async (req, res) => {
  const staff = await staffService.createStaff(req.body, req.storeId, req.user.role);
  sendSuccess(res, staff, 'Staff member created.', 201);
});

const getStaff = catchAsync(async (req, res) => {
  const staff = await staffService.getStaff(req.storeId);
  sendSuccess(res, staff, 'Staff list retrieved.');
});

const getStaffById = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id, req.storeId);
  sendSuccess(res, staff, 'Staff member retrieved.');
});

const checkIn = catchAsync(async (req, res) => {
  const attendance = await staffService.checkIn(req.params.id, req.storeId);
  sendSuccess(res, attendance, 'Checked in successfully.', 201);
});

const checkOut = catchAsync(async (req, res) => {
  const attendance = await staffService.checkOut(req.params.id, req.storeId);
  sendSuccess(res, attendance, 'Checked out successfully.');
});

const getAttendance = catchAsync(async (req, res) => {
  const records = await staffService.getAttendance(req.params.id, req.storeId, req.query);
  sendSuccess(res, records, 'Attendance records retrieved.');
});

const getAllAttendance = catchAsync(async (req, res) => {
  const records = await staffService.getAllAttendance(req.storeId, req.query);
  sendSuccess(res, records, 'All attendance records retrieved.');
});

const updateStaff = catchAsync(async (req, res) => {
  const staff = await staffService.updateStaff(req.params.id, req.body, req.storeId);
  sendSuccess(res, staff, 'Staff member updated successfully.');
});

const deleteStaff = catchAsync(async (req, res) => {
  const result = await staffService.deleteStaff(req.params.id, req.storeId);
  sendSuccess(res, result, 'Staff member deleted successfully.');
});

const markAttendance = catchAsync(async (req, res) => {
  const attendance = await staffService.markAttendance(req.body, req.storeId);
  sendSuccess(res, attendance, 'Attendance marked successfully.');
});

module.exports = { createStaff, getStaff, getStaffById, updateStaff, deleteStaff, checkIn, checkOut, getAttendance, getAllAttendance, markAttendance };
