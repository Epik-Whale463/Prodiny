// Firebase API functions
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import { registerUserAPI, createPostAPI, getPostsAPI, createProjectAPI, getProjectsAPI } from './api-routes';

// Mock data for fallback
export const mockData = {
  subgroups: [
    {
      id: 1,
      name: "AI & Machine Learning",
      description: "Discuss AI trends, share ML projects, and collaborate on intelligent systems",
      member_count: 12500,
      color: "#3B82F6",
      icon: "🤖"
    },
    {
      id: 2,
      name: "Web Development",
      description: "Frontend, backend, and full-stack web development discussions",
      member_count: 8900,
      color: "#10B981",
      icon: "🌐"
    }
  ]
};

// Authentication functions
export const registerUser = async (email: string, password: string, userData: {
  username: string;
  full_name: string;
  role: string;
  college_name: string;
  bio: string;
  profile_picture: string;
}) => {
  try {
    // First, create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Then call API route to store additional user data
    const result = await registerUserAPI(email, password, {
      ...userData,
      uid: user.uid
    });

    if (result.success) {
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          ...userData
        }
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Use Firebase Auth directly for login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return {
      success: true,
      user: user,
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
    // This would need to be implemented as an API route if needed
    // For now, we'll rely on the AuthContext to manage user profile
    return {
      uid,
      username: 'user',
      email: 'user@example.com',
      role: 'student',
      created_at: new Date().toISOString()
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Posts functions
export const getPosts = async () => {
  try {
    const result = await getPostsAPI();
    if (result.success) {
      return result.posts;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const createPost = async (postData: {
  title: string;
  content: string;
  author_id: string;
  subgroup_id?: string;
}) => {
  try {
    const result = await createPostAPI(postData);
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Projects functions
export const getProjects = async () => {
  try {
    const result = await getProjectsAPI();
    if (result.success) {
      return result.projects;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const createProject = async (projectData: {
  title: string;
  description: string;
  author_id: string;
  github_url?: string;
  tech_stack?: string[];
}) => {
  try {
    const result = await createProjectAPI(projectData);
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Subgroups functions
export const getSubgroups = async () => {
  try {
    // Return mock data for now
    return mockData.subgroups;
  } catch (error) {
    console.error('Error fetching subgroups:', error);
    return mockData.subgroups;
  }
};

// College functions
export const getColleges = async () => {
  try {
    // Return mock college data
    return [
      {
        id: 1,
        name: 'Stanford University',
        description: 'Leading technology and innovation university',
        student_count: 17000,
        location: 'Stanford, CA'
      },
      {
        id: 2,
        name: 'MIT',
        description: 'Massachusetts Institute of Technology',
        student_count: 11500,
        location: 'Cambridge, MA'
      },
      {
        id: 3,
        name: 'UC Berkeley',
        description: 'University of California, Berkeley',
        student_count: 31000,
        location: 'Berkeley, CA'
      }
    ];
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }
};

// Vote functions
export const voteOnPost = async (postId: string, voteType: 'up' | 'down') => {
  try {
    // This would need to be implemented as an API route
    console.log(`Voting ${voteType} on post ${postId}`);
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const voteOnProject = async (projectId: string, voteType: 'up' | 'down') => {
  try {
    // This would need to be implemented as an API route
    console.log(`Voting ${voteType} on project ${projectId}`);
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Comments functions
export const getComments = async (postId: string) => {
  try {
    // This would need to be implemented as an API route
    return [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const createComment = async (commentData: {
  post_id: string;
  content: string;
  author_id: string;
}) => {
  try {
    // This would need to be implemented as an API route
    console.log('Creating comment:', commentData);
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Admin functions
export const getAdminStats = async () => {
  try {
    const response = await fetch('/api/admin/stats');
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      total_users: 0,
      total_posts: 0,
      total_projects: 0,
      total_colleges: 0
    };
  }
};

export const createCollege = async (collegeData: {
  name: string;
  domain: string;
}) => {
  try {
    const response = await fetch('/api/colleges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collegeData),
    });
    if (!response.ok) throw new Error('Failed to create college');
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Project detail functions
export const getProjectTasks = async (projectId: string) => {
  try {
    const response = await fetch(`/api/projects/${projectId}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const getProjectMessages = async (projectId: string) => {
  try {
    const response = await fetch(`/api/projects/${projectId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const createTask = async (taskData: {
  title: string;
  description: string;
  status: string;
  project_id: number;
}) => {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateTaskStatus = async (taskId: number, status: string) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const sendProjectMessage = async (projectId: string, messageData: {
  content: string;
  project_id: number;
}) => {
  try {
    const response = await fetch(`/api/projects/${projectId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
};
