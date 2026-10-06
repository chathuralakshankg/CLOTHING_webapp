const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  updateTicketStatus
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(createTicket)
  .get(protect, authorize('developer', 'owner', 'inventory_handler', 'sales_staff'), getTickets);

router.route('/:id/status')
  .put(protect, authorize('developer', 'owner', 'inventory_handler', 'sales_staff'), updateTicketStatus);

module.exports = router;
