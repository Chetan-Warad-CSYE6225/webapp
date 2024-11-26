import User from '../models/user.js';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';


dotenv.config();

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      logger.info(`User found with email: ${email}`);
    } else {
      logger.warn(`User not found with email: ${email}`);
    }
    return user;
  } catch (error) {
    logger.error(`Error fetching user by email: ${email}`, error);
    throw error;
  }
};

// Create user
export const createUser = async (userData) => {
  try {
    // Hash the user's password
    const hashedPassword = await bcrypt.hash(userData.password, bcrypt.genSaltSync(10));
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      account_created: new Date(),
      account_updated: new Date(),
      is_verified: false, // Default to unverified
    });

    // Automatically verify users in test environments
    if (process.env.APP_ENV === 'test') {
      user.is_verified = true;
      await user.save();
    }

    logger.info(`User created successfully with ID: ${user.id}`);
    return user;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (email, updates) => {
  try {
    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) {
      logger.warn(`User not found for update with email: ${email}`);
      return null;
    }

    // Hash password if being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, bcrypt.genSaltSync(10));
    }

    // Assign updates to the user object
    Object.assign(user, updates);
    user.account_updated = new Date();

    // Save changes to the database
    await user.save();
    logger.info(`User updated successfully with email: ${email}`);
    return user;
  } catch (error) {
    logger.error(`Error updating user with email: ${email}`, error);
    throw error;
  }
};
