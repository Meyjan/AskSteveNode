const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

// Defining routes
router.get('/customer/:id', messageController.getMessagesByCustomerId);
router.get('/:id', messageController.getMessageById);
router.get('/', messageController.getMessages);
router.delete('/:id', messageController.deleteMessageById);

module.exports = router;