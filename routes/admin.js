const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// admin/
router.get('/add-product', adminController.getAddProduct);

router.get('/edit-product/:id', adminController.getEditProduct);

router.get('/products', adminController.getProducts);

router.post('/add-product', adminController.postAddProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
