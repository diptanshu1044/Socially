import { NextRequest, NextResponse } from 'next/server';
import { getDbUserId } from '@/actions/user.action';

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({ userId });
  } catch (error) {
    console.error('Error fetching current user ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user ID' },
      { status: 500 }
    );
  }
} 