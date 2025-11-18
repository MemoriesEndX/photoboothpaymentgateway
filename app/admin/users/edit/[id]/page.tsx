/**
 * Edit User Page
 * Path: /admin/users/edit/[id]
 * 
 * Features:
 * - Load existing user data
 * - Update email, name, role
 * - Optional password update
 * - Form validation
 * - Redirect to list after success
 * 
 * @author Senior Fullstack Engineer
 * @version 1.0.0
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Eye, EyeOff } from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface User {
  id: number;
  email: string | null;
  name: string | null;
  role: 'SUPERADMIN' | 'GUEST';
  createdAt: string;
}

interface FormData {
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'GUEST';
  password: string;
}

interface ApiResponse {
  success: boolean;
  data?: User;
  error?: string;
  message?: string;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    role: 'GUEST',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [originalData, setOriginalData] = useState<User | null>(null);

  // ========================================
  // FETCH USER DATA
  // ========================================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/users/${userId}`);
        const data: ApiResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch user');
        }

        const user = data.data!;
        setOriginalData(user);
        setFormData({
          email: user.email || '',
          name: user.name || '',
          role: user.role,
          password: '', // Never prefill password
        });

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user';
        setError(errorMessage);
        console.error('❌ Error fetching user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // ========================================
  // FORM HANDLERS
  // ========================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Validate password length if provided
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare update data - only include changed fields
      const updateData: Partial<{
        email: string;
        name: string | null;
        role: 'SUPERADMIN' | 'GUEST';
        password: string;
      }> = {};

      if (formData.email.trim() !== originalData?.email) {
        updateData.email = formData.email.trim();
      }

      if (formData.name.trim() !== (originalData?.name || '')) {
        updateData.name = formData.name.trim() || null;
      }

      if (formData.role !== originalData?.role) {
        updateData.role = formData.role;
      }

      // Only include password if user entered a new one
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        setError('No changes detected');
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user');
      }

      // Success - redirect to list
      alert('✅ User updated successfully!');
      router.push('/admin/users');
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('❌ Error updating user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Check if there are unsaved changes
    const hasChanges =
      formData.email !== (originalData?.email || '') ||
      formData.name !== (originalData?.name || '') ||
      formData.role !== originalData?.role ||
      formData.password !== '';

    if (hasChanges) {
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel? All unsaved changes will be lost.'
      );
      if (!confirmCancel) return;
    }
    
    router.push('/admin/users');
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Users
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600 mt-2">Update user information</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading user data...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State (Load Error) */}
        {error && !isLoading && !originalData && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-red-600">❌</span>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading User</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  Back to Users
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        {!isLoading && originalData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600">❌</span>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* User ID Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">User ID:</span> #{originalData.id}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(originalData.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="user@example.com"
                />
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                />
                <p className="text-xs text-gray-500 mt-1">Optional</p>
              </div>

              {/* Role Field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="GUEST">Guest</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    minLength={6}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to keep current password. Minimum 6 characters if updating.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Update User
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Box */}
        {!isLoading && originalData && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only the fields you change will be updated. Password is optional when editing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
