exports.get404 = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.status(404).render('404', {
    pageTitle: 'page not found',
    path: '/404',
    errorMessage: message
  });
};

exports.get500 = (req, res) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
  });
};