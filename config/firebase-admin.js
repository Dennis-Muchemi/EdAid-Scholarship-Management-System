const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const firebaseAdminConfig = {
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
};

module.exports = firebaseAdminConfig;