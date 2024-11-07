import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import sequelize from '../db/sequelize.js';
import logger from '../utils/logger.js';

// Define allowed headers
const allowedHeaders = [
  'content-type', 'accept', 'user-agent', 'host', 'content-length',
  'accept-encoding', 'connection', 'authorization', 'postman-token',
  'x-forwarded-for', 'x-forwarded-proto', 'x-amzn-trace-id', 'x-forwarded-port'
];

// Create a new user
export const createUser = async (req, res) => {
  // Log incoming headers for debugging
  logger.info('Incoming headers:', req.headers);

  // Check for unexpected headers
  const hasUnexpectedHeaders = Object.keys(req.headers).some(
    (header) => !allowedHeaders.includes(header.toLowerCase()) && !header.toLowerCase().startsWith('x-')
  );

  // If there are unexpected headers, log a warning and return a 400 response
  if (hasUnexpectedHeaders) {
    logger.warn("Unexpected headers found in request.");
    return res.status(400).json({ message: "Unexpected headers in request" });
  }

  try {
    const { email, password, first_name, last_name } = req.body;

    if (!password || password.trim() === "") {
      logger.warn("Password cannot be empty.");
      return res.status(400).json({ message: "Password cannot be empty" });
    }

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

    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;

    if (password) {
      logger.info("Hashing new password for user update.");
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      user.password = hashedPassword;
    }

    const additionalFields = Object.keys(req.body).filter(
      (field) => !['first_name', 'last_name', 'password'].includes(field)
    );

    if (additionalFields.length > 0) {
      logger.warn(`Attempt to update unauthorized fields for user ID: ${userId}`);
      return res.status(400).json({ message: "Attempt to update unauthorized field" });
    }

    user.account_updated = new Date();
    await user.save();

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

    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

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
