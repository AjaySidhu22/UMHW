const { Sequelize } = require('sequelize');
const path = require('path');

// Using SQLite for local development (file-based DB)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../../database.sqlite'),
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully (SQLite).');
  } catch (err) {
    console.error('Unable to connect to DB:', err);
    throw err;
  }
};

module.exports = { sequelize, connectDB };
