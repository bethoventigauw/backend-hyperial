import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WarehouseMaterial = sequelize.define('WarehouseMaterial', {
  WarehouseMaterialID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
  MaterialName: {
      type: DataTypes.STRING(255),
      allowNull: false
  },
  Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
  },
  Unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null
  },
  Quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
  },
  Location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
  }
}, {
  tableName: 'warehouseMaterial',
  timestamps: false
});

export default WarehouseMaterial;
