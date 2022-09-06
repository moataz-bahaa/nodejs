const mongodb = require('mongodb');

const { getDb } = require('../util/dababase');


module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
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
  }

  static async update(id, newProduct) {
    const db = getDb();
    const result = await db.collection('products').updateOne(
      {
        _id: new mongodb.ObjectId(id),
      },
      {
        $set: {
          ...newProduct,
        },
      }
    );
    console.log(result);
    return result;
  }

  static async deleteById(id) {
    try {
      const db = getDb();
      const result = await db
        .collection('products')
        .deleteOne({ _id: new mongodb.ObjectId(id) });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async fetchAll(cb) {
    const db = getDb();
    const products = await db.collection('products').find().toArray();
    cb(products);
  }

  static async fetchProduct(id, cb) {
    const db = getDb();
    const product = await db
      .collection('products')
      .find({ _id: new mongodb.ObjectId(id) })
      .next();
    cb(product);
  }
};
