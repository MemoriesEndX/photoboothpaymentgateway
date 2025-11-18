// Types for photo-related data structures

export type PhotoType = 'photo' | 'singlePhoto' | 'stripPhotoOriginal';

export interface PhotoBase {
  id: number;
  url: string;
  storagePath: string;
  sessionId: string;
  filename: string;
  thumbnailPath: string | null;
  packageId: string | null;
  paid: boolean;
  amountPaid: number | null;
  metadata: unknown;
  queueNumber: number;
  createdAt: Date | string;
}

export interface PhotoWithType extends PhotoBase {
  type: PhotoType;
  timestamp: Date;
}

export interface SessionSummary {
  sessionId: string;
  createdAt: Date | string;
  photoCount?: number;
}

export interface PhotosResponse {
  success: boolean;
  count: number;
  photos: PhotoWithType[];
  error?: string;
}

export interface SessionsResponse {
  success: boolean;
  sessions: SessionSummary[];
  error?: string;
}
