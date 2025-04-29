const { GoogleAuth } = require('google-auth-library');
const serviceAccount = require('./config/firebase-config.json');

const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
});

auth.getAccessToken()
  .then(token => console.log('✅ Access token generated:', token))
  .catch(err => console.error('❌ JWT Error:', err));
