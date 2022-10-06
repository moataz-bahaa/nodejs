const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const joinPath = require('../util/path');

const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
  const { page } = req.query;
  try {
    const numberOfProducts = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render('shop/product-list', {
      pageTitle: 'All Products',
      path: '/products',
      prods: products,
      currentPage: page || 1,
      numberOfPages: Math.ceil(numberOfProducts / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = (req, res) => {
  const { id } = req.params;
  Product.findById(id)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: 'Product Detail',
        path: '/products',
        product,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = async (req, res) => {
  const { page } = req.query;
  try {
    const numberOfProducts = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render('shop/index', {
      pageTitle: 'Shop',
      path: '/',
      prods: products,
      currentPage: page || 1,
      numberOfPages: Math.ceil(numberOfProducts / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.checkout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProductFromCart = (req, res, next) => {
  const productId = req.body.id;
  req.user
    .removeFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      // console.log({orders});
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Cart',
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId');
    const products = user.cart.items;
    let totalPrice = 0;
    products.forEach((p) => {
      totalPrice += p.productId.price * p.quantity;
    });
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout',
      products,
      totalPrice,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postOrder = (req, res) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc },
        };
      });
      const order = new Order({
        user: {
          email: req.user.username,
          userId: req.user,
        },
        products,
      });

      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.redirect('/404');
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/404');
    }
    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = joinPath('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', {
      underline: true,
      align: 'center',
    });
    pdfDoc.text('-------------------');
    let totalPrice = 0;
    order.products.forEach((product) => {
      totalPrice += product.quantity * product.product.price;
      pdfDoc
        .fontSize(16)
        .text(
          `${product.product.title} - ${product.quantity} x $${product.product.price}`
        );
    });
    pdfDoc.text('------');
    pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`);

    pdfDoc.end();
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   res.send(data);
    // });

    // streaming file
    // const file = fs.createReadStream(invoicePath);
    // file.pipe(res);
  } catch (err) {
    return next(err);
  }
};
