/**
 * API Route: User Management - List & Create
 * Path: /api/admin/users
 * Methods: GET, POST
 * 
 * @author Senior Fullstack Engineer
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface CreateUserRequest {
  email: string;
  name?: string;
  password: string;
  role?: 'SUPERADMIN' | 'GUEST';
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: User[] | User | null;
  error?: string;
}

interface User {
  id: number;
  email: string | null;
  name: string | null;
  role: 'SUPERADMIN' | 'GUEST';
  createdAt: Date;
}

// ==========================================
// GET: List All Users
// ==========================================

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    console.log('📋 [GET /api/admin/users] Fetching all users...');

    // Fetch all users, exclude password from response
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            photos: true,
            singlePhotos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ Found ${users.length} users`);

    return NextResponse.json(
      {
        success: true,
        data: users,
        message: `Retrieved ${users.length} users`,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('❌ [GET /api/admin/users] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// POST: Create New User
// ==========================================

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    console.log('➕ [POST /api/admin/users] Creating new user...');

    // Parse request body
    let body: Partial<CreateUserRequest>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON body',
        },
        { status: 400 }
      );
    }

    const { email, name, password, role } = body;

    // ========================================
    // VALIDATION
    // ========================================

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Password is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role && !['SUPERADMIN', 'GUEST'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Role must be either SUPERADMIN or GUEST',
        },
        { status: 400 }
      );
    }

    // ========================================
    // CHECK DUPLICATE EMAIL
    // ========================================

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
        },
        { status: 409 }
      );
    }

    // ========================================
    // HASH PASSWORD
    // ========================================

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ========================================
    // CREATE USER
    // ========================================

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: role || 'GUEST',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`✅ User created successfully: ${newUser.email} (ID: ${newUser.id})`);

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'User created successfully',
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('❌ [POST /api/admin/users] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
