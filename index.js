// Import the necessary modules
const admin = require('firebase-admin');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');
const { initializeApp } = require('firebase/app');
const express = require('express');
const app = express();
const path = require('path');
const cors = require("cors");

// Import your Firebase configuration
const firebaseConfig = require('./firebaseConfig.json');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./firebaseAuth.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ...firebaseConfig
});

// Set up CORS middleware
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/firebase/', express.static(path.join(__dirname, 'node_modules/firebase')));

// Set the port to 3000
const port = 3000;

app.get('/', (req, res) => res.sendFile('/public/index.html'));

// Route to load the model
app.get('/model', async (req, res) => {
  try {
    const storage = admin.storage();
    const fileRef = storage.bucket().file('media/model.glb');
    const downloadURL = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 30 * 1000,
    });
    res.json({ url: downloadURL[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load the model.' });
  }
});

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
