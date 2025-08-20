const API_BASE_URL = 'http://localhost:8000'

export interface RegisterData {
  name: string
  email: string
  college_name: string
  is_student: boolean
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  message?: string
}

export interface User {
  id: number
  name: string
  email: string
  college_name: string
  is_student: boolean
  skills?: string
  github_profile?: string
  profile_completed: boolean
}

export interface ProfileSetupData {
  full_name: string
  college: string
  skills: string[]
  github_profile?: string
}

export interface Subgroup {
  id: number
  name: string
  description?: string
  icon?: string
  member_count: number
  post_count: number
  is_joined: boolean
}

export interface Post {
  id: number
  title: string
  content: string
  author_name: string
  author_college: string
  subgroup_name: string
  post_type: string
  upvotes: number
  downvotes: number
  comment_count: number
  created_at: string
}

export interface PostCreateData {
  title: string
  content: string
  subgroup_id: number
  post_type: string
}

export interface Project {
  id: number
  title: string
  description: string
  owner_name: string
  visibility: string
  tags: string[]
  member_count: number
  task_counts: {
    todo: number
    doing: number
    done: number
  }
  created_at: string
}

export interface ProjectCreateData {
  title: string
  description: string
  visibility: string
  tags: string[]
}

export interface Task {
  id: number
  title: string
  description?: string
  project_id: number
  assignee_name?: string
  status: string
  created_at: string
}

export interface TaskCreateData {
  title: string
  description?: string
  project_id: number
  assignee_id?: number
  status: string
}

export interface ChatMessage {
  id: number
  content: string
  sender_name: string
  project_id: number
  created_at: string
}

export interface Comment {
  id: number
  content: string
  author_name: string
  created_at: string
}

export interface CommentCreateData {
  content: string
  post_id: number
}

export interface College {
  id: number
  name: string
  domain?: string
  student_count: number
  project_count: number
}

export interface CollegeCreateData {
  name: string
  domain?: string
}

export interface AdminStats {
  total_users: number
  total_colleges: number
  total_projects: number
  total_posts: number
  users_by_college: Array<{ college: string; count: number }>
  projects_by_college: Array<{ college: string; count: number }>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const token = localStorage.getItem('auth_token')
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(response.status, errorData.detail || 'Request failed')
  }

  return response.json()
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getCurrentUser: async (token: string): Promise<User> => {
    return apiRequest<User>('/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  setupProfile: async (data: ProfileSetupData): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/profile-setup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getSubgroups: async (): Promise<Subgroup[]> => {
    return apiRequest<Subgroup[]>('/subgroups')
  },

  joinSubgroup: async (subgroupId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/subgroups/${subgroupId}/join`, {
      method: 'POST',
    })
  },

  getPosts: async (): Promise<Post[]> => {
    return apiRequest<Post[]>('/posts')
  },

  createPost: async (data: PostCreateData): Promise<Post> => {
    return apiRequest<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  votePost: async (postId: number, vote: number): Promise<{ upvotes: number; downvotes: number }> => {
    return apiRequest<{ upvotes: number; downvotes: number }>(`/posts/${postId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ vote }),
    })
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    return apiRequest<Project[]>('/projects')
  },

  createProject: async (data: ProjectCreateData): Promise<{ message: string; project_id: number }> => {
    return apiRequest<{ message: string; project_id: number }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Colleges
  getColleges: async (): Promise<College[]> => {
    return apiRequest<College[]>('/colleges')
  },

  createCollege: async (data: CollegeCreateData): Promise<{ message: string; college_id: number }> => {
    return apiRequest<{ message: string; college_id: number }>('/colleges', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getCollegePosts: async (collegeName: string): Promise<Post[]> => {
    return apiRequest<Post[]>(`/college/${encodeURIComponent(collegeName)}/posts`)
  },

  getCollegeProjects: async (collegeName: string): Promise<Project[]> => {
    return apiRequest<Project[]>(`/college/${encodeURIComponent(collegeName)}/projects`)
  },

  // Tasks
  getProjectTasks: async (projectId: number): Promise<Task[]> => {
    return apiRequest<Task[]>(`/projects/${projectId}/tasks`)
  },

  createTask: async (data: TaskCreateData): Promise<{ message: string; task_id: number }> => {
    return apiRequest<{ message: string; task_id: number }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateTaskStatus: async (taskId: number, status: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/tasks/${taskId}/status?status=${status}`, {
      method: 'PUT',
    })
  },

  // Project Chat
  getProjectMessages: async (projectId: number): Promise<ChatMessage[]> => {
    return apiRequest<ChatMessage[]>(`/projects/${projectId}/messages`)
  },

  sendProjectMessage: async (projectId: number, content: string): Promise<{ message: string; message_id: number }> => {
    return apiRequest<{ message: string; message_id: number }>(`/projects/${projectId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, project_id: projectId }),
    })
  },

  // Comments
  getPostComments: async (postId: number): Promise<Comment[]> => {
    return apiRequest<Comment[]>(`/posts/${postId}/comments`)
  },

  createComment: async (data: CommentCreateData): Promise<Comment> => {
    // POST /posts/{post_id}/comments
    return apiRequest<Comment>(`/posts/${data.post_id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: data.content, post_id: data.post_id }),
    })
  },

  // Admin
  getAdminStats: async (): Promise<AdminStats> => {
    return apiRequest<AdminStats>('/admin/stats')
  },
}

// Simplified API exports for easier usage
export const api = {
  get: async <T = any>(endpoint: string) => {
    return apiRequest<T>(endpoint, { method: 'GET' })
  },
  post: async <T = any>(endpoint: string, data?: any) => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },
  put: async <T = any>(endpoint: string, data?: any, options?: { params?: Record<string, string> }) => {
    let url = endpoint
    if (options?.params) {
      const searchParams = new URLSearchParams(options.params)
      url += `?${searchParams.toString()}`
    }
    return apiRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },
  delete: async <T = any>(endpoint: string) => {
    return apiRequest<T>(endpoint, { method: 'DELETE' })
  },
}