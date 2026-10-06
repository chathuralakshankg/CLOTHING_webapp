const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig');
const {
  getProducts,
  getProductById,
  getLowStockProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = multer({ storage });

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'developer', 'owner', 'inventory_handler'), upload.any(), createProduct);

router.route('/low-stock')
  .get(protect, authorize('admin', 'developer', 'owner', 'inventory_handler', 'sales_staff'), getLowStockProducts);

router.route('/:id/status')
  .patch(protect, authorize('admin', 'developer', 'owner', 'inventory_handler'), toggleProductStatus);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin', 'developer', 'owner', 'inventory_handler'), upload.any(), updateProduct)
  .delete(protect, authorize('admin', 'developer', 'owner', 'inventory_handler'), deleteProduct);

module.exports = router;
