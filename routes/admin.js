const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { productValidator } = require('../validations/validator');

const router = express.Router();
// admin/
router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/edit-product/:id', isAuth, adminController.getEditProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', productValidator, adminController.postAddProduct);

router.post('/edit-product', productValidator, adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
