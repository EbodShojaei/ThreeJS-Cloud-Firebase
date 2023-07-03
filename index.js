// Import the necessary modules
require('dotenv').config();
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { PassThrough } = require('stream');

// Define the router
let router;
const deleteRoute = require('./src/js/deleteRoute');

// Import your Firebase configuration
const firebaseConfig = require('./src/config/firebaseConfig');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./src/config/firebaseAuth');

// Enable ejs middleware.
app.set('view engine', 'ejs');

// Set up CORS middleware
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/public/', express.static(path.join(__dirname, 'public')));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/firebase/', express.static(path.join(__dirname, 'node_modules/firebase')));
app.use('/src/', express.static(path.join(__dirname, '/src')));

// Handles dynamic routing
app.use((req, res, next) => {
  if (router) {
    // If the router is defined, use it to handle the request
    router(req, res, next);
  } else {
    // If the router is not defined, use the main app to handle the request
    app.handle(req, res, next);
  }
});

// Set the port to 3000
const port = 3020;

// Create a new router
router = express.Router();

router.get('/', (req, res) => {
  downloadCompleted = false;
  getLoad();
  res.render('index');
});

const getLoad = () => {
  router.get('/load', (req, res) => {
    const referer = req.header('Referer');
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    console.log('Loading the model...');

    if (!downloadCompleted && referer === baseUrl && req.originalUrl === '/load') {
      // Generate a random UUID hash as the route
      const hashedPath = `/load/${uuidv4()}`;

      // Route handler for the hashed path
      router.get(hashedPath, async (req, res) => {
        const referer = req.header('Referer');
        const baseUrl = `${req.protocol}://${req.get('host')}/`;

        try {
          if (!downloadCompleted && referer === baseUrl && req.originalUrl === hashedPath) {
            // Initialize Firebase Admin SDK
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
              ...firebaseConfig
            });

            const storage = admin.storage();
            const fileRef = storage.bucket().file('media/model.glb');
            const downloadURL = await fileRef.getSignedUrl({
              action: 'read',
              expires: Date.now() + 1000,
            });

            axios.get(downloadURL, { responseType: 'arraybuffer' })
              .then(response => {
                console.log('Sending cloud model...')
                const fileData = response.data;

                res.setHeader('Content-Length', fileData.byteLength); 
                const stream = new PassThrough();
                stream.end(fileData);
                stream.pipe(res);

                downloadCompleted = true;
                admin.app().delete();
              })
              .catch(error => {
                console.error(error);

                console.log('Sending local model...');
                const glbFilePath = 'src/model/model.glb';
                const stream = fs.createReadStream(glbFilePath);
                const stat = fs.statSync(glbFilePath);
            
                res.setHeader('Content-Length', stat.size);
                stream.pipe(res);

                downloadCompleted = true;
                admin.app().delete();
              });
          } else {
            // Handle unauthorized access to the hashed path
            res.status(403).redirect('/');
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to load the model.' });
        }

        // Delete the route after the response is sent
        deleteRoute(router, hashedPath);
        deleteRoute(router, '/load');
      });

      // Send the download URL to the client
      res.json({ url: hashedPath });
    } else {
      // Redirect users to the home page if download is completed
      res.redirect('/');
      console.log('Redirecting to the home page');
    }
  });
}

// Start the server
app.listen(port, () => console.log(`App listening on port ${port}!`));
