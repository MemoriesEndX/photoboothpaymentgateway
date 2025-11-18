/**
 * Gallery Header Component
 * Displays gallery page header with title, description, and navigation
 */

"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface GalleryHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  photoCount?: number;
  showBackButton?: boolean;
}

export function GalleryHeader({
  title,
  description,
  icon,
  photoCount,
  showBackButton = true,
}: GalleryHeaderProps) {
  return (
    <div className="border-b bg-white px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <Link
          href="/admin"
          className="hover:text-gray-900 transition-colors font-medium"
        >
          Admin
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href="/admin/gallery"
          className="hover:text-gray-900 transition-colors font-medium"
        >
          Gallery
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-semibold">{title}</span>
      </nav>

      {/* Main Header Content */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          {icon && (
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <div className="text-white">{icon}</div>
            </div>
          )}

          {/* Title and Description */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                {description}
              </p>
            )}
            {photoCount !== undefined && (
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        {showBackButton && (
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
