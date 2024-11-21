import { createUser as createUserService, getUserByEmail, updateUser as updateUserService } from '../services/userServices.js';
import logger from '../utils/logger.js';
import EmailTracking from '../models/EmailTracking.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// Configure AWS SNS
const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Allowed headers
const allowedHeaders = [
  'content-type', 'accept', 'user-agent', 'host', 'content-length',
  'accept-encoding', 'connection', 'authorization', 'postman-token',
  'x-forwarded-for', 'x-forwarded-proto', 'x-amzn-trace-id', 'x-forwarded-port'
];

/**
 * Create a new user
 */
export const createUser = async (req, res) => {
  logger.info('Received request to create user.');
  try {
    // Validate request headers
    const hasUnexpectedHeaders = Object.keys(req.headers).some(
      (header) => !allowedHeaders.includes(header.toLowerCase()) && !header.toLowerCase().startsWith('x-')
    );
    if (hasUnexpectedHeaders) {
      logger.warn('Request contains unexpected headers.');
      return res.status(400).json({ message: 'Unexpected headers in the request.' });
    }

    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      logger.warn('Missing required fields in request body.');
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the email is already in use
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      logger.warn(`Email already in use: ${email}`);
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Create the user
    const newUser = await createUserService(req.body);
    logger.info(`User created successfully with email: ${email}`);

    // Generate verification token and expiry
    const token = crypto.randomBytes(16).toString('hex');
    console.log('Generated Token:', token);
    const expiryTime = new Date(Date.now() + 2 * 60 * 1000); // Token expires in 2 minutes

    // Debugging log for generated token
    logger.debug(`Generated token: ${token} for email: ${email}`);


    // Save the token in the EmailTracking table
    await EmailTracking.create({ email, token, expiryTime });
    logger.info(`Verification token generated and saved for user: ${email}`);

    // Publish the verification message to SNS
    const message = JSON.stringify({ email, token });
    const params = {
      Message: message,
      TopicArn: process.env.SNS_TOPIC_ARN,
    };

    // Detailed log for SNS publish parameters
    logger.debug('SNS publish parameters:', params);
    
    try {
      await snsClient.send(new PublishCommand(params));
      logger.info(`Verification token published to SNS successfully for email: ${email}`);
    } catch (snsError) {
      logger.error(`Error publishing to SNS for email: ${email}`, snsError);
      return res.status(500).json({ error: 'Failed to send verification token.' });
    }

    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Error creating user:', error.message);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
};

/**
 * Get user information
 */
export const getUserInfo = async (req, res) => {
  logger.info('Received request to fetch user information.');
  try {
    const user = req.user;
    if (!user) {
      logger.warn('User not found in the request context.');
      return res.status(404).json({ error: 'User not found.' });
    }
    logger.info(`User information fetched successfully for email: ${user.email}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error('Error fetching user information:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching user information.' });
  }
};

/**
 * Update user information
 */
export const updateUser = async (req, res) => {
  logger.info('Received request to update user information.');
  try {
    const { first_name, last_name, password } = req.body;

    // Validate allowed fields
    const allowedFields = ['first_name', 'last_name', 'password'];
    const invalidFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      logger.warn(`Invalid fields in update request: ${invalidFields.join(', ')}`);
      return res.status(400).json({ error: `Cannot update fields: ${invalidFields.join(', ')}` });
    }

    // Update the user
    const updatedUser = await updateUserService(req.user.email, { first_name, last_name, password });
    if (!updatedUser) {
      logger.warn(`User not found for email: ${req.user.email}`);
      return res.status(404).json({ error: 'User not found.' });
    }

    logger.info(`User information updated successfully for email: ${req.user.email}`);
    res.status(204).end();
  } catch (error) {
    logger.error('Error updating user:', error.message);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
};
