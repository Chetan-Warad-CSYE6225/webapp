// const { Sequelize, DataTypes } = require('sequelize');
// const bcrypt = require('bcrypt');

import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../db/sequelize.js';


  

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      readOnly: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      writeOnly: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    account_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      readOnly: true,
    },
    account_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      readOnly: true,
    }}, 
    {
      timestamps: false, // To Disable Sequelize's default timestamps (createdAt, updatedAt)
    }
  );

  
  export { User };