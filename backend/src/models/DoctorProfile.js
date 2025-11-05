const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const DoctorProfile = sequelize.define('DoctorProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  specialty: { type: DataTypes.STRING, allowNull: true },
  licenseNumber: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'doctor_profiles'
});

 

module.exports = DoctorProfile;
