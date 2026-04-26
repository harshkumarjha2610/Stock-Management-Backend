const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const salaryService = require('../services/salary.service');

const createSalaryPayment = catchAsync(async (req, res) => {
  const payment = await salaryService.createSalaryPayment(req.body, req.storeId);
  sendSuccess(res, payment, 'Salary payment recorded.', 201);
});

const getSalaryHistory = catchAsync(async (req, res) => {
  const payments = await salaryService.getSalaryHistory(req.params.staffId, req.storeId);
  sendSuccess(res, payments, 'Salary history retrieved.');
});

module.exports = { createSalaryPayment, getSalaryHistory };
