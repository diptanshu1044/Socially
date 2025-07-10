import { NextResponse } from 'next/server';
import { getDbUserId } from '@/actions/user.action';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Add debugging for production
    const { userId: clerkId } = await auth();
    console.log('🔍 Debug - Clerk ID:', clerkId);
    console.log('🔍 Debug - Environment:', process.env.NODE_ENV);
    console.log('🔍 Debug - Clerk Publishable Key:', process.env.CLERK_PUBLISHABLE_KEY?.substring(0, 10) + '...');
    
    const userId = await getDbUserId();
    console.log('🔍 Debug - Database User ID:', userId);
    
    if (!userId) {
      console.log('❌ Debug - No user ID found, returning 401');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log('✅ Debug - Authentication successful');
    return NextResponse.json({ userId });
  } catch (error) {
    console.error('❌ Debug - Error in /api/users/me:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user ID' },
      { status: 500 }
    );
  }
} 