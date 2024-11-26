import { getEmailTrackingByToken, setVerification } from '../services/emailTrackingService.js';// Service functions to handle DB operations
import logger from '../utils/logger.js';
 
export const verifyUser = async (req, res) => {
  const { token } = req.query; // Extract userId and token from the query params
  logger.debug(`Request received with  token: ${token}`);
 
  try {
    // Step 1: Fetch the email tracking record
    logger.info('Fetching token details from EmailTracking');
    const emailTracking = await getEmailTrackingByToken(token);
    
 
    if (!emailTracking) {
      logger.error('Invalid verification link or token does not exist');
      return res.status(400).json({ error: 'Invalid verification link or token does not exist' });
    }
 
    // Step 2: Check if the token has expired
    logger.info('timer started');
    const currentTime =  Date.now();
    if (emailTracking.expiryTime.getTime() < currentTime) {
      logger.error('Verification link has expired');
      return res.status(403).json({ error: 'Verification link has expired' });
    }
 
    // Step 3: Update the verification status in the database
    logger.info('start before changing status');
    await setVerification(emailTracking.email);
    logger.info(`Email verified successfully for user: ${emailTracking.email}`);
 
    // Step 4: Return success response
    res.status(200).json({ message: 'Verification successful. Your email has been verified.' });
  } catch (error) {
    logger.error('Error during verification process:', error);
    res.status(500).json({ error: 'Internal server error during verification process' });
  }
};
 