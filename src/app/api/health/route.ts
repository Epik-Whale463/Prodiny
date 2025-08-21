import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK only if credentials are available
let adminInitialized = false;

function initializeFirebaseAdmin() {
  if (adminInitialized || admin.apps.length > 0) {
    return true;
  }

  // Check if all required environment variables are present
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.warn('Firebase Admin not initialized. Missing environment variables:', missingVars);
    return false;
  }

  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    });

    adminInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return false;
  }
}

export async function GET() {
  try {
    const isFirebaseReady = initializeFirebaseAdmin();
    
    return NextResponse.json({ 
      status: 'API is running',
      timestamp: new Date().toISOString(),
      firebase: isFirebaseReady ? 'connected' : 'not configured',
      project: process.env.FIREBASE_PROJECT_ID || 'not configured'
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
