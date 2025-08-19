'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Users, Calendar, TrendingUp, BookOpen, Code, Lightbulb } from 'lucide-react';
import { api } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  author_college: string;
  subgroup_name: string;
  post_type: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  owner_name: string;
  visibility: string;
  tags: string[];
  member_count: number;
  task_counts: {
    todo: number;
    doing: number;
    done: number;
  };
  created_at: string;
}

interface College {
  id: number;
  name: string;
  domain: string;
  student_count: number;
  project_count: number;
}

export default function CollegePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      fetchCollegeData();
    }
  }, [selectedCollege]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data);
      if (response.data.length > 0) {
        setSelectedCollege(response.data[0].name);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const fetchCollegeData = async () => {
    if (!selectedCollege) return;
    
    setLoading(true);
    try {
      const [postsResponse, projectsResponse] = await Promise.all([
        api.get(`/college/${encodeURIComponent(selectedCollege)}/posts`),
        api.get(`/college/${encodeURIComponent(selectedCollege)}/projects`)
      ]);
      
      setPosts(postsResponse.data);
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error('Error fetching college data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'project_idea':
        return <Lightbulb className="h-4 w-4" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const selectedCollegeData = colleges.find(c => c.name === selectedCollege);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">College Hub</h1>
              <p className="text-gray-600 mt-1">Explore college-specific communities and projects</p>
            </div>
            <div className="flex gap-2">
              {colleges.slice(0, 5).map((college) => (
                <Button
                  key={college.id}
                  variant={selectedCollege === college.name ? "default" : "outline"}
                  onClick={() => setSelectedCollege(college.name)}
                  className="text-sm"
                >
                  {college.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>

          {selectedCollegeData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedCollegeData.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {selectedCollegeData.student_count} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Code className="h-4 w-4" />
                        {selectedCollegeData.project_count} projects
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedCollegeData.domain}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Active Community
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading college data...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                College Feed
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <div className="grid gap-6">
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-600">Be the first to start a discussion in your college community!</p>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {post.author_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{post.author_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {post.subgroup_name}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{formatDate(post.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPostTypeIcon(post.post_type)}
                            <Badge variant={post.post_type === 'project_idea' ? 'default' : 'secondary'}>
                              {post.post_type === 'project_idea' ? 'Project Idea' : 'Discussion'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        <p className="text-gray-700 mb-4">{post.content}</p>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <TrendingUp className="h-4 w-4" />
                              {post.upvotes} upvotes
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <MessageSquare className="h-4 w-4" />
                              {post.comment_count} comments
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            View Discussion
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {projects.length === 0 ? (
                  <div className="col-span-2">
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-600">Start building something amazing with your college community!</p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <CardDescription className="mt-1">
                              by {project.owner_name}
                            </CardDescription>
                          </div>
                          <Badge variant={project.visibility === 'public' ? 'default' : 'secondary'}>
                            {project.visibility === 'public' ? 'Public' : 'College Only'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 line-clamp-3">{project.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                          <div>
                            <div className="text-lg font-semibold text-red-600">
                              {project.task_counts.todo}
                            </div>
                            <div className="text-xs text-gray-600">To Do</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-yellow-600">
                              {project.task_counts.doing}
                            </div>
                            <div className="text-xs text-gray-600">Doing</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-green-600">
                              {project.task_counts.done}
                            </div>
                            <div className="text-xs text-gray-600">Done</div>
                          </div>
                        </div>

                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            {project.member_count} members
                          </div>
                          <Button variant="outline" size="sm">
                            View Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{posts.length}</div>
                    <p className="text-xs text-gray-600 mt-1">Active discussions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projects.length}</div>
                    <p className="text-xs text-gray-600 mt-1">Ongoing initiatives</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Project Ideas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {posts.filter(p => p.post_type === 'project_idea').length}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Looking for teams</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {posts.reduce((sum, post) => sum + post.comment_count, 0)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Total comments</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Tags</CardTitle>
                  <CardDescription>Most used project tags in this college</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(projects.flatMap(p => p.tags)))
                      .slice(0, 10)
                      .map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}