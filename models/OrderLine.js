import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './Order.js';
import VendorMaterial from './VendorMaterial.js';

const OrderLine = sequelize.define('OrderLine', {
  OrderLineID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  OrderID: {
    type: DataTypes.INTEGER,
    references: {
      model: Order,
      key: 'OrderID'
    },
    allowNull: false
  },
  VendorMaterialID: {
    type: DataTypes.INTEGER,
    references: {
      model: VendorMaterial,
      key: 'VendorMaterialId'
    },
    allowNull: false
  },
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'orderlines', // Nama tabel di database
  timestamps: false // Tidak menggunakan kolom createdAt dan updatedAt
});

OrderLine.belongsTo(Order, { foreignKey: 'OrderID' });
OrderLine.belongsTo(VendorMaterial, { foreignKey: 'VendorMaterialID' });

export default OrderLine;
