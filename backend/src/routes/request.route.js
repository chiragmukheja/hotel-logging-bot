const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requests.controller');

// Request-related routes
router.post('/', requestController.createRequest);
router.put('/:id/complete', requestController.markRequestAsCompleted);

// Guest-related routes
router.put('/guest/:telegramId/update-name', requestController.updateGuestName);
router.post('/checkin', requestController.checkinGuest);

// Dashboard room views (based on Stay IDs)
router.get('/rooms', requestController.getRoomsWithPendingCount);
router.get('/rooms/:stayId', requestController.getRoomDetails);

module.exports = router;
