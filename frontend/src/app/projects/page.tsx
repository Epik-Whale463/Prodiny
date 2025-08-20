'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Users, Calendar, Filter, Eye, Lock, Globe, BookOpen, Code } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { authApi, type Project, type Subgroup } from '@/lib/api'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [subgroups, setSubgroups] = useState<Subgroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVisibility, setFilterVisibility] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
    fetchSubgroups()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const projectsData = await authApi.getProjects()
      setProjects(projectsData || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubgroups = async () => {
    try {
      const subgroupsData = await authApi.getSubgroups()
      setSubgroups(subgroupsData || [])
    } catch (error) {
      console.error('Error fetching subgroups:', error)
    }
  }

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesVisibility = filterVisibility === 'all' || project.visibility === filterVisibility
      
      return matchesSearch && matchesVisibility
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'members':
          return b.member_count - a.member_count
        case 'tasks':
          const tasksA = a.task_counts.todo + a.task_counts.doing + a.task_counts.done
          const tasksB = b.task_counts.todo + b.task_counts.doing + b.task_counts.done
          return tasksB - tasksA
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const getProgressPercentage = (project: Project) => {
    const { todo, doing, done } = project.task_counts
    const total = todo + doing + done
    return total > 0 ? Math.round((done / total) * 100) : 0
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
                <p className="text-muted-foreground">Loading projects...</p>
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
                <BookOpen className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Projects</h1>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">{filteredProjects.length} projects</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={() => router.push('/projects/create')} className="button-press">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 px-2 py-4 md:px-6 lg:px-8 w-full">
            <div className="mx-auto w-full max-w-[1600px]">
              <div className="space-y-6 fade-in">
                {/* Filters and Search */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search projects..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      
                      <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                        <SelectTrigger>
                          <SelectValue placeholder="Visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="alphabetical">Alphabetical</SelectItem>
                          <SelectItem value="members">Most Members</SelectItem>
                          <SelectItem value="tasks">Most Tasks</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" className="button-press">
                        <Filter className="h-4 w-4 mr-2" />
                        More Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                  <Card className="glass-card scale-in">
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No projects found</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                          {searchTerm ? 'Try adjusting your search or filters.' : 'Create your first project to get started!'}
                        </p>
                        <Button onClick={() => router.push('/projects/create')} className="button-press">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project, index) => (
                      <Card
                        key={project.id}
                        className={`glass-card interactive-hover fade-in delay-${Math.min(index, 5)} cursor-pointer`}
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                              <CardDescription className="mt-1">
                                by {project.owner_name} • {formatTimeAgo(project.created_at)}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={project.visibility === 'public' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {project.visibility === 'public' ? (
                                  <Globe className="h-3 w-3 mr-1" />
                                ) : (
                                  <Lock className="h-3 w-3 mr-1" />
                                )}
                                {project.visibility}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{getProgressPercentage(project)}% Complete</span>
                            </div>
                            <Progress value={getProgressPercentage(project)} className="h-2" />
                          </div>
                          
                          {/* Project Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-muted/30 rounded">
                              <div className="text-sm font-medium">{project.task_counts.todo}</div>
                              <div className="text-xs text-muted-foreground">Todo</div>
                            </div>
                            <div className="p-2 bg-muted/30 rounded">
                              <div className="text-sm font-medium">{project.task_counts.doing}</div>
                              <div className="text-xs text-muted-foreground">Doing</div>
                            </div>
                            <div className="p-2 bg-muted/30 rounded">
                              <div className="text-sm font-medium">{project.task_counts.done}</div>
                              <div className="text-xs text-muted-foreground">Done</div>
                            </div>
                          </div>
                          
                          {/* Tags and Members */}
                          <div className="space-y-2">
                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {project.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{project.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Users className="h-3 w-3 mr-1" />
                                {project.member_count} member{project.member_count !== 1 ? 's' : ''}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/projects/${project.id}`)
                                }}
                                className="h-7 px-2 text-xs button-press"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
