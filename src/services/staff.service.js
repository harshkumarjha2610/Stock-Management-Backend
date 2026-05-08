const { Staff, Attendance } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const AppError = require('../utils/AppError');

const createStaff = async (data, storeId) => {
  const staff = await Staff.create({
    name: data.name,
    phone: data.phone,
    address: data.address,
    aadhar_card: data.aadhar_card,
    email_id: data.email_id,
    photo_url: data.photo_url,
    joining_date: data.joining_date,
    base_salary: data.base_salary,
    status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    store_id: storeId,
  });
  return staff;
};

const getStaff = async (storeId) => {
  return Staff.findAll({ where: { store_id: storeId }, order: [['created_at', 'DESC']] });
};

const getStaffById = async (id, storeId) => {
  const staff = await Staff.findOne({ where: { id, store_id: storeId } });
  if (!staff) throw new AppError('Staff member not found.', 404);
  return staff;
};

const updateStaff = async (id, data, storeId) => {
  const staff = await getStaffById(id, storeId);
  await staff.update({
    name: data.name,
    phone: data.phone,
    address: data.address,
    aadhar_card: data.aadhar_card,
    email_id: data.email_id,
    photo_url: data.photo_url,
    joining_date: data.joining_date,
    base_salary: data.base_salary,
    status: data.status ? data.status.toUpperCase() : staff.status,
  });
  return staff;
};

const deleteStaff = async (id, storeId) => {
  const staff = await getStaffById(id, storeId);
  await staff.destroy();
  return { id };
};

/**
 * Check-in: create attendance record with current time.
 */
const checkIn = async (staffId, storeId) => {
  const staff = await getStaffById(staffId, storeId);
  const today = dayjs().format('YYYY-MM-DD');

  // Check if already checked in today
  const existing = await Attendance.findOne({
    where: { staff_id: staffId, store_id: storeId, date: today },
  });

  if (existing && existing.check_in && !existing.check_out) {
    throw new AppError('Already checked in. Please check out first.', 400);
  }

  if (existing && existing.check_out) {
    throw new AppError('Already checked in and out for today.', 400);
  }

  const attendance = await Attendance.create({
    staff_id: staffId,
    store_id: storeId,
    date: today,
    check_in: new Date(),
  });

  return attendance;
};

/**
 * Check-out: update attendance record and calculate working hours.
 */
const checkOut = async (staffId, storeId) => {
  const today = dayjs().format('YYYY-MM-DD');

  const attendance = await Attendance.findOne({
    where: { staff_id: staffId, store_id: storeId, date: today, check_out: null },
  });

  if (!attendance) {
    throw new AppError('No active check-in found for today.', 400);
  }

  const checkOutTime = new Date();
  const checkInTime = new Date(attendance.check_in);
  const diffMs = checkOutTime - checkInTime;
  const workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

  await attendance.update({
    check_out: checkOutTime,
    working_hours: workingHours,
  });

  return attendance;
};

/**
 * Get attendance records for a staff member.
 */
const getAttendance = async (staffId, storeId, query = {}) => {
  const where = { staff_id: staffId, store_id: storeId };
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date[Op.gte] = query.from;
    if (query.to) where.date[Op.lte] = query.to;
  }
  return Attendance.findAll({ where, order: [['date', 'DESC']] });
};

/**
 * Get all attendance records for a store.
 */
const getAllAttendance = async (storeId, query = {}) => {
  const where = { store_id: storeId };
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date[Op.gte] = query.from;
    if (query.to) where.date[Op.lte] = query.to;
  }
  return Attendance.findAll({ 
    where, 
    include: [{ association: 'staff', attributes: ['name'] }],
    order: [['date', 'DESC']] 
  });
};

module.exports = { createStaff, getStaff, getStaffById, updateStaff, deleteStaff, checkIn, checkOut, getAttendance, getAllAttendance };
