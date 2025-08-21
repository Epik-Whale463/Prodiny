// Firebase API functions
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
  signOut,
  User
} from 'firebase/auth';
import { db, auth } from './firebase';

// Mock data for fallback
export const mockData = {
  subgroups: [
    {
      id: 1,
      name: "AI & Machine Learning",
      description: "Discuss AI trends, share ML projects, and collaborate on intelligent systems",
      member_count: 12500,
      post_count: 1250,
      icon: "🤖",
      is_joined: false
    },
    {
      id: 2,
      name: "Web Development", 
      description: "Frontend, backend, full-stack development discussions and project showcases",
      member_count: 18200,
      post_count: 2100,
      icon: "🌐",
      is_joined: true
    }
  ]
};

// Auth functions
export const registerUser = async (userData: {
  email: string;
  password: string;
  name: string;
  college_name: string;
  is_student: boolean;
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    const userDoc = await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: user.email,
      name: userData.name || '',
      college_name: userData.college_name || '',
      is_student: userData.is_student || true,
      created_at: new Date().toISOString(),
      profile_completed: false
    });
    
    return {
      user: {
        id: userDoc.id,
        uid: user.uid,
        email: user.email,
        name: userData.name
      },
      access_token: await user.getIdToken()
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
    const userSnapshot = await getDocs(userQuery);
    
    let userData = { email: user.email, uid: user.uid };
    if (!userSnapshot.empty) {
      userData = { ...userData, ...userSnapshot.docs[0].data() };
    }
    
    return {
      user: userData,
      access_token: await user.getIdToken()
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return {
        uid,
        ...userDoc.data()
      };
    } else {
      throw new Error('User profile not found');
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Posts functions
export const getPosts = async () => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('created_at', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(postsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const createPost = async (postData: {
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  type?: string;
  tags?: string[];
}) => {
  try {
    const postDoc = await addDoc(collection(db, 'posts'), {
      title: postData.title || '',
      content: postData.content || '',
      author_id: postData.author_id || '',
      author_name: postData.author_name || '',
      type: postData.type || 'general',
      tags: postData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      comments_count: 0
    });
    
    return { post_id: postDoc.id };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Projects functions
export const getProjects = async () => {
  try {
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('created_at', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(projectsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const createProject = async (projectData: {
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  max_participants: number;
  creator_id: string;
  creator_name: string;
}) => {
  try {
    const projectDoc = await addDoc(collection(db, 'projects'), {
      title: projectData.title || '',
      description: projectData.description || '',
      technologies: projectData.technologies || [],
      difficulty: projectData.difficulty || 'intermediate',
      max_participants: projectData.max_participants || 5,
      creator_id: projectData.creator_id || '',
      creator_name: projectData.creator_name || '',
      participants: [],
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return { project_id: projectDoc.id };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
