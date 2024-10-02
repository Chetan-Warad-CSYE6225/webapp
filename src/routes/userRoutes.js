const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateBasicAuth = require('../middleware/middlewareAuthentication');


router.head('/v1/user/self', (req, res) => {
    res.status(405).send();
});

// Create a new user
router.post('/v1/user', userController.createUser);

// Update user information
router.put('/v1/user/self', authenticateBasicAuth, userController.updateUser);

// Get user information
router.get('/v1/user/self', authenticateBasicAuth, userController.getUser);



// Explicitly handle PATCH, OPTIONS, and HEAD requests for /v1/user/self and return 405 Method Not Allowed
router.patch('/v1/user/self', (req, res) => {
    res.status(405).send();
});

router.options('/v1/user/self', (req, res) => {
    res.status(405).send();
});

router.delete('/v1/user/self', (req, res) => {
    res.status(405).send();
});




module.exports = router;