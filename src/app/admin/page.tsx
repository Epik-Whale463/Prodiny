'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  GraduationCap, 
  Code, 
  MessageSquare, 
  TrendingUp, 
  Plus,
  Settings,
  BarChart3,
  Shield,
  Database
} from 'lucide-react';
import { api } from '@/lib/api';

interface AdminStats {
  total_users: number;
  total_colleges: number;
  total_projects: number;
  total_posts: number;
  users_by_college: Array<{ college: string; count: number }>;
  projects_by_college: Array<{ college: string; count: number }>;
}

interface College {
  id: number;
  name: string;
  domain: string;
  student_count: number;
  project_count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollege, setNewCollege] = useState({ name: '', domain: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsResponse, collegesResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/colleges')
      ]);
      
      setStats(statsResponse.data);
      setColleges(collegesResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollege.name.trim()) return;

    try {
      await api.post('/colleges', newCollege);
      setNewCollege({ name: '', domain: '' });
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error creating college:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage colleges, users, and platform content</p>
            </div>
            <Badge variant="default" className="text-sm">
              Platform Administrator
            </Badge>
          </div>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <p className="text-xs text-muted-foreground">Registered students & faculty</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Colleges</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_colleges}</div>
                <p className="text-xs text-muted-foreground">Active institutions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_projects}</div>
                <p className="text-xs text-muted-foreground">Student projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posts</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_posts}</div>
                <p className="text-xs text-muted-foreground">Community discussions</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="colleges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colleges" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Colleges
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colleges" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Create College Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New College
                  </CardTitle>
                  <CardDescription>
                    Register a new educational institution on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCollege} className="space-y-4">
                    <div>
                      <Label htmlFor="college-name">College Name</Label>
                      <Input
                        id="college-name"
                        placeholder="e.g., Massachusetts Institute of Technology"
                        value={newCollege.name}
                        onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="college-domain">Email Domain</Label>
                      <Input
                        id="college-domain"
                        placeholder="e.g., mit.edu"
                        value={newCollege.domain}
                        onChange={(e) => setNewCollege({ ...newCollege, domain: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create College
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* College Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>College Overview</CardTitle>
                  <CardDescription>
                    Quick stats about registered colleges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Colleges</span>
                      <Badge variant="secondary">{colleges.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Most Active</span>
                      <span className="text-sm text-gray-600">
                        {colleges.sort((a, b) => b.student_count - a.student_count)[0]?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Students</span>
                      <span className="text-sm text-gray-600">
                        {colleges.reduce((sum, college) => sum + college.student_count, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colleges List */}
            <Card>
              <CardHeader>
                <CardTitle>All Colleges</CardTitle>
                <CardDescription>
                  Manage registered educational institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {colleges.map((college) => (
                    <div key={college.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{college.name}</h3>
                        <p className="text-sm text-gray-600">{college.domain}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{college.student_count} students</div>
                          <div className="text-sm text-gray-600">{college.project_count} projects</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {stats && (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Users by College */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Users by College</CardTitle>
                      <CardDescription>Student distribution across institutions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.users_by_college.slice(0, 8).map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{item.college}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(item.count / Math.max(...stats.users_by_college.map(u => u.count))) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Projects by College */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Projects by College</CardTitle>
                      <CardDescription>Project activity across institutions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.projects_by_college.slice(0, 8).map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{item.college}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(item.count / Math.max(...stats.projects_by_college.map(p => p.count))) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform Growth */}
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Metrics</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.total_users}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.total_projects}</div>
                        <div className="text-sm text-gray-600">Active Projects</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.total_posts}</div>
                        <div className="text-sm text-gray-600">Community Posts</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced user management features will be available here
                  </p>
                  <Button variant="outline">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Configuration</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced settings and configuration options will be available here
                  </p>
                  <Button variant="outline">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}