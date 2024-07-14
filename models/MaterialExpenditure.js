import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import WarehouseMaterial from './WarehouseMaterial.js';

const MaterialExpenditure = sequelize.define('MaterialExpenditure', {
  ExpenditureID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  WarehouseMaterialID: {
    type: DataTypes.INTEGER,
    references: {
      model: WarehouseMaterial,
      key: 'WarehouseMaterialID'
    },
    allowNull: false
  },
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ExpenditureDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'materialexpenditures',
  timestamps: false
});

MaterialExpenditure.belongsTo(WarehouseMaterial, { foreignKey: 'WarehouseMaterialID' });

export default MaterialExpenditure;
