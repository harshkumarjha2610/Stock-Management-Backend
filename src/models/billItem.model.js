const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BillItem = sequelize.define('BillItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bill_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'bills', key: 'id' },
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Selling price per unit at time of billing',
  },
  gst_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  gst_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'bill_items',
  indexes: [
    { fields: ['bill_id'] },
    { fields: ['product_id'] },
  ],
});

module.exports = BillItem;
