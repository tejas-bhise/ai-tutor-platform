const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Routes
router.post('/generate', aiController.generateResponse);
router.get('/health', aiController.healthCheck);
router.get('/tutors', aiController.getTutors);

module.exports = router;
