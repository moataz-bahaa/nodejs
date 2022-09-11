const ObjectId = require('mongodb').ObjectId;
const { getDb } = require('../util/dababase');

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart; // {itesm: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProduct = this.cart.items.find(
      (p) => p.productId.toString() === product._id.toString()
    );
    if (cartProduct) {
      cartProduct.quantity += 1;
    } else {
      this.cart.items.push({
        productId: new ObjectId(product._id),
        quantity: 1,
      });
    }
    const db = getDb();
    return db.collection('users').updateOne(
      {
        _id: ObjectId(this._id),
      },
      {
        $set: {
          cart: this.cart,
        },
      }
    );
  }

  deleteFromCart(productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db.collection('users').updateOne(
      {
        _id: ObjectId(this._id),
      },
      {
        $set: {
          cart: {
            items: updatedCartItems,
          },
        },
      }
    );
  }

  getCart() {
    const db = getDb();
    const productsIds = this.cart.items.map((p) => p.productId);
    return db
      .collection('products')
      .find({ _id: { $in: productsIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.username,
          },
        };
        return db.collection('orders').insertOne(order);
      })
      .then((result) => {
        this.cart = {
          items: [],
        };
        return db.collection('users').updateOne(
          {
            _id: ObjectId(this._id),
          },
          {
            $set: {
              cart: this.cart,
            },
          }
        );
      });
  }

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users').findOne({ _id: new ObjectId(userId) });
  }
}

module.exports = User;
