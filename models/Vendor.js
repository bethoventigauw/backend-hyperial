import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Vendor = sequelize.define('Vendor', {
  VendorID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  VendorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  City: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  State: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ZipCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  PhoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ContactPerson: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  GoodsOrServices: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  PaymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  PaymentTerms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  NPWP: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  BankDetails: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Notes: {
    type: DataTypes.STRING,
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
  tableName: 'vendors',
  timestamps: false,
});

export default Vendor;
