const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requests.controller');

router.post('/', requestController.createRequest);
router.get('/', requestController.getPendingRequests);
router.put('/:id/complete', requestController.markRequestAsCompleted);
router.put('/guest/:telegramId/update-name', requestController.updateGuestName);

router.post("/checkin", requestController.checkinGuest);

router.get("/rooms", requestController.getRoomsWithPendingCount);
router.get("/rooms/:roomNumber", requestController.getRoomDetails);



module.exports = router;
