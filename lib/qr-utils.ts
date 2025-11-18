/**
 * QR Code Utility Functions
 * Reusable QR code generation for both client and server
 * 
 * @author Senior Fullstack Engineer
 * @version 1.0.0
 */

// Note: QRCode library can be used in both client and server
// We'll handle type safety and error handling properly

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  colorDark?: string;
  colorLight?: string;
}

export interface QrCodeResult {
  success: boolean;
  data?: string | Buffer;
  error?: string;
}

/**
 * Default QR Code options
 */
const DEFAULT_QR_OPTIONS: QrCodeOptions = {
  width: 600,
  margin: 2,
  errorCorrectionLevel: 'H',
  colorDark: '#000000',
  colorLight: '#FFFFFF',
};

/**
 * Generate QR Code as PNG Buffer (Server-side only)
 * Digunakan untuk attachment email
 * 
 * @param url - URL yang akan di-encode ke QR
 * @param options - Optional QR code configuration
 * @returns Promise<Buffer> - PNG buffer
 */
export async function generateQrCodeBuffer(
  url: string,
  options: QrCodeOptions = {}
): Promise<Buffer> {
  try {
    // Import QRCode hanya di server-side
    const QRCode = require('qrcode');
    
    const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    const buffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
      color: {
        dark: mergedOptions.colorDark,
        light: mergedOptions.colorLight,
      },
    });
    
    return buffer;
  } catch (error) {
    console.error('❌ QR Code buffer generation failed:', error);
    throw new Error(`Failed to generate QR code buffer: ${error}`);
  }
}

/**
 * Generate QR Code as Data URL (Client-side compatible)
 * Digunakan untuk preview di browser
 * 
 * @param url - URL yang akan di-encode ke QR
 * @param options - Optional QR code configuration
 * @returns Promise<string> - Data URL (base64)
 */
export async function generateQrCodeDataUrl(
  url: string,
  options: QrCodeOptions = {}
): Promise<string> {
  try {
    const QRCode = require('qrcode');
    
    const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    const dataUrl = await QRCode.toDataURL(url, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
      color: {
        dark: mergedOptions.colorDark,
        light: mergedOptions.colorLight,
      },
    });
    
    return dataUrl;
  } catch (error) {
    console.error('❌ QR Code data URL generation failed:', error);
    throw new Error(`Failed to generate QR code data URL: ${error}`);
  }
}

/**
 * Validate URL before QR generation
 * 
 * @param url - URL to validate
 * @returns boolean - true if valid
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Build gallery URL from sessionId
 * 
 * @param sessionId - Session ID
 * @param baseUrl - Optional base URL (defaults to window.location.origin in browser)
 * @returns string - Full gallery URL
 */
export function buildGalleryUrl(sessionId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/gallery/${sessionId}`;
}

/**
 * Estimate QR Code complexity
 * Returns recommended error correction level based on URL length
 * 
 * @param url - URL to encode
 * @returns 'L' | 'M' | 'Q' | 'H'
 */
export function getRecommendedErrorCorrection(url: string): 'L' | 'M' | 'Q' | 'H' {
  const length = url.length;
  
  if (length < 50) return 'H'; // High - banyak ruang untuk error correction
  if (length < 100) return 'Q'; // Quartile
  if (length < 200) return 'M'; // Medium
  return 'L'; // Low - URL panjang, prioritaskan size
}

/**
 * Safe QR Code generator with error handling
 * Cocok untuk production use dengan try-catch built-in
 * 
 * @param url - URL to encode
 * @param options - Optional QR options
 * @returns Promise<QrCodeResult>
 */
export async function safeGenerateQrCode(
  url: string,
  options: QrCodeOptions = {}
): Promise<QrCodeResult> {
  try {
    // Validate URL
    if (!url) {
      return {
        success: false,
        error: 'URL is required',
      };
    }

    if (!isValidUrl(url)) {
      return {
        success: false,
        error: 'Invalid URL format',
      };
    }

    // Generate QR code
    const dataUrl = await generateQrCodeDataUrl(url, options);

    return {
      success: true,
      data: dataUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Unknown error during QR code generation',
    };
  }
}
