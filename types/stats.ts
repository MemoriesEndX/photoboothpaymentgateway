/**
 * Type Definitions for Admin Statistics
 */

import type { ReactNode } from "react";

export interface AdminStats {
  totalSessions: number;
  photoFinal: number;
  singlePhoto: number;
  stripPhoto: number;
  totalPhotos: number;
  totalUsers: number;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  link: string;
  description?: string;
}
