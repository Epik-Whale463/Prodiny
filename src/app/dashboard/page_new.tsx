"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { authApi, type Post, type Subgroup } from '@/lib/api'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import PostCard from '@/components/post/PostCard'
import CreatePost from '@/components/post/CreatePost'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [subgroups, setSubgroups] = useState<Subgroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
    fetchSubgroups()
  }, [])

  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts()
    }

    const handleCommentPosted = () => {
      fetchPosts() // Refresh to update comment counts
    }

    window.addEventListener('post:created', handlePostCreated)
    window.addEventListener('comment:posted', handleCommentPosted)

    return () => {
      window.removeEventListener('post:created', handlePostCreated)
      window.removeEventListener('comment:posted', handleCommentPosted)
    }
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const posts = await authApi.getPosts()
      setPosts(posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubgroups = async () => {
    try {
      const subgroups = await authApi.getSubgroups()
      setSubgroups(subgroups || [])
    } catch (error) {
      console.error('Error fetching subgroups:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (loading) {
    return (
      <AuthGuard requireProfile={true}>
        <SidebarProvider>
          <AppSidebar subgroups={subgroups} />
          <SidebarInset>
            <div className="flex h-screen w-full items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireProfile={true}>
      <SidebarProvider>
        <AppSidebar subgroups={subgroups} />
        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              
              {/* Search */}
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search posts, communities..."
                    className="pl-8"
                  />
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/profile-setup')}>
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">{user?.name}</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Main Feed - Takes 3 columns on large screens */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Create Post */}
                  <Card>
                    <CardContent className="p-6">
                      <CreatePost />
                    </CardContent>
                  </Card>

                  {/* Posts Feed */}
                  <div className="space-y-4">
                    {posts.length === 0 ? (
                      <Card>
                        <CardContent className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold">No posts yet</h3>
                            <p className="text-muted-foreground mt-2">Be the first to create a post!</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Takes 1 column on large screens */}
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-semibold leading-none">{user?.name}</h3>
                          <p className="text-sm text-muted-foreground">{user?.college_name}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Popular Communities */}
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Popular Communities</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {subgroups.slice(0, 5).map((subgroup) => (
                        <div key={subgroup.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{subgroup.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {subgroup.member_count} members
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/subgroups/${subgroup.name.toLowerCase().replace(/\s+/g, '-')}`)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                      {subgroups.length === 0 && (
                        <p className="text-sm text-muted-foreground">No communities yet</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Quick Stats</h3>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Posts today</span>
                        <span className="font-medium">
                          {posts.filter(post => {
                            const today = new Date().toDateString()
                            const postDate = new Date(post.created_at).toDateString()
                            return today === postDate
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Communities</span>
                        <span className="font-medium">{subgroups.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total posts</span>
                        <span className="font-medium">{posts.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
