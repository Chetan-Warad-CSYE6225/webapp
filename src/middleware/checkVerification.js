import { User } from '../models/user.js';
import logger from '../utils/logger.js';

const checkVerification = async (req, res, next) => {
  try {
    // Ensure the request contains user email
    if (!req.user || !req.user.email) {
      logger.warn('Missing email information in request.');
      return res.status(403).json({ message: 'Authentication required.' });
    }

    const email = req.user.email;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn(`User with email ${email} not found.`);
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.is_verified) {
      logger.warn(`User with email ${email} is not verified.`);
      return res.status(403).json({ message: 'Account not verified.' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    logger.error(`Error in verification middleware: ${error.message}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export default checkVerification;
