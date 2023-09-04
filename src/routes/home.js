const { router } = require('@config/dependencies');
const sendLoad = require('@routes/api/sendLoad');
const checkSession = require('@middleware/checkSession');

router.get('/', checkSession, (req, res) => {
  req.session.init = true;

  if (req.session.isDownloaded) {
    req.session.isDownloaded = false;
  }

  try {
    // console.log('Sending house load...');
    sendLoad();
    return res.render('index');
  } catch (error) {
    console.error(error);
    return res.render('error', { statusCode: 500, errorMessage: 'Internal Server Error. Session load failed.' });
  }
});

module.exports = router;