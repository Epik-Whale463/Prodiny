'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Home, 
  Users, 
  BookOpen, 
  Search,
  Plus,
  TrendingUp,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Share
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'

// Mock data for development
const mockPosts = [
  {
    id: 1,
    title: "Getting Started with Machine Learning",
    content: "What are the best resources for beginners in ML? I'm particularly interested in computer vision applications.",
    author_name: "Alice Johnson",
    author_college: "MIT",
    subgroup_name: "AI & Machine Learning",
    post_type: "discussion",
    upvotes: 12,
    downvotes: 1,
    comment_count: 8,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: "React vs Vue in 2024",
    content: "Which framework should I choose for my next project? Looking at performance and learning curve.",
    author_name: "Bob Smith",
    author_college: "Stanford",
    subgroup_name: "Web Development",
    post_type: "discussion",
    upvotes: 8,
    downvotes: 2,
    comment_count: 15,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

const mockSubgroups = [
  {
    id: 1,
    name: "AI & Machine Learning",
    description: "Artificial Intelligence, ML, Deep Learning discussions",
    icon: "🤖",
    member_count: 1250,
    post_count: 89,
    is_joined: true
  },
  {
    id: 2,
    name: "Web Development",
    description: "Frontend, Backend, Full-stack development",
    icon: "💻",
    member_count: 2100,
    post_count: 156,
    is_joined: true
  }
];

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState(mockPosts)
  const [subgroups, setSubgroups] = useState(mockSubgroups)
  const router = useRouter()

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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12 sm:h-14">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="text-xl sm:text-2xl font-bold text-primary">CollegeHub</div>
              </div>

              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search communities and posts..."
                    className="w-full pl-10 pr-4 py-2 bg-secondary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ""} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Navigation */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Home className="h-4 w-4 mr-3" />
                      Home
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => router.push('/trending')}>
                      <TrendingUp className="h-4 w-4 mr-3" />
                      Popular
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => router.push('/college')}>
                      <Users className="h-4 w-4 mr-3" />
                      My College
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => router.push('/projects')}>
                      <BookOpen className="h-4 w-4 mr-3" />
                      My Projects
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* My Communities */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">My Communities</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/subgroups')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-64">
                    <div className="space-y-1 p-4 pt-0">
                      {subgroups.map((subgroup) => (
                        <Button
                          key={subgroup.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-2"
                          size="sm"
                          onClick={() => router.push(`/subgroups/${subgroup.name.toLowerCase().replace(/\s+/g, '-')}`)}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <span className="text-lg">{subgroup.icon}</span>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium truncate">{subgroup.name}</div>
                              <div className="text-xs text-muted-foreground">{subgroup.post_count} posts</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Posts Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Create Post */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="flex-1 justify-start text-muted-foreground">
                      Create a post...
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {post.author_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{post.author_name}</span>
                            <span>•</span>
                            <span>{post.author_college}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(post.created_at)}</span>
                          </div>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {post.subgroup_name}
                            </Badge>
                          </div>
                          <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
                          <p className="mt-1 text-muted-foreground">{post.content}</p>
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              <ChevronUp className="h-4 w-4 mr-1" />
                              {post.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              <ChevronDown className="h-4 w-4 mr-1" />
                              {post.downvotes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comment_count}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              <Share className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Sidebar - Profile & Trending */}
            <div className="lg:col-span-1 space-y-4">
              {/* User Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user?.displayName}</p>
                      <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {user?.role || 'Student'}
                      </Badge>
                    </div>
                  </div>
                  {user?.college && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">College:</p>
                      <p className="text-sm font-medium">{user.college}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trending Today */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Trending Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Hackathon 2024</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">React 19 Release</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Open Source Friday</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}