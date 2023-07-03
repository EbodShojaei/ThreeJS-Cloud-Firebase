const { v4: uuidv4 } = require('uuid');
const { router } = require('@config/dependencies');
const getCloudLink = require('@js/getCloudLink');
const getModel = require('@js/getModel');
const deleteRoute = require('@js/deleteRoute');

const sendLoad = () => {
  const hashedPaths = []; // Track the generated hashed paths

  router.get('/load', (req, res) => {
    let downloadCompleted = false;
    const referer = req.header('Referer');
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    console.log('Loading the model...');

    if (!downloadCompleted && referer === baseUrl && req.originalUrl === '/load') {
      // Generate a random UUID hash as the route
      const hashedPath = `/load/${uuidv4()}`;

      // Store the hashed path in the array
      hashedPaths.push(hashedPath);

      // Route handler for the hashed path
      router.get(hashedPath, async (req, res) => {
        const referer = req.header('Referer');
        const baseUrl = `${req.protocol}://${req.get('host')}/`;

        try {
          if (!downloadCompleted && referer === baseUrl && req.originalUrl === hashedPath) {
            const downloadURL = await getCloudLink('model.glb');
            getModel(downloadURL, res);
            downloadCompleted = true;
          } else {
            // Handle unauthorized access to the hashed path
            res.status(403).redirect('/');
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to load the model.' });
        } finally {
          // Delete loaded routes
          deleteRoute(router, hashedPath);
          deleteRoute(router, '/load');
        };
      });

      // Send the download URL to the client
      res.json({ url: hashedPath });
    } else {
      // Redirect users to the home page if download is completed
      res.redirect('/');
      console.log('Redirecting to the home page');
    }
  });

  return router;
};

module.exports = sendLoad;
