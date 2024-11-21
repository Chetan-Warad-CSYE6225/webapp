import bcrypt from 'bcrypt';
import { getUserByEmail } from '../services/userServices.js';
import logger from '../utils/logger.js';

/**
 * Middleware for Basic Authentication
 */
export const authenticateBasicAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      logger.warn('Missing or invalid authorization header.');
      return res.status(401).json({ error: 'Unauthorized access. Please provide valid credentials.' });
    }

    // Decode the credentials
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    // Validate email and password
    if (!email || !password) {
      logger.warn('Missing email or password in Basic Auth credentials.');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Fetch user by email
    const user = await getUserByEmail(email);
    if (!user) {
      logger.warn(`Authentication failed: User not found with email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Authentication failed: Incorrect password for email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    logger.info(`User authenticated successfully: ${email}`);
    req.user = user; // Attach user object to the request
    next();
  } catch (error) {
    logger.error('Error during authentication:', error.message);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

/**
 * Middleware for Blocking Unverified Users
 */
export const blockUnverifiedUsers = (req, res, next) => {
  try {
    if (!req.user.is_verified) {
      logger.warn(`Access blocked for unverified user: ${req.user.email}`);
      return res.status(403).json({ error: 'Account not verified. Please verify your email address.' });
    }

    logger.info(`Verified user granted access: ${req.user.email}`);
    next();
  } catch (error) {
    logger.error('Error during user verification check:', error.message);
    res.status(500).json({ error: 'Internal server error during verification check.' });
  }
};
