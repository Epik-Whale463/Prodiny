'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Plus,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Code,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';

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

interface Task {
  id: number;
  title: string;
  description: string;
  project_id: number;
  assignee_name: string | null;
  status: string;
  created_at: string;
}

interface ChatMessage {
  id: number;
  content: string;
  sender_name: string;
  project_id: number;
  created_at: string;
}

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      // setupWebSocket();
    }
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projectsResponse, tasksResponse, messagesResponse] = await Promise.all([
        api.get('/projects'),
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/messages`)
      ]);
      
      const currentProject = projectsResponse.data.find((p: Project) => p.id === parseInt(projectId));
      setProject(currentProject);
      setTasks(tasksResponse.data);
      setMessages(messagesResponse.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await api.post('/tasks', {
        ...newTask,
        project_id: parseInt(projectId)
      });
      setNewTask({ title: '', description: '', status: 'todo' });
      fetchProjectData(); // Refresh data
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}/status`, null, {
        params: { status: newStatus }
      });
      fetchProjectData(); // Refresh data
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/projects/${projectId}/messages`, {
        content: newMessage,
        project_id: parseInt(projectId)
      });
      setNewMessage('');
      fetchProjectData(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'doing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'border-red-200 bg-red-50';
      case 'doing':
        return 'border-yellow-200 bg-yellow-50';
      case 'done':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    doing: tasks.filter(t => t.status === 'doing'),
    done: tasks.filter(t => t.status === 'done')
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-1">by {project.owner_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={project.visibility === 'public' ? 'default' : 'secondary'}>
                {project.visibility === 'public' ? 'Public' : project.visibility === 'college_only' ? 'College Only' : 'Private'}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4">{project.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {project.member_count} members
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(project.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Add Task Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Input
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="doing">Doing</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                  <Button type="submit">Add Task</Button>
                </form>
              </CardContent>
            </Card>

            {/* Kanban Board */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* To Do Column */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    To Do ({tasksByStatus.todo.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasksByStatus.todo.map((task) => (
                    <div key={task.id} className={`p-3 border rounded-lg ${getStatusColor('todo')}`}>
                      <h4 className="font-medium mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {task.assignee_name || 'Unassigned'}
                        </span>
                        <Select value={task.status} onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}>
                          <SelectTrigger className="w-24 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="doing">Doing</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Doing Column */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Clock className="h-5 w-5" />
                    Doing ({tasksByStatus.doing.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasksByStatus.doing.map((task) => (
                    <div key={task.id} className={`p-3 border rounded-lg ${getStatusColor('doing')}`}>
                      <h4 className="font-medium mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {task.assignee_name || 'Unassigned'}
                        </span>
                        <Select value={task.status} onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}>
                          <SelectTrigger className="w-24 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="doing">Doing</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Done Column */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Done ({tasksByStatus.done.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasksByStatus.done.map((task) => (
                    <div key={task.id} className={`p-3 border rounded-lg ${getStatusColor('done')}`}>
                      <h4 className="font-medium mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {task.assignee_name || 'Unassigned'}
                        </span>
                        <Select value={task.status} onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}>
                          <SelectTrigger className="w-24 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="doing">Doing</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="h-96">
              <CardHeader>
                <CardTitle>Project Chat</CardTitle>
                <CardDescription>Real-time communication with team members</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {message.sender_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.sender_name}</span>
                          <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Members</CardTitle>
                <CardDescription>Team members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Member Management</h3>
                  <p className="text-gray-600 mb-4">
                    Member management features will be available here
                  </p>
                  <Button variant="outline">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{Math.round((project.task_counts.done / (project.task_counts.todo + project.task_counts.doing + project.task_counts.done)) * 100) || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.round((project.task_counts.done / (project.task_counts.todo + project.task_counts.doing + project.task_counts.done)) * 100) || 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-red-600">{project.task_counts.todo}</div>
                        <div className="text-sm text-gray-600">To Do</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{project.task_counts.doing}</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{project.task_counts.done}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messages.slice(-5).map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {message.sender_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
                          <p className="text-xs text-gray-500">{formatDate(message.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}