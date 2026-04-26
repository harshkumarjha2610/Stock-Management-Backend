const { Bill, BillItem, Product } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const AppError = require('../utils/AppError');

/**
 * Sales report: total sales aggregated by date range.
 */
const getSalesReport = async (storeId, query) => {
  const where = { store_id: storeId };
  if (query.from || query.to) {
    where.created_at = {};
    if (query.from) where.created_at[Op.gte] = new Date(query.from);
    if (query.to) where.created_at[Op.lte] = new Date(query.to);
  }

  const result = await Bill.findAll({
    where,
    attributes: [
      [fn('DATE', col('Bill.created_at')), 'date'],
      [fn('COUNT', col('Bill.id')), 'total_bills'],
      [fn('SUM', col('total_amount')), 'total_sales'],
      [fn('SUM', col('gst_amount')), 'total_gst'],
      [fn('SUM', col('discount')), 'total_discount'],
      [fn('SUM', col('final_amount')), 'total_final'],
    ],
    group: [fn('DATE', col('Bill.created_at'))],
    order: [[fn('DATE', col('Bill.created_at')), 'DESC']],
    raw: true,
  });

  return result;
};

/**
 * Profit report: (selling_price - purchase_price) × quantity for each billed item.
 */
const getProfitReport = async (storeId, query) => {
  const billWhere = { store_id: storeId };
  if (query.from || query.to) {
    billWhere.created_at = {};
    if (query.from) billWhere.created_at[Op.gte] = new Date(query.from);
    if (query.to) billWhere.created_at[Op.lte] = new Date(query.to);
  }

  const bills = await Bill.findAll({
    where: billWhere,
    include: [{
      association: 'items',
      include: [{ association: 'product', attributes: ['id', 'name', 'purchase_price', 'selling_price'] }],
    }],
  });

  let totalRevenue = 0;
  let totalCost = 0;
  const productProfits = {};

  for (const bill of bills) {
    for (const item of bill.items) {
      const sellPrice = parseFloat(item.price);
      const purchasePrice = parseFloat(item.product.purchase_price);
      const qty = item.quantity;
      const revenue = sellPrice * qty;
      const cost = purchasePrice * qty;
      const profit = revenue - cost;

      totalRevenue += revenue;
      totalCost += cost;

      if (!productProfits[item.product_id]) {
        productProfits[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product.name,
          total_quantity: 0,
          total_revenue: 0,
          total_cost: 0,
          total_profit: 0,
        };
      }
      productProfits[item.product_id].total_quantity += qty;
      productProfits[item.product_id].total_revenue += revenue;
      productProfits[item.product_id].total_cost += cost;
      productProfits[item.product_id].total_profit += profit;
    }
  }

  return {
    summary: {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_cost: Math.round(totalCost * 100) / 100,
      total_profit: Math.round((totalRevenue - totalCost) * 100) / 100,
    },
    by_product: Object.values(productProfits),
  };
};

/**
 * GST report: total GST collected by month.
 */
const getGSTReport = async (storeId, query) => {
  const where = { store_id: storeId };
  if (query.month) {
    // month format: YYYY-MM
    const [year, month] = query.month.split('-').map(Number);
    where.created_at = {
      [Op.gte]: new Date(year, month - 1, 1),
      [Op.lt]: new Date(year, month, 1),
    };
  }

  const result = await Bill.findAll({
    where,
    attributes: [
      [fn('TO_CHAR', col('Bill.created_at'), 'YYYY-MM'), 'month'],
      [fn('SUM', col('total_amount')), 'total_sales'],
      [fn('SUM', col('gst_amount')), 'total_gst'],
      [fn('SUM', col('final_amount')), 'taxable_amount'],
    ],
    group: [fn('TO_CHAR', col('Bill.created_at'), 'YYYY-MM')],
    order: [[fn('TO_CHAR', col('Bill.created_at'), 'YYYY-MM'), 'DESC']],
    raw: true,
  });

  return result;
};

/**
 * Dashboard statistics: today's sales, total products, low stock count, customers.
 */
const getDashboardStats = async (storeId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todaySales, totalProducts, lowStockCount, totalCustomers, totalBills] = await Promise.all([
    Bill.sum('final_amount', {
      where: { store_id: storeId, created_at: { [Op.gte]: today, [Op.lt]: tomorrow } },
    }),
    Product.count({ where: { store_id: storeId } }),
    Product.count({
      where: {
        store_id: storeId,
        stock_quantity: { [Op.lte]: col('min_stock_level') },
      },
    }),
    require('../models').Customer.count({ where: { store_id: storeId } }),
    Bill.count({ where: { store_id: storeId } }),
  ]);

  return {
    today_sales: todaySales || 0,
    total_products: totalProducts,
    low_stock_count: lowStockCount,
    total_customers: totalCustomers,
    total_bills: totalBills,
  };
};

module.exports = { getSalesReport, getProfitReport, getGSTReport, getDashboardStats };
