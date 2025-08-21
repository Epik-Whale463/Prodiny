'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Users, MessageSquare, Plus, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Subgroup {
  id: number
  name: string
  description: string
  members: number
  posts: number
  icon: string
  tags: string[]
  isJoined: boolean
}
import { toast } from 'sonner'

const subgroups = [
  {
    id: 1,
    name: "AI & Machine Learning",
    description: "Discuss AI trends, share ML projects, and collaborate on intelligent systems",
    members: 12500,
    posts: 1250,
    icon: "🤖",
    tags: ["AI", "ML", "Deep Learning", "Neural Networks"],
    isJoined: false
  },
  {
    id: 2,
    name: "Web Development",
    description: "Frontend, backend, full-stack development discussions and project showcases",
    members: 18200,
    posts: 2100,
    icon: "🌐",
    tags: ["React", "Node.js", "JavaScript", "CSS"],
    isJoined: true
  },
  {
    id: 3,
    name: "Mobile Development",
    description: "iOS, Android, React Native, Flutter - mobile app development community",
    members: 8700,
    posts: 890,
    icon: "📱",
    tags: ["React Native", "Flutter", "iOS", "Android"],
    isJoined: false
  },
  {
    id: 4,
    name: "UI/UX Design",
    description: "Design principles, user experience, prototyping, and design tools",
    members: 15300,
    posts: 1680,
    icon: "🎨",
    tags: ["Figma", "Design Systems", "Prototyping", "User Research"],
    isJoined: true
  },
  {
    id: 5,
    name: "Robotics & IoT",
    description: "Hardware projects, robotics, Internet of Things, and embedded systems",
    members: 6100,
    posts: 520,
    icon: "🤖",
    tags: ["Arduino", "Raspberry Pi", "Sensors", "Automation"],
    isJoined: false
  },
  {
    id: 6,
    name: "Data Science",
    description: "Data analysis, visualization, statistics, and data-driven insights",
    members: 9800,
    posts: 1100,
    icon: "📊",
    tags: ["Python", "R", "Statistics", "Visualization"],
    isJoined: false
  },
  {
    id: 7,
    name: "Cybersecurity",
    description: "Information security, ethical hacking, and cybersecurity best practices",
    members: 7200,
    posts: 680,
    icon: "🔒",
    tags: ["Ethical Hacking", "Network Security", "Cryptography"],
    isJoined: false
  },
  {
    id: 8,
    name: "DevOps & Cloud",
    description: "Cloud computing, containerization, CI/CD, and infrastructure automation",
    members: 5900,
    posts: 450,
    icon: "☁️",
    tags: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    isJoined: false
  }
]

export default function Subgroups() {
  const [searchTerm, setSearchTerm] = useState('')
  const [subgroups, setSubgroups] = useState<Subgroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubgroups()
  }, [])

  const fetchSubgroups = async () => {
    try {
      // Use mock data for now
      const { mockData } = await import('@/lib/firebase-api')
      const formattedSubgroups = mockData.subgroups.map(sg => ({
        id: sg.id,
        name: sg.name,
        description: sg.description || '',
        members: sg.member_count,
        posts: sg.post_count,
        icon: sg.icon,
        tags: [], // Add tags if needed
        isJoined: sg.is_joined
      }))
      setSubgroups(formattedSubgroups)
    } catch (error) {
      console.error('Failed to fetch subgroups:', error)
      toast.error('Failed to load communities')
    } finally {
      setLoading(false)
    }
  }

  const filteredSubgroups = subgroups.filter(subgroup =>
    subgroup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subgroup.description && subgroup.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const joinedGroups = subgroups.filter(subgroup => subgroup.isJoined)

  const handleJoinToggle = async (subgroupId: number) => {
    try {
      // For now, just update local state (replace with real API call later)
      setSubgroups(prev => prev.map(sg => 
        sg.id === subgroupId 
          ? { ...sg, isJoined: !sg.isJoined, members: sg.isJoined ? sg.members - 1 : sg.members + 1 }
          : sg
      ))
      
      const subgroup = subgroups.find(sg => sg.id === subgroupId)
      if (subgroup) {
        toast.success(subgroup.isJoined ? 'Left community' : 'Joined community')
      }
    } catch (error) {
      console.error('Failed to join/leave subgroup:', error)
      toast.error('Failed to update membership')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">CollegeHub</h1>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">Communities</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Interest Communities</h1>
          <p className="text-muted-foreground text-lg">
            Join communities based on your interests and connect with like-minded students
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Communities</p>
                  <p className="text-2xl font-bold">{subgroups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="text-2xl font-bold">{joinedGroups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">
                    {subgroups.reduce((sum, group) => sum + group.posts, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subgroups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubgroups.map((subgroup) => (
              <Card key={subgroup.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{subgroup.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{subgroup.name}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {subgroup.members.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {subgroup.posts}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subgroup.description}
                  </p>

                  {/* Join Button */}
                  <Button
                    onClick={() => handleJoinToggle(subgroup.id)}
                    variant={subgroup.isJoined ? "secondary" : "default"}
                    className="w-full"
                    size="sm"
                  >
                    {subgroup.isJoined ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Joined
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Join Community
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSubgroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No communities found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}