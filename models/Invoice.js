import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './Order.js';
import Vendor from './Vendor.js';

const Invoice = sequelize.define('Invoice', {
  InvoiceID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  OrderId: {
    type: DataTypes.INTEGER,
    references: {
      model: Order,
      key: 'OrderID'
    },
    allowNull: false
  },
  InvoiceDate: { type: DataTypes.DATE, allowNull: false },
  DueDate: { type: DataTypes.DATE, allowNull: false },
  Subtotal: { type: DataTypes.FLOAT, allowNull: false },
  Tax: { type: DataTypes.FLOAT, allowNull: false },
  Discount: { type: DataTypes.FLOAT, allowNull: false },
  TotalAmount: { type: DataTypes.FLOAT, allowNull: false },
  Status: { type: DataTypes.STRING, allowNull: false },
  Notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'invoices',
  timestamps: false
});

Invoice.belongsTo(Order, { foreignKey: 'OrderId' });
Order.belongsTo(Vendor, { foreignKey: 'VendorID' });

export default Invoice;
