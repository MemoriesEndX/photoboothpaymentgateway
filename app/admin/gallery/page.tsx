/**
 * Gallery Hub Page
 * Main navigation page for all gallery types
 * 
 * Route: /admin/gallery
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ImageIcon, Camera, Film, ArrowRight } from "lucide-react";

interface GalleryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  count?: number;
}

function GalleryCard({
  title,
  description,
  icon,
  color,
  href,
  count,
}: GalleryCardProps) {
  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`${color} rounded-xl shadow-lg p-6 h-full cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-white`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="bg-white/90 p-3 rounded-lg shadow-md">
            {icon}
          </div>
          <ArrowRight className="h-5 w-5 text-white/80" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/90 text-sm mb-4">{description}</p>

        {count !== undefined && (
          <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white">
            {count} {count === 1 ? "Photo" : "Photos"}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

export default function GalleryHubPage() {
  const galleries = [
    {
      title: "Final Photos",
      description: "Browse all processed final photos ready for delivery",
      icon: <ImageIcon className="h-6 w-6 text-green-600" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      href: "/admin/gallery/photo",
    },
    {
      title: "Raw Photos",
      description: "View all raw single photos before processing",
      icon: <Camera className="h-6 w-6 text-orange-600" />,
      color: "bg-gradient-to-br from-orange-500 to-amber-600",
      href: "/admin/gallery/single",
    },
    {
      title: "Strip Originals",
      description: "Access all original photo strip captures",
      icon: <Film className="h-6 w-6 text-purple-600" />,
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      href: "/admin/gallery/strip",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Photo Gallery
          </h1>
          <p className="text-lg text-gray-600">
            Browse and manage all photos across different categories
          </p>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <GalleryCard
              key={gallery.href}
              title={gallery.title}
              description={gallery.description}
              icon={gallery.icon}
              color={gallery.color}
              href={gallery.href}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            About Photo Categories
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <ImageIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900">Final Photos:</strong> These
                are fully processed photos ready for customer delivery. They
                include all edits, filters, and enhancements.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Camera className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900">Raw Photos:</strong> Original
                single captures from the photo booth before any processing.
                Useful for quality control and re-processing.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Film className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900">Strip Originals:</strong>{" "}
                Original photo strips as captured by the booth. Contains the
                raw strip layout before any modifications.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
