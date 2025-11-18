/**
 * User List Page
 * Path: /admin/users
 * 
 * Features:
 * - Display all users in table
 * - Create new user button
 * - Edit and delete actions
 * - Confirm before delete
 * 
 * @author Senior Fullstack Engineer
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Edit, Trash2, User as UserIcon } from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface User {
  id: number;
  email: string | null;
  name: string | null;
  role: 'SUPERADMIN' | 'GUEST';
  createdAt: string;
  _count?: {
    photos: number;
    singlePhotos: number;
  };
}

interface ApiResponse {
  success: boolean;
  data?: User[];
  error?: string;
  message?: string;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function UsersListPage() {
  const router = useRouter();
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ========================================
  // FETCH USERS
  // ========================================
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users');
      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('❌ Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // DELETE USER
  // ========================================
  const handleDelete = async (userId: number, userEmail: string | null) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${userEmail || 'Unknown'}"?\n\nThis will also delete all their photos. This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(userId);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }

      // Remove user from local state
      setUsers((prev) => prev.filter((user) => user.id !== userId));

      alert('✅ User deleted successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      alert(`❌ Error: ${errorMessage}`);
      console.error('❌ Error deleting user:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================
  const handleCreate = () => {
    router.push('/admin/users/create');
  };

  const handleEdit = (userId: number) => {
    router.push(`/admin/users/edit/${userId}`);
  };

  // ========================================
  // LIFECYCLE
  // ========================================
  useEffect(() => {
    fetchUsers();
  }, []);

  // ========================================
  // RENDER HELPERS
  // ========================================
  const getRoleBadgeClass = (role: string) => {
    return role === 'SUPERADMIN'
      ? 'bg-purple-100 text-purple-800 border border-purple-200'
      : 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage all users in the system</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Create User
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="text-red-600">❌</div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading Users</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Stats */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Total Users: <span className="font-semibold text-gray-900">{users.length}</span>
              </p>
            </div>

            {/* Table */}
            {users.length === 0 ? (
              <div className="text-center py-20">
                <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first user</p>
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create First User
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Photos
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.name || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user._count ? user._count.photos + user._count.singlePhotos : 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(user.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.email)}
                              disabled={deletingId === user.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete User"
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
