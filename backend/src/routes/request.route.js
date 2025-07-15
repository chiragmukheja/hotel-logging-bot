const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requests.controller');

router.post('/', requestController.createRequest);
router.get('/', requestController.getPendingRequests);
router.put('/:id/complete', requestController.markRequestAsCompleted);

router.post("/checkin", requestController.checkinGuest);


module.exports = router;
