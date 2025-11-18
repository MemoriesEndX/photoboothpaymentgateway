/**
 * Reusable Stats Card Component
 * Modern premium design with subtle hover effects
 */

"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  link: string;
  description?: string;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  icon,
  color,
  link,
  description,
  loading = false,
  trend,
}: StatsCardProps) {
  const displayValue = loading ? "Loading..." : value;

  return (
    <Link href={link} className="block group">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-gray-300/60 transition-all duration-300 overflow-hidden"
      >
        {/* Background gradient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 ${color} rounded-xl bg-opacity-10`}>
              {icon}
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Value */}
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
              {displayValue}
            </h3>
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>

          {/* Description and trend */}
          {!loading && (
            <div className="mt-4 flex items-center justify-between">
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                }`}>
                  <TrendingUp className={`w-3 h-3 ${!trend.isPositive && "rotate-180"}`} />
                  <span>{trend.value}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
