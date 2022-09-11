const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        prods: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res) => {
  const { id } = req.params;
  Product.fetchProduct(id)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: 'Product Detail',
        path: '/products',
        product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        pageTitle: 'Shop',
        path: '/',
        prods: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res) => {
  req.user
    .getCart()
    .then((products) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Cart',
        orders,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.checkout = (req, res) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};

exports.postCart = (req, res) => {
  const productId = req.body.productId;
  const user = req.user;
  Product.fetchProduct(productId)
    .then((product) => {
      user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProductFromCart = (req, res) => {
  const productId = req.body.id;
  req.user
    .deleteFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res) => {
  req.user
    .addOrder()
    .then((result) => {
      res.redirect('/orders');
    })
    .catch((err) => {
      console.log(err);
    });
};
