const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requests.controller');
const authMiddleware = require('../middleware/auth.middleware');

// --- Guest-initiated routes (from Telegram/n8n) ---
router.post('/checkin', requestController.checkinGuest);
router.post('/', requestController.createRequest);
router.put('/checkout', requestController.checkoutGuest);


// --- Admin Dashboard data routes ---
router.get('/rooms',  authMiddleware,  requestController.getRoomsWithPendingCount);
router.get('/rooms/:stayId',  authMiddleware,  requestController.getRoomDetails);
router.get('/',  authMiddleware,  requestController.getAllRequests);
router.put('/:id/complete',  authMiddleware,  requestController.markRequestAsCompleted);
router.put('/guest/:telegramId/update-name',  authMiddleware,  requestController.updateGuestName);


// --- New Admin-specific control routes ---
router.put('/admin/stays/:stayId/checkout',  authMiddleware,  requestController.adminCheckoutStay);
router.put('/admin/stays/:stayId/transfer',  authMiddleware,  requestController.adminTransferStay);


module.exports = router;