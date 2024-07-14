import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './Order.js';

const Shipment = sequelize.define('Shipment', {
  OrderId: {
    type: DataTypes.INTEGER,
    references: {
      model: Order,
      key: 'id'
    }
  },
  ShipmentDate: { type: DataTypes.DATE, allowNull: false },
  Status: { type: DataTypes.STRING, allowNull: false }
});

Shipment.belongsTo(Order, { foreignKey: 'OrderId' });

export default Shipment;
