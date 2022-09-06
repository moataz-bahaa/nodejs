const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://moataz:328221@cluster0.nxnka7l.mongodb.net/shop?retryWrites=true&w=majority'
  )
    .then((client) => {
      _db = client.db();
      callback();
      console.log('Connected');
    })
    .catch((error) => {
      console.log(error);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No databse found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
