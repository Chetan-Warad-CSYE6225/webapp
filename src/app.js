const express = require("express");
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(express.json());

const setResponseHeaders = (res) => {
    res.header({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
    });
};

const disallowMethods = (req, res, next) => {
    // For request methods that are not allowed
    if (["PUT", "POST", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(req.method)) {
        setResponseHeaders(res);
        res.status(405).send(); // Method Not Allowed
        return;
    }
    next();
};
app.use(disallowMethods);

app.get("/healthz", disallowMethods, async (req, res) => {
    try {
        console.log("Received request on /healthz");

        // Check for unexpected query parameters
        if (Object.keys(req.query).length > 0 || Object.keys(req.body).length > 0 ) {
            console.warn("Query parameters are not allowed on /healthz");
            setResponseHeaders(res);
            return res.status(400).send(); // Bad Request
        }

        // Create a new Sequelize instance on every request
        const sequelize = new Sequelize({
            database: process.env.DB_DATABASE,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: "postgres",
            logging: console.log // Enable Sequelize logging
        });

        console.log("Attempting to connect to the PostgreSQL database...");

        // Attempt to authenticate with PostgreSQL
        await sequelize.authenticate();

        console.log("Database connection successful.");

        // Close the connection after use
        await sequelize.close();
        console.log("Database connection closed.");

        // Send 200 OK if connection is successful
        setResponseHeaders(res);
        res.status(200).send(); // OK
    } catch (error) {
        // Log the error and send 503 if unable to connect
        console.error("Unable to connect to the database:", error.message);

        setResponseHeaders(res);
        res.status(503).send({
            error: "Service Unavailable. Unable to connect to the database.",
        });
    }
});

const PORT = process.env.SERVER_PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
    console.log("Server terminated.");
    process.exit();
});
