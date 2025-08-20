'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, BookOpen, TrendingUp, Building, GraduationCap, MessageSquare, Code } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, type Post, type Project, type College, type Subgroup } from '@/lib/api';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import PostCard from '@/components/post/PostCard';

export default function College() {
  const { user } = useAuth();
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [collegePosts, setCollegePosts] = useState<Post[]>([]);
  const [collegeProjects, setCollegeProjects] = useState<Project[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchColleges();
    fetchSubgroups();
  }, []);

  useEffect(() => {
    if (colleges.length > 0 && user?.college_name && !selectedCollege) {
      const userCollege = colleges.find(c => c.name === user.college_name);
      if (userCollege) {
        setSelectedCollege(userCollege);
        fetchCollegeData(userCollege.name);
      } else if (colleges.length > 0) {
        setSelectedCollege(colleges[0]);
        fetchCollegeData(colleges[0].name);
      }
    }
  }, [colleges, user, selectedCollege]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const collegesData = await authApi.getColleges();
      setColleges(collegesData || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubgroups = async () => {
    try {
      const subgroupsData = await authApi.getSubgroups();
      setSubgroups(subgroupsData || []);
    } catch (error) {
      console.error('Error fetching subgroups:', error);
    }
  };

  const fetchCollegeData = async (collegeName: string) => {
    try {
      const [postsData, projectsData] = await Promise.all([
        authApi.getCollegePosts(collegeName),
        authApi.getCollegeProjects(collegeName)
      ]);
      
      setCollegePosts(postsData || []);
      setCollegeProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching college data:', error);
      setCollegePosts([]);
      setCollegeProjects([]);
    }
  };

  const handleCollegeSelect = (college: College) => {
    setSelectedCollege(college);
    fetchCollegeData(college.name);
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AuthGuard requireProfile={true}>
        <SidebarProvider>
          <AppSidebar subgroups={subgroups} />
          <SidebarInset>
            <div className="flex h-screen w-full items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading colleges...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    );
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
                <GraduationCap className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Colleges</h1>
                {selectedCollege && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-muted-foreground">{selectedCollege.name}</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search colleges..."
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
            <div className="mx-auto w-full max-w-[1600px]">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_1fr]">
                {/* College Selector Sidebar */}
                <div className="space-y-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Colleges
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {filteredColleges.map((college) => (
                        <Button
                          key={college.id}
                          variant={selectedCollege?.id === college.id ? "default" : "ghost"}
                          className="w-full justify-start button-press"
                          onClick={() => handleCollegeSelect(college)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{college.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {college.student_count}
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* College Details */}
                <div className="space-y-6">
                  {selectedCollege ? (
                    <>
                      {/* College Overview */}
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            {selectedCollege.name}
                          </CardTitle>
                          <CardDescription>
                            College community with {selectedCollege.student_count} students and {selectedCollege.project_count} projects
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                              <div className="text-2xl font-bold">{selectedCollege.student_count}</div>
                              <div className="text-sm text-muted-foreground">Students</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                              <div className="text-2xl font-bold">{selectedCollege.project_count}</div>
                              <div className="text-sm text-muted-foreground">Projects</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                              <div className="text-2xl font-bold">{collegePosts.length}</div>
                              <div className="text-sm text-muted-foreground">Posts</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tabs for Posts and Projects */}
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="posts" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Posts ({collegePosts.length})
                          </TabsTrigger>
                          <TabsTrigger value="projects" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Projects ({collegeProjects.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="space-y-4 mt-6">
                          {collegePosts.length === 0 ? (
                            <Card className="glass-card">
                              <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                  <h3 className="text-lg font-semibold">No posts yet</h3>
                                  <p className="text-muted-foreground mt-2">
                                    Be the first from {selectedCollege.name} to create a post!
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            collegePosts.map((post, index) => (
                              <div key={post.id} className={`fade-in delay-${Math.min(index, 5)}`}>
                                <PostCard post={post} />
                              </div>
                            ))
                          )}
                        </TabsContent>

                        <TabsContent value="projects" className="space-y-4 mt-6">
                          {collegeProjects.length === 0 ? (
                            <Card className="glass-card">
                              <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                  <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                  <h3 className="text-lg font-semibold">No projects yet</h3>
                                  <p className="text-muted-foreground mt-2">
                                    Start the first project for {selectedCollege.name}!
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {collegeProjects.map((project, index) => (
                                <Card key={project.id} className={`glass-card interactive-hover fade-in delay-${Math.min(index, 5)}`}>
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-lg">{project.title}</CardTitle>
                                        <CardDescription className="mt-1">
                                          by {project.owner_name}
                                        </CardDescription>
                                      </div>
                                      <Badge variant={project.visibility === 'public' ? 'default' : 'secondary'}>
                                        {project.visibility}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                      {project.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                        <span>{project.member_count} members</span>
                                        <span>•</span>
                                        <span>{project.task_counts.todo + project.task_counts.doing + project.task_counts.done} tasks</span>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => router.push(`/projects/${project.id}`)}
                                        className="button-press"
                                      >
                                        View
                                      </Button>
                                    </div>
                                    
                                    {project.tags && project.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-3">
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
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </>
                  ) : (
                    <Card className="glass-card">
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold">Select a college</h3>
                          <p className="text-muted-foreground mt-2">
                            Choose a college from the sidebar to view its community.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
