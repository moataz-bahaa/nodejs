const fs = require('fs');
const joinPath = require('../util/path');

const p = joinPath('data', 'cart.json');

const getCartFromFile = (cb) => {
  fs.readFile(p, (error, data) => {
    if (error) {
      return;
    }
    cb(JSON.parse(data));
  });
};

module.exports = class Cart {
  static addToCart(id, productPrice) {
    // fetch the previous cart
    fs.readFile(p, (error, data) => {
      let cart = {
        products: [],
        totalPrice: 0,
      };
      if (!error) {
        cart = JSON.parse(data);
      }

      let product = cart.products.find((prod) => prod.id === id);
      if (product) {
        product.quantity++;
      } else {
        product = {
          id,
          quantity: 1,
        };
        cart.products.push(product);
      }
      cart.totalPrice += productPrice;

      fs.writeFile(p, JSON.stringify(cart), (error) => {
        console.log(error);
      });
    });
  }

  static deleteProduct(id) {
    getCartFromFile((cart) => {
      const product = cart.products.find((p) => p.id === id);
      if (product) {
        cart.totalPrice -= product.price * product.quantity;
        cart.products = cart.products.filter((p) => p.id !== id);
        fs.writeFile(p, JSON.stringify(cart), (error) => {
          console.log(error);
        });
      }
    });
  }

  static fetchAllCartProducts(cb) {
    getCartFromFile((cart) => {
      cb(cart);
    });
  }
};
