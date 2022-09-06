const fs = require('fs');
const mongodb = require('mongodb');

const joinPath = require('../util/path');
const Cart = require('./cart');
const { getDb } = require('../util/dababase');

const p = joinPath('data', 'db.json');

const getProductsFromFile = (cb) => {
  fs.readFile(p, (error, data) => {
    if (error) {
      return cb([]);
    }
    cb(JSON.parse(data));
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    // this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    //#region using files
    // getProductsFromFile((products) => {
    //   if (this.id) {
    //     const index = products.findIndex((p) => p.id === this.id);
    //     products[index] = this;
    //   } else {
    //     this.id = Math.random().toString();
    //     products.push(this);
    //   }
    //   fs.writeFile(p, JSON.stringify(products), (error) => {
    //     console.log(error);
    //   });
    // });
    //#endregion

    //#region using mongodb
    const db = getDb();
    return db
      .collection('products')
      .insertOne(this)
      .then((result) => {
        console.log('product saved:', result);
      })
      .catch((error) => {
        console.log(error);
      });
    //#endregion
  }

  static async deleteById(id) {
    //#region using files

    // getProductsFromFile((products) => {
    //   const newProducts = products.filter((p) => p.id !== id);
    //   fs.writeFile(p, JSON.stringify(newProducts), (error) => {
    //     if (!error) {
    //       // delete from cart
    //       Cart.deleteProduct(id);
    //     }
    //   });
    // });

    //#endregion

    //#region using mongodb

    try {
      const db = getDb();
      const result = await db
        .collection('products')
        .deleteOne({ _id: new mongodb.ObjectId(id) });
        return result;
    } catch (error) {
      console.log(error);
    }

    //#endregion
  }

  static async fetchAll(cb) {
    // using files
    // getProductsFromFile(cb);

    //#region using mongodb
    const db = getDb();
    const products = await db.collection('products').find().toArray();
    cb(products);
    //#endregion
  }

  static async fetchProduct(id, cb) {
    //#region using files

    // getProductsFromFile((products) => {
    //   const product = products.find((p) => p.id === id);
    //   cb(product);
    // });

    //#endregion

    //#region using mongodb

    const db = getDb();
    const product = await db
      .collection('products')
      .find({ _id: new mongodb.ObjectId(id) })
      .next();
    cb(product);

    //#endregion
  }
};
