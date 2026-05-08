const { Bill, BillItem, Product, Customer } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const AppError = require('../utils/AppError');
const { v4: uuidv4 } = require('uuid');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

const createBill = async (data, storeId) => {
  const transaction = await sequelize.transaction();
  try {
    const productIds = data.items.map((i) => i.product_id);
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds }, store_id: storeId },
      transaction, lock: true,
    });
    const pMap = {};
    products.forEach((p) => { pMap[p.id] = p; });

    for (const item of data.items) {
      const p = pMap[item.product_id];
      if (!p) throw new AppError(`Product ${item.product_id} not found.`, 404);
      if (p.stock_quantity < item.quantity)
        throw new AppError(`Insufficient stock for "${p.name}". Available: ${p.stock_quantity}`, 400);
    }

    let totalAmount = 0;
    let totalGST = 0;
    let totalDiscount = 0;

    const itemsData = data.items.map((item) => {
      const p = pMap[item.product_id];
      const price = parseFloat(p.selling_price);
      const buyingPrice = parseFloat(p.buying_price);
      const gstPct = parseFloat(p.gst_percent);
      const itemDiscount = parseFloat(item.discount) || 0;
      
      const sub = price * item.quantity;
      const taxable = (price - itemDiscount) * item.quantity;
      const gst = (taxable * gstPct) / 100;
      
      totalAmount += sub;
      totalGST += gst;
      totalDiscount += (itemDiscount * item.quantity);
 
      return {
        product_id: item.product_id,
        size: item.size || null,
        quantity: item.quantity,
        purchase_price: buyingPrice,
        price,
        discount: itemDiscount,
        gst_percent: gstPct,
        gst_amount: Math.round(gst * 100) / 100,
        total_amount: Math.round((taxable + gst) * 100) / 100
      };
    });

    const billDiscountPercent = parseFloat(data.discount_percent) || 0;
    const billDiscountAmount = Math.round((totalAmount - totalDiscount) * (billDiscountPercent / 100) * 100) / 100;
    totalDiscount += billDiscountAmount;

    const finalAmount = Math.round((totalAmount + totalGST - totalDiscount) * 100) / 100;
    const invoiceNumber = `INV-${storeId}-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    const bill = await Bill.create({
      store_id: storeId,
      invoice_number: invoiceNumber,
      customer_id: data.customer_id || null,
      customer_name: data.customer_name || null,
      customer_phone: data.customer_phone || null,
      total_amount: Math.round(totalAmount * 100) / 100,
      gst_amount: Math.round(totalGST * 100) / 100,
      discount: Math.round(totalDiscount * 100) / 100,
      discount_percent: billDiscountPercent,
      final_amount: finalAmount,
      grand_total: finalAmount,
      cash_received: parseFloat(data.cash_received) || 0,
      payment_method: (data.payment_method || 'CASH').toUpperCase().replace(' ', '_'),
      paid_status: (data.paid_status || 'PAID').toUpperCase(),
    }, { transaction });

    await BillItem.bulkCreate(itemsData.map((i) => ({ ...i, bill_id: bill.id })), { transaction });

    for (const item of data.items) {
      await Product.decrement('stock_quantity', { by: item.quantity, where: { id: item.product_id }, transaction });
    }

    if (data.customer_id) {
      await Customer.update({
        total_spent: sequelize.literal(`total_spent + ${finalAmount}`),
        total_orders: sequelize.literal(`total_orders + 1`),
        last_purchase: new Date(),
      }, { where: { id: data.customer_id, store_id: storeId }, transaction });
    }

    await transaction.commit();
    return await Bill.findByPk(bill.id, {
      include: [
        { association: 'items', include: [{ association: 'product', attributes: ['id', 'name', 'barcode'] }] },
        { association: 'customer', attributes: ['id', 'name', 'phone'] }
      ],
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const getBillById = async (id, storeId) => {
  const bill = await Bill.findOne({ where: { id, store_id: storeId },
    include: [{ association: 'items', include: [{ association: 'product', attributes: ['id', 'name', 'barcode'] }] },
      { association: 'customer', attributes: ['id', 'name', 'phone'] }] });
  if (!bill) throw new AppError('Bill not found.', 404);
  return bill;
};

const getBills = async (storeId, query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = { store_id: storeId };
  if (query.customer_id) where.customer_id = query.customer_id;
  if (query.payment_method) where.payment_method = query.payment_method;
  if (query.paid_status) where.paid_status = query.paid_status;
  if (query.from || query.to) {
    where.created_at = {};
    if (query.from) where.created_at[Op.gte] = new Date(query.from);
    if (query.to) where.created_at[Op.lte] = new Date(query.to);
  }
  const { rows, count } = await Bill.findAndCountAll({ where,
    include: [{ association: 'customer', attributes: ['id', 'name', 'phone'] }],
    order: [['created_at', 'DESC']], limit, offset });
  
  // If 'page' is not provided, the frontend likely expects the full array for reports/dropdowns
  if (!query.page) return rows;

  return paginatedResponse(rows, count, page, limit);
};

module.exports = { createBill, getBillById, getBills };
