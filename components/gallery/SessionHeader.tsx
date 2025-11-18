/**
 * Session Header Component
 * Displays session information and navigation breadcrumbs
 */

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SessionHeaderProps {
  sessionId: string;
  title: string;
  description?: string;
}

export function SessionHeader({
  sessionId,
  title,
  description,
}: SessionHeaderProps) {
  return (
    <div className="border-b bg-white px-6 py-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <Link
          href="/admin"
          className="hover:text-gray-900 transition-colors"
        >
          Admin
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href="/admin/gallery"
          className="hover:text-gray-900 transition-colors"
        >
          Gallery
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{sessionId}</span>
      </nav>

      {/* Title and Description */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Session Info Badge */}
      <div className="mt-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Session: {sessionId}
        </span>
      </div>
    </div>
  );
}
