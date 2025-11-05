// Import all model definitions
const User = require('./User');
const PatientProfile = require('./PatientProfile');
const DoctorProfile = require('./DoctorProfile');
const MedicalRecord = require('./MedicalRecord');
// **NEW IMPORT**
const ShareToken = require('./ShareToken'); 
// User-Profile Associations
User.hasOne(PatientProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
PatientProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(DoctorProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId' });

// Medical Record Associations
PatientProfile.hasMany(MedicalRecord, { foreignKey: 'patientId', onDelete: 'CASCADE' });
MedicalRecord.belongsTo(PatientProfile, { foreignKey: 'patientId' });

DoctorProfile.hasMany(MedicalRecord, { foreignKey: 'doctorId', onDelete: 'SET NULL' });
MedicalRecord.belongsTo(DoctorProfile, { foreignKey: 'doctorId' });
// **START: Share Token Associations (MISSING LINES)**
PatientProfile.hasMany(ShareToken, { foreignKey: 'patientId', onDelete: 'CASCADE' });
ShareToken.belongsTo(PatientProfile, { foreignKey: 'patientId' });
// **END: Share Token Associations**
// We export the sequelize instance and all models for use throughout the application
module.exports = {
  sequelize: require('../config/database').sequelize,
  User,
  PatientProfile,
  DoctorProfile,
  MedicalRecord,
    // **NEW EXPORT**
  ShareToken, 
};