import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('hyperial_app', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

export default sequelize;
