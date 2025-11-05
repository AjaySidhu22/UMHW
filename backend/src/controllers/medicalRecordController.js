const { MedicalRecord, PatientProfile, DoctorProfile } = require('../models');

const multer = require('multer');



const createRecord = async (req, res, next) => {

  try {

    // If file upload middleware was successful, file data is in req.file

    const filePath = req.file ? `/uploads/${req.file.filename}` : null; // <--- **NEW LINE**



    // NOTE: The `date` field in req.body might need renaming to `recordDate` to match the model.

    // Let's rename the incoming 'date' to 'recordDate' for clarity/model matching.

    const { patientId, title, description, date } = req.body;

    const doctorId = req.user.doctorProfileId;



    // **ERROR CHECK**: Ensure doctor has a profile linked to create records

    // NOTE: This check depends on whether req.user has doctorProfileId or if we need to fetch DoctorProfile.

    // Given the current protect middleware only puts ID/Role, we must fetch the profile ID.



    const doctorProfile = await DoctorProfile.findOne({ where: { userId: req.user.id } });

    if (!doctorProfile) {

      // If the user is a Doctor/Admin but hasn't created a DoctorProfile, they cannot create a record linked to them.

      return res.status(403).json({ success: false, message: 'Doctor profile must be completed before creating records.' });

    }

    const finalDoctorId = doctorProfile.id; // Use the DoctorProfile ID here, not the User ID



    const record = await MedicalRecord.create({

      patientId,

      doctorId: finalDoctorId, // <--- **UPDATED**

      title,

      description,

      recordDate: date,

      filePath

    });



    res.status(201).json({ success: true, record: { ...record.toJSON(), filePath } });

  } catch (err) {

    // If multer errors (e.g., file type rejected), it will be caught here.

    if (err instanceof multer.MulterError) {

      return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });

    }

    next(err);

  }

};



const getPatientRecords = async (req, res, next) => {

  try {

    let targetPatientProfileId = req.params.patientId;

    const userRole = req.user.role;

    const currentUserId = req.user.id;



    // SCENARIO 1: If the current user is a patient, they can only view their OWN records.

    if (userRole === 'patient') {

      // Find the PatientProfile associated with the current User ID

      const patientProfile = await PatientProfile.findOne({ where: { userId: currentUserId } });



      if (!patientProfile) {

        return res.status(404).json({ success: false, message: 'Patient profile not found.' });

      }



      // Ensure the ID being requested matches the user's own profile ID for security

      // The frontend *should* send the correct ID, but we enforce it here.

      targetPatientProfileId = patientProfile.id;

    }

    // SCENARIO 2: If the current user is a doctor/admin, the requested ID (req.params.patientId) is assumed

    // to be the PatientProfile ID, and we proceed to fetch it.

    // NOTE: For doctors/admins, we must verify that the requested ID is indeed a valid PatientProfile ID.

    // We can do a quick check, which also ensures the PatientProfile exists for creating records.



    const patientProfileCheck = await PatientProfile.findByPk(targetPatientProfileId);

    if (!patientProfileCheck) {

      return res.status(404).json({ success: false, message: 'Target Patient ID does not correspond to a valid profile.' });

    }



    // Final check for unauthorized access in Scenario 2 is handled by `requirePatientOrDoctor` middleware,

    // which ensures only authorized roles reach this point.



    const records = await MedicalRecord.findAll({

      where: { patientId: targetPatientProfileId }, // Use the verified profile ID

      include: [

        // We can also include PatientProfile here, but let's stick to DoctorProfile for now

        { model: DoctorProfile, attributes: ['id', 'specialty', 'licenseNumber'] }

      ],

      order: [['recordDate', 'DESC']] // Show newest records first

    });



    res.json({ success: true, records });

  } catch (err) {

    next(err);

  }

};



const updateRecord = async (req, res, next) => {

  try {

    const { id } = req.params;

    const { title, description, date } = req.body;



    const record = await MedicalRecord.findByPk(id);

    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });



    await record.update({ title, description, date });

    res.json({ success: true, record });

  } catch (err) {

    next(err);

  }

};



const deleteRecord = async (req, res, next) => {

  try {

    const { id } = req.params;

    const record = await MedicalRecord.findByPk(id);

    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });



    await record.destroy();

    res.json({ success: true, message: 'Record deleted' });

  } catch (err) {

    next(err);

  }

};



module.exports = {

  createRecord,

  getPatientRecords,

  updateRecord,

  deleteRecord

};

