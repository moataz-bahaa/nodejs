const ObjectId = require('mongodb').ObjectId;

const { getDb } = require('../util/dababase');

module.exports = class Product {
  constructor(title, imageUrl, description, price, userId) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    return db.collection('products').insertOne(this);
  }

  static update(id, newProduct) {
    const db = getDb();
    return db.collection('products').updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          ...newProduct,
        },
      }
    );
  }

  static deleteById(id) {
    const db = getDb();
    return db.collection('products').deleteOne({ _id: new ObjectId(id) });
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products').find().toArray();
  }

  static fetchProduct(id) {
    const db = getDb();
    return db
      .collection('products')
      .findOne({ _id: new ObjectId(id) });
  }
};
