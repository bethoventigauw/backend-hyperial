// models/user.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Vendor from './Vendor.js'; // Pastikan path impor model Vendor sudah benar

const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Role: {
    type: DataTypes.ENUM('vendor', 'admin', 'ProjectManager'),
    allowNull: false,
  },
  VendorID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

User.belongsTo(Vendor, { foreignKey: 'VendorID', as: 'vendorDetails' });

export default User;
