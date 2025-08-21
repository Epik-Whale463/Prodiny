import { NextResponse } from 'next/server';

// Mock admin stats data
const mockStats = {
  total_users: 2543,
  total_posts: 1876,
  total_projects: 342,
  total_colleges: 15
};

export async function GET() {
  try {
    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
