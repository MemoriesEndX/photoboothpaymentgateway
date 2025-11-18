/**
 * API Route: User Management - Single User Operations
 * Path: /api/admin/users/[id]
 * Methods: GET, PUT, DELETE
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

interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
  role?: 'SUPERADMIN' | 'GUEST';
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: User | { deletedUser: string | null; deletedPhotos: number; deletedSinglePhotos: number } | null;
  error?: string;
}

interface User {
  id: number;
  email: string | null;
  name: string | null;
  role: 'SUPERADMIN' | 'GUEST';
  createdAt: Date;
}

interface RouteContext {
  params: {
    id: string;
  };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Validate and parse user ID
 */
function parseUserId(id: string): number | null {
  const userId = parseInt(id, 10);
  return isNaN(userId) ? null : userId;
}

// ==========================================
// GET: Get Single User by ID
// ==========================================

export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = context.params;
    console.log(`🔍 [GET /api/admin/users/${id}] Fetching user...`);

    // Validate ID
    const userId = parseUserId(id);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    console.log(`✅ User found: ${user.email}`);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('❌ [GET /api/admin/users/[id]] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
    
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
// PUT: Update User
// ==========================================

export async function PUT(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = context.params;
    console.log(`✏️ [PUT /api/admin/users/${id}] Updating user...`);

    // Validate ID
    const userId = parseUserId(id);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    // Parse request body
    let body: Partial<UpdateUserRequest>;
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // ========================================
    // VALIDATION
    // ========================================

    // Validate email format if provided
    if (email) {
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

      // Check if email already used by another user
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });

        if (emailExists) {
          return NextResponse.json(
            {
              success: false,
              error: 'Email already exists',
            },
            { status: 409 }
          );
        }
      }
    }

    // Validate password length if provided
    if (password && password.length < 6) {
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
    // PREPARE UPDATE DATA
    // ========================================

    const updateData: Partial<{
      email: string;
      name: string | null;
      role: 'SUPERADMIN' | 'GUEST';
      password: string;
    }> = {};

    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name || null;
    if (role !== undefined) updateData.role = role;

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      );
    }

    // ========================================
    // UPDATE USER
    // ========================================

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`✅ User updated successfully: ${updatedUser.email}`);

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('❌ [PUT /api/admin/users/[id]] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
    
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
// DELETE: Delete User
// ==========================================

export async function DELETE(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = context.params;
    console.log(`🗑️ [DELETE /api/admin/users/${id}] Deleting user...`);

    // Validate ID
    const userId = parseUserId(id);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            photos: true,
            singlePhotos: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // ========================================
    // DELETE USER (CASCADE DELETE PHOTOS)
    // ========================================

    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`✅ User deleted successfully: ${existingUser.email}`);
    console.log(`   Photos deleted: ${existingUser._count.photos}`);
    console.log(`   Single photos deleted: ${existingUser._count.singlePhotos}`);

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
        data: {
          deletedUser: existingUser.email,
          deletedPhotos: existingUser._count.photos,
          deletedSinglePhotos: existingUser._count.singlePhotos,
        },
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('❌ [DELETE /api/admin/users/[id]] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
