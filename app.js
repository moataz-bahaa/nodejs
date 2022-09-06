const express = require('express');
const bodyParser = require('body-parser');

const joinPath = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const { mongoConnect } = require('./util/dababase');
// const db = require('./util/dababase');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(joinPath('public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const port = process.env.PORT || 3000;

mongoConnect(() => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});

// section 10 - 9
// section 12 - 8
