import express from 'express';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import userRoutes from './routes/userRoutes.js';
import sequelize from './db/sequelize.js';



const app = express();

// const express = require('express');
// const app = express();
// const dotenv = require('dotenv');
// const { Sequelize } = require('sequelize');

// Load environment variables from .env file
dotenv.config();

// Middleware to parse JSON requests
app.use(express.json());

const setResponseHeaders = (res) => {
    res.header({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
    });
};

const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        
        // Sync the database models here if needed
    } catch (error) {
        // Handle error appropriately
    }
};

// Call the database connection function when the application starts
connectToDatabase();

app.all("/healthz", async (req, res) => {
    try {
        if (req.method !== 'GET') {
            // return 405 Method Not Allowed for other req method
            setResponseHeaders(res);
            return res.status(405).send();
        }
        //If the request has payload
        if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
            setResponseHeaders(res);
            res.status(400).send();
        } else {
        
            setResponseHeaders(res);
            res.status(200).send();
        }}
    catch (error) {
        //IF the database is disconnected
        setResponseHeaders(res);
        res.status(503).send();
    }});

    //const userRoutes = require("./routes/userRoutes");
app.use('/', userRoutes);

const port = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("SIGINT", () => {
    // clearInterval(interval); 
    console.log("Server terminated. Interval cleared.");
    process.exit();
});

export default app;
