import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import profilePicRoutes from './routes/profilePicRoutes.js';
import sequelize from './db/sequelize.js';
import logger from './utils/logger.js';
import { verifyUser } from './controllers/verifyController.js';

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to set response headers
const setResponseHeaders = (res) => {
    res.header({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
    });
};

// Connect to the database
const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database connected successfully.");
    } catch (error) {
        logger.error(`Database connection error: ${error.message}`);
    }
};

// Initialize the database connection
connectToDatabase();

// Health check route
app.all("/healthz", async (req, res) => {
    try {
        if (req.method !== 'GET') {
            setResponseHeaders(res);
            logger.warn(`Health check failed: Method ${req.method} not allowed`);
            return res.status(405).send();
        }

        if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
            setResponseHeaders(res);
            logger.warn("Health check failed: Payload should be empty");
            return res.status(400).send();
        }

        setResponseHeaders(res);
        logger.info("Health check successful");
        res.status(200).send();
    } catch (error) {
        setResponseHeaders(res);
        logger.error(`Health check error: ${error.message}`);
        res.status(503).send();
    }
});

// Health check route
app.all("/cicd", async (req, res) => {
    try {
        if (req.method !== 'GET') {
            setResponseHeaders(res);
            logger.warn(`Health check failed: Method ${req.method} not allowed`);
            return res.status(405).send();
        }

        if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
            setResponseHeaders(res);
            logger.warn("Health check failed: Payload should be empty");
            return res.status(400).send();
        }

        setResponseHeaders(res);
        logger.info("Health check successful");
        res.status(200).send();
    } catch (error) {
        setResponseHeaders(res);
        logger.error(`Health check error: ${error.message}`);
        res.status(503).send();
    }
});

// User-related routes
app.use('/', userRoutes);

// Profile picture routes for authenticated users
app.use('/v1/user/self', profilePicRoutes);

app.all('/verify', verifyUser);

// Error handling middleware for logging
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

// Gracefully shut down the server on termination signal
process.on("SIGINT", () => {
    logger.info("Server terminated.");
    process.exit();
});

export default app;
