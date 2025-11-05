// \backend\src\models\ShareToken.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PatientProfile = require('./PatientProfile'); // Import for association

const ShareToken = sequelize.define('ShareToken', {
    token: {
        type: DataTypes.STRING, // Store the SHA256 hash of the token
        allowNull: false,
        unique: true,
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        // Foreign Key to PatientProfile
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    // Optionally track who the token was intended for (e.g., a Doctor's email)
    sharedWithEmail: {
        type: DataTypes.STRING,
        allowNull: true, 
    }
}, {
    tableName: 'share_tokens',
    timestamps: true,
    updatedAt: false // Only interested in createdAt
});

module.exports = ShareToken;