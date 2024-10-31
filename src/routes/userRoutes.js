// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const authenticateBasicAuth = require('../middleware/middlewareAuthentication');

import express from 'express';
import {createUser,updateUser,getUser} from '../controllers/userController.js';
import authenticateBasicAuth from '../middleware/middlewareAuthentication.js';

const router = express.Router();

router.head('/v1/user/self', (req, res) => {
    res.status(405).send();
});

// Create a new user
router.post('/v1/user', createUser);

// Update user information
router.put('/v1/user/self', authenticateBasicAuth, updateUser);

// Get user information
router.get('/v1/user/self', authenticateBasicAuth, getUser);



// Explicitly handle PATCH, OPTIONS, and HEAD requests for /v1/user/self and return 405 Method Not Allowed
router.patch('/v1/user/self', (req, res) => {
    res.status(405).send();
});

router.options('/v1/user/self', (req, res) => {
    res.status(405).send();
});



export default router;