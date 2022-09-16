const Product = require('../models/product');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editMode: false,
    product: {},
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res) => {
  const { title, price, imageUrl, description, id } = req.body;
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
      product: { title, price, imageUrl, description },
      errorMessage: message,
      validationErrors: errors.array(),
    });
  }
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
      console.log(err);
    });
};

exports.postEditProduct = (req, res) => {
  const { id, title, imageUrl, description, price } = req.body;
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
      product: { _id: id, title, price, imageUrl, description },
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
      product.imageUrl = imageUrl;
      product.description = description;
      product.price = price;
      return product.save().then((result) => {
        res.redirect('/admin/products');
      });
    })

    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res) => {
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
      console.log(err);
    });
};

exports.getEditProduct = (req, res) => {
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
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res) => {
  const id = req.body.id;
  Product.deleteOne({ _id: id, userId: req.user._id })
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};
