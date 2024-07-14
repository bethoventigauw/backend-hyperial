import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Vendor from './Vendor.js';

const Order = sequelize.define('Order', {
  OrderID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  VendorID: {
    type: DataTypes.INTEGER,
    references: {
      model: Vendor,
      key: 'id'
    },
    allowNull: false
  },
  OrderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Shipping: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
  TotalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null
  },
}, {
  tableName: 'orders', // Nama tabel di database
  timestamps: false // Tidak menggunakan kolom createdAt dan updatedAt
});

Order.belongsTo(Vendor, { foreignKey: 'VendorID' });

export default Order;
