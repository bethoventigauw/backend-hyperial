import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Vendor from './Vendor.js';

const VendorMaterial = sequelize.define('VendorMaterial', {
  VendorMaterialId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  VendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vendor,
      key: 'id'
    }
  },
  MaterialName: { type: DataTypes.STRING, allowNull: false },
  Description: { type: DataTypes.TEXT, allowNull: false },
  Unit: { type: DataTypes.STRING, allowNull: false },
  Price: { type: DataTypes.FLOAT, allowNull: false }, // Tambahkan kolom Price
  Quantity: { type: DataTypes.INTEGER, allowNull: false }
}, {
  timestamps: false // Tidak menggunakan kolom createdAt dan updatedAt
});

VendorMaterial.belongsTo(Vendor, { foreignKey: 'VendorId' });

export default VendorMaterial;
