// API utility functions for calling Next.js API routes
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://prodiny.onrender.com/api' 
  : '/api';

// Auth API calls
export const registerUserAPI = async (email: string, password: string, userData: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, userData }),
  });
  
  return await response.json();
};

// Posts API calls
export const createPostAPI = async (postData: any) => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  
  return await response.json();
};

export const getPostsAPI = async (params: any = {}) => {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}/posts?${searchParams}`);
  
  return await response.json();
};

// Projects API calls
export const createProjectAPI = async (projectData: any) => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  
  return await response.json();
};

export const getProjectsAPI = async (params: any = {}) => {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}/projects?${searchParams}`);
  
  return await response.json();
};

// Health check
export const healthCheckAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return await response.json();
};
