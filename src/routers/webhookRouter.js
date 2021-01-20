const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

// Defining routes
router.get('/', webhookController.getWebhook);
router.post('/', webhookController.postWebhook);

module.exports = router;