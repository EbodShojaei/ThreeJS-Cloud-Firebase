const { v4: uuidv4 } = require('uuid');
const { router } = require('@config/dependencies');
const getCloudLink = require('@js/getCloudLink');
const getModel = require('@js/getModel');
const limiter = require('@middleware/rateLimit');
const checkSession = require('@middleware/checkSession');

const pathMap = {};

const sendLoad = () => {
  router.get('/load', checkSession, limiter, async (req, res) => {
    if (req.session.init && !req.session.isDownloaded) {
      const hash = uuidv4();
      pathMap[hash] = true;
      res.json({ url: `/load/${hash}` });
    } else {
      console.log('Redirecting to the home page');
      res.redirect('/');
    }
  });

  router.get('/load/:hash', checkSession, limiter, async (req, res) => {
    const hash = req.params.hash;

    if (pathMap[hash] && req.session.init) {
      try {
        const downloadURL = await getCloudLink('model.glb');
        await getModel(downloadURL, res);
        req.session.isDownloaded = 'true';
        delete pathMap[hash];
      } catch (error) {
        console.error(error);
        res.render('error', { statusCode: 500, errorMessage: 'Internal Server Error. Model load failed.' });
      }
    } else {
      console.log('Unauthorized access to the hashed path');
      res.status(403).redirect('/');
    }
  });

  return router;
};

module.exports = sendLoad;
