import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { db, auth } from './firebase-config.js';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'https://prodiny-frontend.onrender.com'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Prodiny Firebase Backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Prodiny Firebase API is running', 
    status: 'healthy',
    version: '2.0.0'
  });
});

// Auth endpoints
app.post('/register', async (req, res) => {
  try {
    const { email, password, name, college_name, is_student } = req.body;
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    const userDoc = await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: user.email,
      name: name || '',
      college_name: college_name || '',
      is_student: is_student || true,
      created_at: new Date().toISOString(),
      profile_completed: false
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userDoc.id,
        uid: user.uid,
        email: user.email,
        name: name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
    const userSnapshot = await getDocs(userQuery);
    
    let userData = { email: user.email, uid: user.uid };
    if (!userSnapshot.empty) {
      userData = { ...userData, ...userSnapshot.docs[0].data() };
    }
    
    res.json({
      message: 'Login successful',
      user: userData,
      access_token: await user.getIdToken()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: 'Login failed',
      details: error.message
    });
  }
});

app.post('/logout', async (req, res) => {
  try {
    await signOut(auth);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      details: error.message
    });
  }
});

// Posts endpoints
app.get('/posts', async (req, res) => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('created_at', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(postsQuery);
    
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      error: 'Failed to fetch posts',
      details: error.message
    });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const { title, content, author_id, author_name, type, tags } = req.body;
    
    const postDoc = await addDoc(collection(db, 'posts'), {
      title: title || '',
      content: content || '',
      author_id: author_id || '',
      author_name: author_name || '',
      type: type || 'general',
      tags: tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      comments_count: 0
    });
    
    res.status(201).json({
      message: 'Post created successfully',
      post_id: postDoc.id
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      error: 'Failed to create post',
      details: error.message
    });
  }
});

// Projects endpoints
app.get('/projects', async (req, res) => {
  try {
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('created_at', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(projectsQuery);
    
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      details: error.message
    });
  }
});

app.post('/projects', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      technologies, 
      difficulty, 
      max_participants, 
      creator_id,
      creator_name 
    } = req.body;
    
    const projectDoc = await addDoc(collection(db, 'projects'), {
      title: title || '',
      description: description || '',
      technologies: technologies || [],
      difficulty: difficulty || 'intermediate',
      max_participants: max_participants || 5,
      creator_id: creator_id || '',
      creator_name: creator_name || '',
      participants: [],
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    res.status(201).json({
      message: 'Project created successfully',
      project_id: projectDoc.id
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project',
      details: error.message
    });
  }
});

// Profile setup endpoint
app.post('/profile-setup', async (req, res) => {
  try {
    const { 
      user_id, 
      skills, 
      interests, 
      year_of_study, 
      department, 
      bio 
    } = req.body;
    
    // Find user document by UID
    const userQuery = query(collection(db, 'users'), where('uid', '==', user_id));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
    await updateDoc(userDocRef, {
      skills: skills || [],
      interests: interests || [],
      year_of_study: year_of_study || '',
      department: department || '',
      bio: bio || '',
      profile_completed: true,
      updated_at: new Date().toISOString()
    });
    
    res.json({
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Prodiny Firebase Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase Project: prodiny-b31b9`);
});
