// const bcrypt = require('bcrypt');
// const { User } = require('../models/user');

import bcrypt from 'bcrypt';
import { User } from '../models/user.js';

async function authenticateBasicAuth(req, res, next) {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Authentication header missing or invalid' });
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  
  const [email, password] = credentials.split(':');

  // Check if a user with the provided email exists
  User.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid email' });
      }

      // Compare the provided password with the stored hashed password
      
      const cpassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      console.log(cpassword);
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      req.user = user;
      next();
    })
    .catch((error) => {
      console.log("error");
      res.status(500).json({ message: 'Internal server error' });
    });
}

export default authenticateBasicAuth;
