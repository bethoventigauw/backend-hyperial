import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Project from './Proyek.js';
import WarehouseMaterial from './WarehouseMaterial.js';

const MaterialProyek = sequelize.define('MaterialProyek', {
  materialProyekID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Project,
      key: 'projectID'
    }
  },
  materialName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  warehouseMaterialID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: WarehouseMaterial,
      key: 'WarehouseMaterialID'
    }
  },
  approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'materialProyek',
  timestamps: false
});


export default MaterialProyek;