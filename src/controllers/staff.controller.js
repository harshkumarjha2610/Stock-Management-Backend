const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const staffService = require('../services/staff.service');

const createStaff = catchAsync(async (req, res) => {
  const staff = await staffService.createStaff(req.body, req.storeId);
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

module.exports = { createStaff, getStaff, getStaffById, checkIn, checkOut, getAttendance };
