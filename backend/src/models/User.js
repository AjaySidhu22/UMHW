const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: { // 'patient' | 'doctor' | 'admin'
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'patient'
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refreshToken: {
    type: DataTypes.TEXT,   // ✅ use TEXT so we don’t worry about length
    allowNull: true
  },
  refreshTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 'users',
  timestamps: true
});

// Password hashing hook
User.beforeCreate(async (user, options) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function (plaintext) {
  return bcrypt.compare(plaintext, this.password);
};

module.exports = User;
