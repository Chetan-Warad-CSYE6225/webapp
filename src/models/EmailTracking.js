import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js'; // Ensure the correct Sequelize instance is imported

const EmailTracking = sequelize.define('EmailTracking', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiryTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false
});

export default EmailTracking;
