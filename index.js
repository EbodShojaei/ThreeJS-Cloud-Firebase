// Import the necessary modules
require('dotenv').config();
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Import your Firebase configuration
const firebaseConfig = require('./src/firebaseConfig');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./src/firebaseAuth');

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
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/firebase/', express.static(path.join(__dirname, 'node_modules/firebase')));
app.use('/src/', express.static(path.join(__dirname, '/src')));

// Set the port to 3000
const port = 3000;

// Flag to track download completion
let downloadCompleted = false;

app.get('/', (req, res) => {
  downloadCompleted = false;
  res.render('index');
});

// Generate a random UUID hash as the route
const hashedPath = `/load/${uuidv4()}`;

// Route to load the model
app.get('/load', (req, res) => {
  const referer = req.header('Referer');
  const baseUrl = `${req.protocol}://${req.get('host')}/`;

  if (downloadCompleted || referer !== baseUrl) {
    // Redirect users to the home page if download is completed
    res.redirect('/');
  } else {
    res.redirect(hashedPath);
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

      // Fetch the GLB file from the specified URL
      const glbResponse = await axios.get(downloadURL[0], {
        responseType: 'stream' // Specify the response type as stream
      });

      // Set the appropriate response headers
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="model.glb"'
      });

      // Pipe the stream directly to the response
      glbResponse.data.pipe(res);

      // Set download completion flag
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