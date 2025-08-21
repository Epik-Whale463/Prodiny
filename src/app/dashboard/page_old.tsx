'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Home, 
  Users, 
  BookOpen, 
  Search,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { authApi } from '@/lib/api'
import PostCard from '@/components/post/PostCard'
import CreatePost from '@/components/post/CreatePost'



export default function Dashboard() {
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [subgroups, setSubgroups] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchData()
  const handler = (e: any) => fetchData()
  window.addEventListener('post:created', handler)
  return () => window.removeEventListener('post:created', handler)
  }, [])

  const fetchData = async () => {
    try {
      const [postsData, subgroupsData] = await Promise.all([
        authApi.getPosts(),
        authApi.getSubgroups()
      ])
      setPosts(postsData)
      setSubgroups(subgroupsData)
    } catch (e) {
      console.error('Failed to load dashboard data', e)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <AuthGuard requireProfile={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <div className="font-semibold text-lg text-gray-900">CollegeHub</div>

              {/* Search Bar */}
              <div className="hidden sm:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Left Sidebar - Navigation */}
            <div className="hidden lg:block w-48 flex-shrink-0">
              <div className="sticky top-20">
                <nav className="space-y-1">
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    <Home className="h-4 w-4 mr-3" />
                    Home
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    <TrendingUp className="h-4 w-4 mr-3" />
                    Popular
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    <Users className="h-4 w-4 mr-3" />
                    College
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Projects
                  </a>
                </nav>

                {/* Communities */}
                <div className="mt-8">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Communities</h3>
                  <div className="space-y-1">
                    {subgroups.slice(0, 4).map((subgroup) => (
                      <button
                        key={subgroup.id}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => router.push(`/subgroups/${subgroup.name.toLowerCase().replace(/\s+/g, '-')}`)}
                      >
                        {subgroup.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Posts Feed */}
            <div className="flex-1 max-w-2xl">
              {/* Create Post */}
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                <CreatePost />
              </div>

              {/* Posts */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>

            {/* Right Sidebar - Minimal */}
            <div className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                {/* User Profile */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-100 text-gray-700">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.college_name}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Posts today</span>
                      <span className="font-medium">{posts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Communities</span>
                      <span className="font-medium">{subgroups.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}