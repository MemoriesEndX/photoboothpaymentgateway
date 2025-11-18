/**
 * API Route: Send QR Code to Email
 * Path: /api/send-qr
 * Method: POST
 * * Production-grade Next.js 15 API Route Handler
 * Mengirim QR Code ke email menggunakan Resend API
 * * @author Senior Fullstack Engineer
 * @version 2.0.1 - Fix Environment Variable
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import QRCode from 'qrcode';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface SendQrRequestBody {
  sessionId: string;
  email: string;
  userName?: string; // Optional: untuk personalisasi email
}

interface SendQrResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
}

// ==========================================
// ENVIRONMENT VALIDATION
// ==========================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// PERBAIKAN KRITIS: Mengganti EMAIL_FROM menjadi FROM_EMAIL (sesuai .env.local)
// KITA JUGA MENGHAPUS FALLBACK 'noreply@yourdomain.com' yang menyebabkan error.
const EMAIL_FROM = process.env.FROM_EMAIL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is not configured in environment variables');
}
if (!EMAIL_FROM) {
  console.error('❌ FROM_EMAIL is not configured in environment variables. Email sending will fail.');
}


// Initialize Resend (lazy initialization untuk avoid error saat build)
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient && RESEND_API_KEY) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  if (!resendClient) {
    throw new Error('Resend client not initialized. Check RESEND_API_KEY.');
  }
  return resendClient;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate QR Code PNG Buffer
 */
async function generateQrCodeBuffer(url: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H', // High error correction
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return buffer;
  } catch (error) {
    console.error('❌ QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Build gallery URL dari request
 */
function buildGalleryUrl(req: NextRequest, sessionId: string): string {
  // Priority: ENV variable > Dynamic from request headers
  if (BASE_URL) {
    return `${BASE_URL}/gallery/${sessionId}`;
  }

  // Fallback: construct from request headers
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('host') || 'localhost:3000';
  return `${protocol}://${host}/gallery/${sessionId}`;
}

/**
 * Generate HTML email template
 */
function generateEmailHtml(galleryUrl: string, sessionId: string, userName?: string): string {
  const greeting = userName ? `Hi ${userName}` : 'Hello';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Photo Booth Gallery</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">📸 Photo Booth</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Your memories are ready!</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    ${greeting}! 👋
                  </p>
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Your photo booth session is complete! We've attached a QR code that you can scan to view and download all your photos.
                  </p>
                  
                  <!-- Session ID Box -->
                  <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #666666; font-size: 14px;">
                      <strong>Session ID:</strong> <code style="background-color: #e9ecef; padding: 2px 8px; border-radius: 3px; font-family: monospace;">${sessionId.slice(0, 16)}</code>
                    </p>
                  </div>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${galleryUrl}" 
                            style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                            View Gallery 🎉
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Or scan the attached QR code with your phone's camera to access your photos instantly.
                  </p>
                  
                  <!-- Direct Link -->
                  <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; color: #666666; font-size: 13px; font-weight: bold;">Direct Link:</p>
                    <a href="${galleryUrl}" style="color: #667eea; font-size: 13px; word-break: break-all; text-decoration: none;">${galleryUrl}</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0; color: #999999; font-size: 13px;">
                    This link will remain active for your convenience.<br/>
                    Save it to access your photos anytime! 💾
                  </p>
                  <p style="margin: 15px 0 0 0; color: #cccccc; font-size: 12px;">
                    © ${new Date().getFullYear()} Photo Booth App. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ==========================================
// MAIN API HANDLER
// ==========================================

export async function POST(req: NextRequest): Promise<NextResponse<SendQrResponse>> {
  console.log('📨 [send-qr] API called');

  try {
    // ========================================
    // 1. PARSE & VALIDATE REQUEST BODY
    // ========================================
    let body: Partial<SendQrRequestBody>;
    
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON body',
          error: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    const { sessionId, email, userName } = body;

    // Validate required fields
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing or invalid sessionId',
          error: 'sessionId is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing or invalid email',
          error: 'email is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
          error: 'Please provide a valid email address',
        },
        { status: 400 }
      );
    }

    // ========================================
    // 1.5. FINAL CONFIGURATION CHECK (setelah parsing body)
    // ========================================
    if (!RESEND_API_KEY) {
      console.error('❌ Resend API key not configured');
      return NextResponse.json(
        {
          success: false,
          message: 'Email service not configured',
          error: 'Server configuration error: RESEND_API_KEY missing.',
        },
        { status: 500 }
      );
    }
    
    // PERIKSA FROM_EMAIL
    if (!EMAIL_FROM || !isValidEmail(EMAIL_FROM.replace(/.*<(.+?)>/, '$1'))) {
      console.error('❌ FROM_EMAIL not configured correctly. Check .env.local.');
      return NextResponse.json(
        {
          success: false,
          message: 'Sender email not configured',
          error: 'Server configuration error: FROM_EMAIL missing or invalid.',
        },
        { status: 500 }
      );
    }


    console.log(`✅ Validation passed: sessionId=${sessionId.slice(0, 8)}, email=${email}`);
    console.log(`✅ Using FROM_EMAIL: ${EMAIL_FROM}`); // Logging untuk konfirmasi

    // ========================================
    // 2. BUILD GALLERY URL
    // ========================================
    const galleryUrl = buildGalleryUrl(req, sessionId);
    console.log(`🔗 Gallery URL: ${galleryUrl}`);

    // ========================================
    // 3. GENERATE QR CODE
    // ========================================
    console.log('🎨 Generating QR code...');
    const qrBuffer = await generateQrCodeBuffer(galleryUrl);
    const qrBase64 = qrBuffer.toString('base64');
    console.log(`✅ QR code generated: ${qrBuffer.length} bytes`);

    // ========================================
    // 4. PREPARE EMAIL CONTENT
    // ========================================
    const subject = `📸 Your Photo Booth Gallery — Session ${sessionId.slice(0, 8)}`;
    const htmlContent = generateEmailHtml(galleryUrl, sessionId, userName);

    // ========================================
    // 5. SEND EMAIL VIA RESEND
    // ========================================
    console.log(`📧 Sending email to ${email}...`);
    
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM, // SEKARANG MENGGUNAKAN VARIABEL LINGKUNGAN YANG BENAR
      to: [email],
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `qr-gallery-${sessionId.slice(0, 8)}.png`,
          content: qrBase64,
        },
      ],
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send email',
          error: error.message || 'Email service error',
        },
        { status: 500 }
      );
    }

    console.log(`✅ Email sent successfully! ID: ${data?.id}`);

    // ========================================
    // 6. SUCCESS RESPONSE
    // ========================================
    return NextResponse.json(
      {
        success: true,
        message: 'QR code sent successfully',
        emailId: data?.id,
      },
      { status: 200 }
    );

  } catch (error: any) {
    // ========================================
    // GLOBAL ERROR HANDLER
    // ========================================
    console.error('❌ [send-qr] Unexpected error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// ==========================================
// OPTIONAL: GET METHOD (untuk testing)
// ==========================================

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed',
      error: 'This endpoint only accepts POST requests',
    },
    { status: 405 }
  );
}