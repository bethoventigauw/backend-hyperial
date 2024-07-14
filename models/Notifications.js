// models/Notification.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Vendor from './Vendor.js';
import Order from './Order.js';

const Notification = sequelize.define('Notification', {
  NotificationID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  VendorID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vendor,
      key: 'VendorID'
    }
  },
  OrderID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'OrderID'
    }
  },
  Shipping: {
    type: DataTypes.STRING,
    defaultValue: 'Pending'
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
    tableName: 'notifications',
    timestamps: false
});

Notification.belongsTo(Vendor, { foreignKey: 'VendorID' });
Notification.belongsTo(Order, { foreignKey: 'OrderID' });

export default Notification;