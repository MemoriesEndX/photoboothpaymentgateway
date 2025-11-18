/**
 * Type Definitions for Photo Gallery System
 * Centralized types for consistent data structures across the application
 */

import { Decimal } from "@prisma/client/runtime/library";

/**
 * Photo types that exist in the system
 */
export type PhotoType = "photo" | "single" | "strip";

/**
 * Base photo interface with common fields
 */
interface BasePhoto {
  id: number;
  url: string;
  userId: number | null;
  sessionId: string;
  storagePath: string;
  filename: string;
  thumbnailPath: string | null;
  packageId: string | null;
  paid: boolean;
  amountPaid: Decimal | null;
  metadata: unknown | null;
  queueNumber: number;
  createdAt: Date;
}

/**
 * Final processed photo (Photo model)
 */
export interface Photo extends BasePhoto {}

/**
 * Single raw photo (SinglePhoto model)
 */
export interface SinglePhoto extends BasePhoto {}

/**
 * Strip photo original (StripPhotoOriginal model)
 */
export interface StripPhoto extends BasePhoto {}

/**
 * Union type for any photo
 */
export type AnyPhoto = Photo | SinglePhoto | StripPhoto;

/**
 * API query parameters for photos
 */
export interface PhotosQueryParams {
  type: PhotoType;
  sessionId?: string;
}

/**
 * Photo gallery response
 */
export interface PhotoGalleryResponse {
  success: boolean;
  count: number;
  data: AnyPhoto[];
}
