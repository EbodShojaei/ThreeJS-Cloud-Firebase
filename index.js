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

// Import your Firebase configuration
const firebaseConfig = require('./src/config/firebaseConfig');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./src/config/firebaseAuth');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ...firebaseConfig
});

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

// Set the port to 3000
const port = 3020;

// Flag to track download completion
let downloadCompleted = false;

app.get('/', (req, res) => {
  downloadCompleted = false;
  res.render('index');
});

// Generate a random UUID hash as the route
const hashedPath = `/load/${uuidv4()}`;
const hashedRetry = `/load/${uuidv4()}`;

console.log('hashedPath: ', hashedPath);
console.log('hashedRetry: ', hashedRetry);

// Route to load the model
app.get('/load', (req, res) => {
  const referer = req.header('Referer');
  const baseUrl = `${req.protocol}://${req.get('host')}/`;

  console.log('Loading the model...');

  if (downloadCompleted || referer !== baseUrl) {
    // Redirect users to the home page if download is completed
    res.redirect('/');
    console.log('Redirecting to the home page')
  } else {
    res.redirect(hashedPath);
    console.log('Redirecting to the hashed path')
  }
});

// Route handler for the hashed path
app.get(hashedPath, async (req, res) => {
  const referer = req.header('Referer');
  const baseUrl = `${req.protocol}://${req.get('host')}/`;

  try {
    if (!downloadCompleted && referer === baseUrl && req.originalUrl === hashedPath) {
      const storage = admin.storage();
      const fileRef = storage.bucket().file('media/model.glb');
      const downloadURL = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 10000,
      });

      axios.head(downloadURL)
        .then(response => {
          const statusCode = response.status;
          console.log('statusCode: ', statusCode);
          if (statusCode === 429) {
            console.log('Error 429: Too Many Requests');

            // Redirect to the server file if the download limit is exceeded
            res.json({ url: hashedRetry });

          } else {
            console.log('URL is accessible');

            // Send the download URL to the client
            res.json({ url: downloadURL[0] });
            downloadCompleted = true;
          }
        })
    } else {
      // Handle unauthorized access to the hashed path
      res.status(403).redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load the model.' });
  }
});

// Route handler for the hashed path
app.get(hashedRetry, async (req, res) => {
  const referer = req.header('Referer');
  const baseUrl = `${req.protocol}://${req.get('host')}/`;

  try {
    if (!downloadCompleted && referer === baseUrl && req.originalUrl === hashedRetry) {
      // Path to your GLB file
      const glbFilePath = 'src/model/model.glb';

      // Send the GLB file to the client
      const glbFile = fs.readFileSync(glbFilePath);
      res.send(glbFile);

      downloadCompleted = true;
    } else {
      // Handle unauthorized access to the hashed path
      res.status(403).redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load the model.' });
  }
});

// Start the server
app.listen(port, () => console.log(`App listening on port ${port}!`));