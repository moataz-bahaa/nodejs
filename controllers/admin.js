const { validationResult } = require('express-validator');

const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editMode: false,
    product: {},
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editMode: false,
      product: { title, price, description },
      errorMessage: 'Attacked file is not an image',
      validationErrors: [],
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let message = '';
    for (let msg of errors.array()) {
      message += msg.msg + ', ';
    }
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editMode: false,
      product: { title, price, description },
      errorMessage: message,
      validationErrors: errors.array(),
    });
  }
  const imageUrl = image.path;
  const product = new Product({
    title,
    price: +price,
    imageUrl,
    description,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      res.redirect('/');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, description, price } = req.body;
  const image = req.file;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let message = '';
    for (let msg of errors.array()) {
      message += msg.msg + ', ';
    }
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editMode: true,
      product: { _id: id, title, price, description },
      errorMessage: message,
      validationErrors: errors.array(),
    });
  }
  Product.findById(id)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        req.flash('error', `you don't have permision to edit this product`);
        return res.redirect('/404');
      }
      product.title = title;
      product.description = description;
      product.price = price;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then((result) => {
        res.redirect('/admin/products');
      });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price -_id') // include title, price and exclude _id
    // .populate('userId', 'username') // like join in SQL
    .then((products) => {
      // console.log(products);
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        prods: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.editMode;
  if (!editMode) {
    return res.redirect('/404');
  }
  const id = req.params.id;
  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect('/404');
      }
      if (product.userId.toString() !== req.user._id.toString()) {
        req.flash('error', `you don't have permision to edit this product`);
        return res.redirect('/404');
      }
      res.render('admin/edit-product', {
        path: '/admin/edit-product',
        pageTitle: 'Edit Product',
        editMode,
        product,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = async (req, res, next) => {
  console.log('Hello there');
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }
    fileHelper.deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: id, userId: req.user._id });
    res.status(200).json({
      message: 'Success!'
    });
  } catch (err) {
    res.status(500).json({
      message: 'Deleting product failed.'
    });
  }
};
