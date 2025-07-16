import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/actions/user.action';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const currentUserId = await getDbUserId();

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count of users (excluding current user)
    const totalUsers = await prisma.user.count({
      where: currentUserId ? {
        id: {
          not: currentUserId,
        },
      } : {},
    });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where: currentUserId ? {
        id: {
          not: currentUserId,
        },
      } : {},
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        location: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        // Use a random seed based on current timestamp to get different order each time
        id: 'asc', // This will be shuffled on the client side
      },
    });

    // Shuffle the users array to get random order
    const shuffledUsers = users.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      users: shuffledUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 