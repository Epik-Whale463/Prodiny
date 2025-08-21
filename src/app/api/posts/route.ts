import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK only if credentials are available
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) return true;

  const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
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

    const { title, content, author_id, subgroup_id } = await request.json();

    const db = admin.firestore();
    
    // Create new post
    const postRef = await db.collection('posts').add({
      title,
      content,
      author_id,
      subgroup_id: subgroup_id || null,
      votes: 0,
      comment_count: 0,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const post = await postRef.get();
    
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        ...post.data(),
      },
    });

  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create post',
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!initializeFirebaseAdmin()) {
      // Return mock data if Firebase not configured
      return NextResponse.json({
        success: true,
        posts: []
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const subgroup_id = searchParams.get('subgroup_id');

    const db = admin.firestore();
    let query = db.collection('posts').orderBy('created_at', 'desc').limit(limit);

    if (subgroup_id) {
      query = query.where('subgroup_id', '==', subgroup_id);
    }

    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      posts,
    });

  } catch (error: any) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      {
        success: true,
        posts: []
      }
    );
  }
}
