const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editMode: false,
    product: {},
  });
};

exports.postAddProduct = (req, res) => {
  const { title, price, imageUrl, description } = req.body;
  const product = new Product(title, imageUrl, description, +price, req.user._id);
  product
    .save()
    .then((result) => {
      // console.log(result);
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res) => {
  const { id, title, imageUrl, description, price } = req.body;
  const newProduct = {
    title,
    imageUrl,
    description,
    price,
  };
  Product.update(id, newProduct)
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res) => {
  Product.fetchAll()
    .then((products) => {
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
  Product.fetchProduct(id)
    .then((product) => {
      if (!product) {
        return res.redirect('/404');
      }
      res.render('admin/edit-product', {
        path: '/admin/edit-product',
        pageTitle: 'Edit Product',
        editMode,
        product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res) => {
  const id = req.body.id;
  Product.deleteById(id)
    .then((result) => {
      console.log(result);
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};
