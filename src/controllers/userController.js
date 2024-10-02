const express = require('express');
const router = express.Router();
const {User, sequelize}  = require('../models/user');
const bcrypt = require('bcrypt');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if a user with the same email already exists
    console.log("Email: ", email);
    await sequelize.sync();
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({message: "The user already exists"}); //If same user exists then send 400 status code
    }

    // Hash the password
   const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    // Create a new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      account_created: new Date(),
      account_updated: new Date(),
    });

    // Remove password from the response
    newUser.password = undefined;

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(404).send();
  }
};

// Update user information
exports.updateUser = async (req, res) => {
    try {
      const { first_name, last_name, password } = req.body;
      const userId = req.user.id; // Assuming you have middleware to populate req.user with user information
      //const userName = req.user.username;
  
      //if(userName===username){
  
      
          // Find the user by ID
          const user = await User.findByPk(userId);
  
          if (!user) {
          return res.status(404).json({ message: 'User not found' });
          }
  
          // Update allowed fields
          user.first_name = first_name || user.first_name;
          user.last_name = last_name || user.last_name;
  
          if (password) {
          const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
          user.password = hashedPassword;
          }
  
         
  
          // Check for any additional fields in the request body
          const additionalFields = Object.keys(req.body).filter(
              (field) => !['first_name', 'last_name', 'password'].includes(field)
          );
  
          if (additionalFields.length > 0) {
              return res.status(400).send("Attempt to update unauthorized field");
          }
          user.account_updated = new Date();
          await user.save();
  
          // Remove password from the response
          user.password = undefined;
  
          res.status(204).send();
        }
     catch (error) {
      console.error(error);
      res.status(400).send();
    }
  };

// Get user information
exports.getUser =  async (req, res) => {
    try {
        const userId = req.user.id; // Fetch the user id from findOne function in authenticationMiddleware
  
      // Find the user by ID
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(400).send();
      }
  
      // Remove password from the response
    
      user.password = undefined;
      console.log(user.password);
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'ERROR' });
    }
  };