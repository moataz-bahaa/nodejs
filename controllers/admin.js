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
  const product = new Product(title, imageUrl, description, +price);
  product.save();
  res.redirect('/');
};

exports.postEditProduct = async(req, res) => {
  const { id, title, imageUrl, description, price } = req.body;
  const newProduct = {
    title,
    imageUrl,
    description,
    price,
  };
  const result = await Product.update(id, newProduct);
  res.redirect('/admin/products');
};

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      pageTitle: 'Admin Products',
      path: '/admin/products',
      prods: products,
    });
  });
};

exports.getEditProduct = (req, res) => {
  const editMode = req.query.editMode;
  if (!editMode) {
    return res.redirect('/404');
  }
  const id = req.params.id;

  Product.fetchProduct(id, (product) => {
    if (!product) {
      return res.redirect('/404');
    }
    res.render('admin/edit-product', {
      path: '/admin/edit-product',
      pageTitle: 'Edit Product',
      editMode,
      product,
    });
  });
};

exports.postDeleteProduct = (req, res) => {
  const id = req.body.id;
  Product.deleteById(id);
  res.redirect('/admin/products');
};
