import { NextRequest, NextResponse } from 'next/server';

// Mock tasks data for a specific project
const getProjectTasks = (projectId: string) => {
  const allTasks = [
    {
      id: 1,
      project_id: 1,
      title: 'Setup Development Environment',
      description: 'Configure Next.js, TypeScript, and Firebase',
      status: 'completed',
      assigned_to: 'john@example.com',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      project_id: 1,
      title: 'Design User Interface',
      description: 'Create wireframes and mockups for the main dashboard',
      status: 'in_progress',
      assigned_to: 'sarah@example.com',
      created_at: '2024-01-16T14:30:00Z'
    },
    {
      id: 3,
      project_id: 1,
      title: 'Implement Authentication',
      description: 'Set up Firebase Auth with email/password login',
      status: 'todo',
      assigned_to: null,
      created_at: '2024-01-17T09:15:00Z'
    }
  ];
  
  return allTasks.filter(task => task.project_id === parseInt(projectId));
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const tasks = getProjectTasks(projectId);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project tasks' },
      { status: 500 }
    );
  }
}
