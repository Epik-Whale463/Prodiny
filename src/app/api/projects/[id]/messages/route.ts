import { NextRequest, NextResponse } from 'next/server';

// Mock messages data
let messages = [
  {
    id: 1,
    project_id: 1,
    user_id: 'john@example.com',
    username: 'John Doe',
    content: 'Hey team! Just kicked off the project. Let\'s discuss our approach.',
    timestamp: '2024-01-15T10:30:00Z',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 2,
    project_id: 1,
    user_id: 'sarah@example.com',
    username: 'Sarah Smith',
    content: 'Great! I\'ve been working on the UI designs. Should have mockups ready by tomorrow.',
    timestamp: '2024-01-15T11:15:00Z',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 3,
    project_id: 1,
    user_id: 'mike@example.com',
    username: 'Mike Johnson',
    content: 'Perfect timing! I can start on the backend once we finalize the API structure.',
    timestamp: '2024-01-15T14:22:00Z',
    avatar: '/api/placeholder/32/32'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const projectMessages = messages.filter(msg => msg.project_id === projectId);
    
    return NextResponse.json(projectMessages);
  } catch (error) {
    console.error('Error fetching project messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const body = await request.json();
    const { content, project_id } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const newMessage = {
      id: messages.length + 1,
      project_id: projectId,
      user_id: 'current_user@example.com',
      username: 'Current User',
      content,
      timestamp: new Date().toISOString(),
      avatar: '/api/placeholder/32/32'
    };

    messages.push(newMessage);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
