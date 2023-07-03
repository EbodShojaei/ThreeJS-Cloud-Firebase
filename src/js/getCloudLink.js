// Import the Firebase Admin SDK
const admin = require('firebase-admin');

// Import the Firebase configuration
const firebaseConfig = require('@config/firebaseConfig');

const serviceAccount = require('@config/firebaseAuth');

// Initialize Firebase Admin SDK with service account credentials
const getCloudLink = async (file) => { admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    ...firebaseConfig
  });

  const storage = admin.storage();
  const fileRef = storage.bucket().file(`media/${file}`);
  const downloadURL = await fileRef.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000,
  });
  
  admin.app().delete();
  return downloadURL[0];
};

module.exports = getCloudLink;