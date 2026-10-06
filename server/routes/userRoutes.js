const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getStaff, createStaff, getCustomers, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/customers')
  .get(protect, authorize('developer', 'owner'), getCustomers);

router.route('/staff')
  .get(protect, authorize('developer', 'owner'), getStaff)
  .post(protect, authorize('developer', 'owner'), createStaff);

router.route('/:id')
  .delete(protect, authorize('developer', 'owner'), deleteUser);

module.exports = router;
