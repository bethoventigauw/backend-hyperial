import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('hyperial', 'adminhyperial', 'kipasAngin5000', {
  host: 'hyperialdb-server.mysql.database.azure.com',
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export default sequelize;