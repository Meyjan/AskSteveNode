const express = require('express');
const homeController = require('../controllers/homeController');

const router = express.Router();

// Defining routes
router.get('/hello', homeController.hello);
router.get('/', homeController.home);

module.exports = router;