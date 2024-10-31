import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import sequelize from '../db/sequelize.js';
import logger from '../utils/logger.js';  // Import the logger

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!password || password.trim() === "") {
      logger.warn("Password cannot be empty.");
      return res.status(400).json({ message: "Password cannot be empty" });
    }

    // Check if a user with the same email already exists
    logger.info(`Checking existence for email: ${email}`);
    await sequelize.sync();  // Ensure models are in sync with the database
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`User already exists with email: ${email}`);
      return res.status(400).send({ message: "The user already exists" });
    }

    // Hash the password
    logger.info("Hashing password for new user.");
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
    logger.info(`User created successfully with email: ${email}`);
    res.status(201).json(newUser);
  } catch (error) {
    logger.error(`Error creating user with email ${req.body.email || 'unknown'}: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user information
export const updateUser = async (req, res) => {
  try {
    const { first_name, last_name, password } = req.body;

    if (password === "") {
      logger.warn("Password cannot be empty.");
      return res.status(400).json({ message: "Password cannot be empty" });
    }

    const userId = req.user.id;
    logger.info(`Updating user info for user ID: ${userId}`);

    // Find the user by ID
    const user = await User.findByPk(userId);

    if (!user) {
      logger.warn(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;

    if (password) {
      logger.info("Hashing new password for user update.");
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      user.password = hashedPassword;
    }

    // Check for any additional fields in the request body
    const additionalFields = Object.keys(req.body).filter(
      (field) => !['first_name', 'last_name', 'password'].includes(field)
    );

    if (additionalFields.length > 0) {
      logger.warn(`Attempt to update unauthorized fields for user ID: ${userId}`);
      return res.status(400).json({ message: "Attempt to update unauthorized field" });
    }

    user.account_updated = new Date();
    await user.save();

    // Remove password from the response
    user.password = undefined;
    logger.info(`User updated successfully for ID: ${userId}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error updating user for ID ${req.user?.id || 'unknown'}: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user information
export const getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching user info for user ID: ${userId}`);

    // Find the user by ID
    const user = await User.findByPk(userId);

    if (!user) {
      logger.warn(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from the response
    user.password = undefined;
    logger.info(`User info retrieved successfully for ID: ${userId}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error fetching user for ID ${req.user?.id || 'unknown'}: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  createUser,
  updateUser,
  getUser
};
