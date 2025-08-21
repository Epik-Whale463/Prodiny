import { NextRequest, NextResponse } from 'next/server';

// Mock colleges data
let colleges = [
  {
    id: 1,
    name: 'Stanford University',
    domain: 'stanford.edu',
    description: 'Stanford University',
    student_count: 17000,
    location: 'Stanford, CA'
  },
  {
    id: 2,
    name: 'MIT',
    domain: 'mit.edu', 
    description: 'Massachusetts Institute of Technology',
    student_count: 11000,
    location: 'Cambridge, MA'
  },
  {
    id: 3,
    name: 'UC Berkeley',
    domain: 'berkeley.edu',
    description: 'University of California, Berkeley',
    student_count: 31000,
    location: 'Berkeley, CA'
  }
];

export async function GET() {
  try {
    return NextResponse.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch colleges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      );
    }

    const newCollege = {
      id: colleges.length + 1,
      name,
      domain,
      description: name,
      student_count: 0,
      location: 'TBD'
    };

    colleges.push(newCollege);

    return NextResponse.json(newCollege, { status: 201 });
  } catch (error) {
    console.error('Error creating college:', error);
    return NextResponse.json(
      { error: 'Failed to create college' },
      { status: 500 }
    );
  }
}
