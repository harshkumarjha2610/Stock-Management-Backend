const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PAYMENT_METHODS = require('../constants/paymentMethods');

const Bill = sequelize.define('Bill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'stores', key: 'id' },
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'customers', key: 'id' },
  },
  total_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0,
  },
  gst_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0,
  },
  final_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0,
  },
  payment_method: {
    type: DataTypes.ENUM(Object.values(PAYMENT_METHODS)),
    allowNull: false,
    defaultValue: PAYMENT_METHODS.CASH,
  },
  paid_status: {
    type: DataTypes.ENUM('PAID', 'UNPAID', 'PARTIAL'),
    allowNull: false,
    defaultValue: 'PAID',
  },
}, {
  tableName: 'bills',
  indexes: [
    { fields: ['store_id'] },
    { fields: ['customer_id'] },
    { fields: ['created_at'] },
    { unique: true, fields: ['invoice_number'] },
  ],
});

module.exports = Bill;
