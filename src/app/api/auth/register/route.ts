import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK only if credentials are available
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) return true;

  const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
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
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!initializeFirebaseAdmin()) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const { email, password, userData } = await request.json();

    // Create user with Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: userData.full_name,
    });

    // Store additional user data in Firestore
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      username: userData.username,
      email: userRecord.email,
      role: userData.role,
      college_name: userData.college_name || '',
      full_name: userData.full_name,
      bio: userData.bio || '',
      profile_picture: userData.profile_picture || '',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      last_login: null,
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      uid: userRecord.uid,
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Registration failed',
      },
      { status: 400 }
    );
  }
}
