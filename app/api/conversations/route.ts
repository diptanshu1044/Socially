import { NextRequest, NextResponse } from 'next/server';
import { getConversations } from '@/actions/chat.action';

export async function GET(request: NextRequest) {
  try {
    const conversations = await getConversations();
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
} 