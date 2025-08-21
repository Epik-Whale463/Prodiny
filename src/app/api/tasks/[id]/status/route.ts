import { NextRequest, NextResponse } from 'next/server';

// This would be imported from the main tasks route in a real app
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks[taskIndex].status = status;

    return NextResponse.json(tasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    );
  }
}
