import { createUser as createUserService, getUserByEmail, updateUser as updateUserService } from '../services/userServices.js';
import logger from '../utils/logger.js';
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

// Create a new user
export const createUser = async (req, res) => {
  logger.info('Incoming headers:', req.headers);

  const hasUnexpectedHeaders = Object.keys(req.headers).some(
    (header) => !allowedHeaders.includes(header.toLowerCase()) && !header.toLowerCase().startsWith('x-')
  );

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
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      logger.warn(`User already exists with email: ${email}`);
      return res.status(400).send({ message: "The user already exists" });
    }

    const newUser = await createUserService(req.body);
    logger.info(`User created successfully with email: ${email}`);


    // Skip SNS logic in test environment
    if (process.env.APP_ENV === 'test') {
      logger.info('Test environment detected. Skipping SNS verification.');
      return res.status(201).json(newUser); // Return response directly in test environment
    }

    // // Skip SNS logic in test environment
    // if (process.env.APP_ENV !== 'test') {
    // Publish the verification message to SNS
    const message = JSON.stringify({ email });
    const params = {
      Message: message,
      TopicArn: process.env.SNS_TOPIC_ARN,
    };

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

// Get user information
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

// Update user information
export const updateUser = async (req, res) => {
  logger.info('Received request to update user information.');
  try {
    const { first_name, last_name, password } = req.body;

    const allowedFields = ['first_name', 'last_name', 'password'];
    const invalidFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      logger.warn(`Invalid fields in update request: ${invalidFields.join(', ')}`);
      return res.status(400).json({ error: `Cannot update fields: ${invalidFields.join(', ')}` });
    }

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
