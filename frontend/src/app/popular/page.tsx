"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Flame, Clock, Users, MessageCircle } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { authApi, type Post, type Subgroup } from '@/lib/api'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import PostCard from '@/components/post/PostCard'

export default function Popular() {
  const { user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [subgroups, setSubgroups] = useState<Subgroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState('week') // today, week, month, all

  useEffect(() => {
    fetchPosts()
    fetchSubgroups()
  }, [timeFilter])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const allPosts = await authApi.getPosts()
      
      // Sort posts by popularity (upvotes - downvotes + comment_count)
      const sortedPosts = allPosts.sort((a, b) => {
        const scoreA = (a.upvotes - a.downvotes) + (a.comment_count * 0.5)
        const scoreB = (b.upvotes - b.downvotes) + (b.comment_count * 0.5)
        return scoreB - scoreA
      })

      // Filter by time if needed
      const filteredPosts = filterPostsByTime(sortedPosts, timeFilter)
      setPosts(filteredPosts)
    } catch (error) {
      console.error('Error fetching popular posts:', error)
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

  const filterPostsByTime = (posts: Post[], timeFilter: string) => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (timeFilter) {
      case 'today':
        cutoffDate.setDate(now.getDate() - 1)
        break
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'all':
      default:
        return posts
    }

    return posts.filter(post => new Date(post.created_at) >= cutoffDate)
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPopularityScore = (post: Post) => {
    return (post.upvotes - post.downvotes) + (post.comment_count * 0.5)
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
                <p className="text-muted-foreground">Loading popular posts...</p>
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
            <div className="container flex h-14 max-w-screen-2xl items-center px-2 md:px-6 lg:px-8">
              <div className="flex items-center space-x-2 flex-1">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Popular Posts</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search popular posts..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 px-2 py-4 md:px-6 lg:px-8 w-full">
            <div className="mx-auto w-full max-w-[1200px]">
              <div className="space-y-6 fade-in">
                {/* Time Filter Tabs */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <Tabs value={timeFilter} onValueChange={setTimeFilter}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="today" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Today
                        </TabsTrigger>
                        <TabsTrigger value="week" className="flex items-center gap-2">
                          <Flame className="h-4 w-4" />
                          This Week
                        </TabsTrigger>
                        <TabsTrigger value="month" className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          This Month
                        </TabsTrigger>
                        <TabsTrigger value="all" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          All Time
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Popular Posts List */}
                <div className="space-y-4">
                  {filteredPosts.length === 0 ? (
                    <Card className="glass-card scale-in">
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold">No popular posts found</h3>
                          <p className="text-muted-foreground mt-2">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for trending content!'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPosts.map((post, index) => (
                      <div key={post.id} className={`fade-in delay-${Math.min(index, 5)} relative`}>
                        {/* Popularity Rank Badge */}
                        <div className="absolute -left-2 top-4 z-10">
                          <Badge 
                            variant={index < 3 ? "default" : "secondary"} 
                            className={`
                              h-8 w-8 rounded-full flex items-center justify-center p-0 font-bold
                              ${index === 0 ? 'bg-yellow-500 text-white' : ''}
                              ${index === 1 ? 'bg-gray-400 text-white' : ''}
                              ${index === 2 ? 'bg-amber-600 text-white' : ''}
                            `}
                          >
                            {index + 1}
                          </Badge>
                        </div>
                        
                        {/* Post Card with Popularity Score */}
                        <div className="ml-6">
                          <PostCard post={post} />
                          
                          {/* Popularity Metrics */}
                          <div className="mt-2 px-4 py-2 bg-muted/30 rounded-b-lg">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Score: {getPopularityScore(post).toFixed(1)}
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  {post.comment_count} comments
                                </span>
                                <span>{post.upvotes - post.downvotes} net votes</span>
                              </div>
                              <span>{formatTimeAgo(post.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
