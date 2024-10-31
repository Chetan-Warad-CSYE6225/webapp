import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import logger from '../utils/logger.js'; // Import the logger

async function authenticateBasicAuth(req, res, next) {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];
  logger.info('Attempting to authenticate using Basic Auth.');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    logger.warn('Authentication failed: Missing or invalid Authorization header.');
    return res.status(401).json({ message: 'Authentication header missing or invalid' });
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [email, password] = credentials.split(':');

  logger.info(`Authenticating user with email: ${email}`);

  // Check if a user with the provided email exists
  User.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        logger.warn(`Authentication failed: User with email ${email} not found.`);
        return res.status(401).json({ message: 'Invalid email' });
      }

      // Compare the provided password with the stored hashed password
      if (!bcrypt.compareSync(password, user.password)) {
        logger.warn(`Authentication failed: Incorrect password for email ${email}.`);
        return res.status(401).json({ message: 'Invalid password' });
      }

      req.user = user;
      logger.info(`Authentication successful for user with email: ${email}`);
      next();
    })
    .catch((error) => {
      logger.error(`Error during authentication for user ${email}: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    });
}

export default authenticateBasicAuth;
