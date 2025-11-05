module.exports = (req, res, next) => {
  const { role } = req.user;
  const body = req.body;

  // Remove read-only fields that Sequelize adds
  const readOnlyFields = ['id', 'userId', 'createdAt', 'updatedAt'];
  readOnlyFields.forEach(field => delete body[field]);

  if (role === 'doctor') {
    const allowedFields = ['specialty', 'licenseNumber'];
    const invalid = Object.keys(body).filter(key => !allowedFields.includes(key));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid fields for doctor: ${invalid.join(', ')}` });
    }
  }

  if (role === 'patient') {
    const allowedFields = ['dateOfBirth', 'bloodGroup', 'allergies', 'emergencyContactName', 'emergencyContactNumber'];
    const invalid = Object.keys(body).filter(key => !allowedFields.includes(key));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid fields for patient: ${invalid.join(', ')}` });
    }
  }

  next();
};