// backend/src/models/MedicalRecord.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientId: {
    // will reference PatientProfile.id (set up association later)
    type: DataTypes.UUID,
    allowNull: false,
  },
  doctorId: {
    // optional: the doctor who created/added this record (set up association later)
    type: DataTypes.UUID,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  filePath: {
    // path to uploaded file (if any)
    type: DataTypes.STRING,
    allowNull: true,
  },
  recordDate: {
    // date of the medical event/report
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    // optional JSON metadata (Sequelize will handle for sqlite/postgres)
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  tableName: 'medical_records',
  timestamps: true
});

module.exports = MedicalRecord;
