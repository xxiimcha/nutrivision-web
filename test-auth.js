require('dotenv').config();

const { GoogleAuth } = require('google-auth-library');

// Load and decode the base64-encoded service account from an environment variable or file
const fs = require('fs');

// Option 1: From environment variable (recommended for deployment)
const base64String = process.env.FIREBASE_BASE64;

// Option 2: From a file (e.g., 'firebase-base64.txt')
// const base64String = fs.readFileSync('firebase-base64.txt', 'utf8');

const decoded = Buffer.from(base64String, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(decoded);

// Set up GoogleAuth with decoded credentials
const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
});

// Get access token
auth.getAccessToken()
  .then(token => console.log('✅ Access token generated:', token))
  .catch(err => console.error('❌ JWT Error:', err));
