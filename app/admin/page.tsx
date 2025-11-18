/**
 * Admin Dashboard Page
 * Main dashboard displaying comprehensive statistics and modern analytics
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Images,
  Camera,
  Film,
  Users,
  ListChecks,
  ImageIcon,
  CreditCard,
  Settings,
  Activity,
  TrendingUp,
} from "lucide-react";

// Components
import { StatsCard } from "@/components/admin/StatsCard";
import PhotoChart from "./components/PhotoChart";
import SinglePhotoChart from "./components/SinglePhotoChart";
import StripPhotoChart from "./components/StripPhotoChart";

// Types
import type { AdminStats } from "@/types/stats";

// Utility: Format numbers for Indonesian locale
const formatNumber = (n: number): string => n.toLocaleString("id-ID");

/**
 * Main Admin Dashboard Component
 */
export default function PhotoAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalSessions: 0,
    photoFinal: 0,
    singlePhoto: 0,
    stripPhoto: 0,
    totalPhotos: 0,
    totalUsers: 0,
  });

  // Fetch statistics on component mount
  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load statistics");
        }

        if (mounted) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  // Stats card configurations - Primary Metrics
  const primaryStats = [
    {
      title: "Total Sessions",
      value: formatNumber(stats.totalSessions),
      icon: <ListChecks className="text-blue-600 h-5 w-5" />,
      color: "bg-blue-50",
      link: "/admin/sessions",
      description: "Unique photo sessions",
    },
    {
      title: "Gallery Pages",
      value: formatNumber(stats.totalPhotos),
      icon: <Images className="text-emerald-600 h-5 w-5" />,
      color: "bg-emerald-50",
      link: "/admin/gallery",
      description: "All photos combined",
    },
    {
      title: "Transactions",
      value: formatNumber(stats.totalSessions),
      icon: <CreditCard className="text-amber-600 h-5 w-5" />,
      color: "bg-amber-50",
      link: "/admin/transactions",
      description: "Payment records",
    },
    {
      title: "Total Users",
      value: formatNumber(stats.totalUsers),
      icon: <Users className="text-pink-600 h-5 w-5" />,
      color: "bg-pink-50",
      link: "/admin/users",
      description: "Registered users",
    },
  ];

  // Secondary Metrics
  const secondaryStats = [
    {
      title: "Photo Final",
      value: formatNumber(stats.photoFinal),
      icon: <ImageIcon className="text-indigo-600 h-5 w-5" />,
      color: "bg-indigo-50",
      link: "/admin/gallery/photo",
      description: "Processed final photos",
    },
    {
      title: "Raw Photos",
      value: formatNumber(stats.singlePhoto),
      icon: <Camera className="text-orange-600 h-5 w-5" />,
      color: "bg-orange-50",
      link: "/admin/gallery/single",
      description: "Raw single captures",
    },
    {
      title: "Strip Originals",
      value: formatNumber(stats.stripPhoto),
      icon: <Film className="text-purple-600 h-5 w-5" />,
      color: "bg-purple-50",
      link: "/admin/gallery/strip",
      description: "Original strip photos",
    },
    {
      title: "Payment Settings",
      value: "Active",
      icon: <Settings className="text-gray-600 h-5 w-5" />,
      color: "bg-gray-50",
      link: "/admin/payment",
      description: "Gateway configuration",
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-600">
              Monitor your photo booth performance and analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                {error}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl px-6 py-4 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <div>
                      <p className="text-xs opacity-90">Total Photos</p>
                      <p className="text-2xl font-bold">
                        {formatNumber(stats.totalPhotos)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Primary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {primaryStats.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <StatsCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                link={card.link}
                description={card.description}
                loading={loading}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Photo Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track photo uploads and engagement over time
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PhotoChart />
          <SinglePhotoChart />
          <StripPhotoChart />
        </div>
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Detailed Metrics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            In-depth breakdown of system resources
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {secondaryStats.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
            >
              <StatsCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                link={card.link}
                description={card.description}
                loading={loading}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
