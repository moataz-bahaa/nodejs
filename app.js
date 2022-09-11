const express = require('express');
const bodyParser = require('body-parser');

const joinPath = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const mongoConnect = require('./util/dababase').mongoConnect;
const User = require('./models/User');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(joinPath('public')));

app.use((req, res, next) => {
  User.findById('631887a3650fef000dc97461')
    .then((user) => {
      req.user = new User(user.username, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const port = process.env.PORT || 3000;

mongoConnect(() => {
  app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });
});

// section 10 - 9
// section 13
