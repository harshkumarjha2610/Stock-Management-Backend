const { SalaryPayment, Staff } = require('../models');
const AppError = require('../utils/AppError');

const createSalaryPayment = async (data, storeId) => {
  // Verify staff belongs to store
  const staff = await Staff.findOne({ where: { id: data.staff_id, store_id: storeId } });
  if (!staff) throw new AppError('Staff member not found in this store.', 404);

  const payment = await SalaryPayment.create({ ...data, store_id: storeId });
  return payment;
};

const getSalaryHistory = async (staffId, storeId) => {
  const staff = await Staff.findOne({ where: { id: staffId, store_id: storeId } });
  if (!staff) throw new AppError('Staff member not found in this store.', 404);

  return SalaryPayment.findAll({
    where: { staff_id: staffId, store_id: storeId },
    order: [['month', 'DESC']],
  });
};

module.exports = { createSalaryPayment, getSalaryHistory };
