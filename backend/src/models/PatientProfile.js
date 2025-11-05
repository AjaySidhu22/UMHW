const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const PatientProfile = sequelize.define('PatientProfile', {
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
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  bloodGroup: { type: DataTypes.STRING, allowNull: true },
  allergies: { type: DataTypes.TEXT, allowNull: true },
  emergencyContactName: { type: DataTypes.STRING, allowNull: true },
  emergencyContactNumber: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'patient_profiles'
});

// association (call after all models imported in bootstrap, but using manual if needed)
 

module.exports = PatientProfile;
