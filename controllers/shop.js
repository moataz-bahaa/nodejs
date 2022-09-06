const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      pageTitle: 'All Products',
      path: '/products',
      prods: products,
    });
  });
};

exports.getProduct = (req, res) => {
  const { id } = req.params;
  Product.fetchProduct(id, (product) => {
    res.render('shop/product-detail', {
      pageTitle: 'Product Detail',
      path: '/products',
      product,
    });
  });
};

exports.getIndex = (req, res) => {
  Product.fetchAll((products) => {
    res.render('shop/index', {
      pageTitle: 'Shop',
      path: '/',
      prods: products,
    });
  });
};

exports.getCart = (req, res) => {
  Cart.fetchAllCartProducts((cart) => {
    Product.fetchAll((products) => {
      const productsWithDetails = cart.products.map((product) => {
        const x = products.find((p) => p.id === product.id);
        return {
          ...x,
          ...product
        }
      });
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: productsWithDetails,
        totalPrice: cart.totalPrice,
      });
    });
  });
};

exports.getOrders = (req, res) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Cart',
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
  Product.fetchProduct(productId, (product) => {
    Cart.addToCart(product.id, product.price);
    res.redirect('/cart');
  });
};

exports.postDeleteProductFromCart = (req, res) => {
  const id = req.body.id;
  Cart.deleteProduct(id);
  res.redirect('/cart');
};
