import { NextRequest, NextResponse } from 'next/server';

// Mock tasks data
let tasks = [
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

export async function GET() {
  try {
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status, project_id } = body;

    if (!title || !project_id) {
      return NextResponse.json(
        { error: 'Title and project_id are required' },
        { status: 400 }
      );
    }

    const newTask = {
      id: tasks.length + 1,
      project_id,
      title,
      description: description || '',
      status: status || 'todo',
      assigned_to: null,
      created_at: new Date().toISOString()
    };

    tasks.push(newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
