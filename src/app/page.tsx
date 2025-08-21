'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Code, 
  MessageSquare, 
  TrendingUp, 
  Plus,
  Search,
  Filter,
  Star,
  Calendar,
  ArrowRight,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { authApi } from '@/lib/api';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  subgroup_name: string;
  created_at: string;
  tags: string[];
}

interface Project {
  id: number;
  title: string;
  description: string;
  owner_name: string;
  member_count: number;
  tags: string[];
  visibility: string;
  created_at: string;
}

interface Subgroup {
  id: number;
  name: string;
  description: string;
  member_count: number;
  color: string;
  icon: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [postsResponse, projectsResponse, subgroupsResponse] = await Promise.all([
        authApi.getPosts(),
        authApi.getProjects(),
        authApi.getSubgroups()
      ]);
      
      setPosts(postsResponse.slice(0, 5)); // Show only latest 5 posts
      setProjects(projectsResponse.slice(0, 6)); // Show only latest 6 projects
      setSubgroups(subgroupsResponse.slice(0, 8)); // Show only 8 subgroups
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <Target className="h-6 w-6" />
                </div>
                Prodiny
              </h1>
              <p className="text-gray-600 mt-1">Student collaboration platform</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/projects/create">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </Link>
              <Link href="/profile-setup">
                <Button variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to Prodiny!</h2>
                  <p className="text-blue-100 mb-4">
                    Connect with students, collaborate on projects, and build amazing things together.
                  </p>
                  <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                      <Button variant="secondary" className="text-gray-900">
                        Explore Dashboard
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Zap className="h-24 w-24 text-white opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Recent Posts
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Featured Projects
            </TabsTrigger>
            <TabsTrigger value="subgroups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Communities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Quick Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">Students collaborating</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{posts.length}</div>
                  <p className="text-xs text-muted-foreground">Recent discussions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interest Groups</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subgroups.length}</div>
                  <p className="text-xs text-muted-foreground">Communities to join</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Content */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Latest Posts Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Discussions
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {post.author_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{post.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{post.subgroup_name}</Badge>
                          <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Featured Projects Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Featured Projects
                    <Link href="/projects">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{project.title}</h4>
                          <Badge variant={project.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                            {project.visibility}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{project.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {project.member_count}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Discussions</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {post.author_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{post.title}</h3>
                          <Badge variant="outline">{post.subgroup_name}</Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {post.upvotes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post.comment_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.created_at)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">by {post.author_name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured Projects</h2>
              <Link href="/projects/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant={project.visibility === 'public' ? 'default' : 'secondary'}>
                          {project.visibility}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">by {project.owner_name}</span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.member_count}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subgroups" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Interest Communities</h2>
              <Link href="/subgroups">
                <Button variant="outline">
                  View All Communities
                </Button>
              </Link>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {subgroups.map((subgroup) => (
                <Card key={subgroup.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3"
                        style={{ backgroundColor: subgroup.color }}
                      >
                        {subgroup.icon}
                      </div>
                      <h3 className="font-semibold mb-2">{subgroup.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{subgroup.description}</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {subgroup.member_count.toLocaleString()} members
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
