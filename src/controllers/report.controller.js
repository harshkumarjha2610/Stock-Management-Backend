const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const reportService = require('../services/report.service');

const getSalesReport = catchAsync(async (req, res) => {
  const result = await reportService.getSalesReport(req.storeId, req.query);
  sendSuccess(res, result, 'Sales report retrieved.');
});

const getProfitReport = catchAsync(async (req, res) => {
  const result = await reportService.getProfitReport(req.storeId, req.query);
  sendSuccess(res, result, 'Profit report retrieved.');
});

const getGSTReport = catchAsync(async (req, res) => {
  const result = await reportService.getGSTReport(req.storeId, req.query);
  sendSuccess(res, result, 'GST report retrieved.');
});

const getDashboardStats = catchAsync(async (req, res) => {
  const result = await reportService.getDashboardStats(req.storeId);
  sendSuccess(res, result, 'Dashboard stats retrieved.');
});

module.exports = { getSalesReport, getProfitReport, getGSTReport, getDashboardStats };
