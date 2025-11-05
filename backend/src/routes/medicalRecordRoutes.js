// \backend\src\routes\medicalRecordRoutes.js

const express = require('express');
const router = express.Router();

const {
  createRecord,
  getPatientRecords,
  updateRecord,
  deleteRecord,
} = require('../controllers/medicalRecordController');

// Import protect and role-check middlewares
const { protect, requireDoctorOrAdmin, requirePatientOrDoctor } = require('../middlewares/authMiddleware');

const upload = require('../middlewares/uploadMiddleware');

// Routes for Medical Records

// Create a new record (Doctor/Admin only)
// **MODIFIED ROUTE**: Add upload middleware to handle the file field 'medicalFile'
router.post(
  '/',
  protect,
  requireDoctorOrAdmin,
  upload.single('medicalFile'), // <--- **NEW MIDDLEWARE**
  createRecord
);

// Get all records for a patient (Patient, Doctor, Admin)
router.get('/patient/:patientId', protect, requirePatientOrDoctor, getPatientRecords);

// Update a specific record (Doctor/Admin only)
router.put('/:id', protect, requireDoctorOrAdmin, updateRecord);

// Delete a specific record (Doctor/Admin only)
router.delete('/:id', protect, requireDoctorOrAdmin, deleteRecord);

module.exports = router;