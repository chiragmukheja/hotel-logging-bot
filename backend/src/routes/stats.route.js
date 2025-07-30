const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');


router.get('/dashboard', statsController.getDashboardStats);

module.exports = router;