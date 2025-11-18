import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Ambil Kunci API dari environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Ambil alamat email tujuan dan pengirim sesuai dengan .env.local Anda
const CONTACT_EMAIL = process.env.SUPPORT_EMAIL; 
const SENDER_EMAIL = process.env.FROM_EMAIL; 

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Handler untuk permintaan POST ke /api/support
 */
export async function POST(request: Request) {
  // Verifikasi konfigurasi dasar
  if (!CONTACT_EMAIL || !SENDER_EMAIL) {
    console.error('Environment variables SUPPORT_EMAIL or FROM_EMAIL are not set correctly.');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server configuration error: Contact or Sender email not set.' 
      },
      { status: 500 }
    );
  }

  try {
    const data: FormData = await request.json();
    const { name, email, subject, message } = data;

    // --- 1. Validasi Data ---
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, email, subject, and message are required.' 
        },
        { status: 400 }
      );
    }
    
    // (Tambahkan validasi email regex jika diperlukan)

    // --- 2. Mengirim Email Menggunakan Resend ---
    
    // Body email yang akan Anda terima (text-only fallback)
    const emailBodyText = `
      Detail Tiket Baru:
      --------------------------
      Nama Pengirim: ${name}
      Email Pengirim: ${email}
      
      Subjek: ${subject}
      
      Pesan:
      ${message}
      --------------------------
    `;

    // Kirim email
    const resendResponse = await resend.emails.send({
      from: SENDER_EMAIL, // Photo Booth Support <onboarding@resend.dev>
      to: CONTACT_EMAIL, // memoriesendx@gmail.com
      replyTo: email, // Balasan Anda akan dikirim ke email pengguna
      subject: `[SUPPORT TIKET BARU] ${subject}`,
      text: emailBodyText, 
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <div style="background-color: #1a202c; color: #ffffff; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">New Support Ticket Received 🔔</h1>
                    <p style="margin: 5px 0 0;">Dari: ${name}</p>
                </div>

                <div style="padding: 25px;">
                    <h3 style="color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Detail Pengirim</h3>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom: 20px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; background-color: #f7fafc; width: 30%; border: 1px solid #e2e8f0;"><strong>Nama</strong></td>
                            <td style="padding: 10px; background-color: #f7fafc; border: 1px solid #e2e8f0;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background-color: #ffffff; width: 30%; border: 1px solid #e2e8f0;"><strong>Email</strong></td>
                            <td style="padding: 10px; background-color: #ffffff; border: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #3182ce;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background-color: #f7fafc; width: 30%; border: 1px solid #e2e8f0;"><strong>Subjek</strong></td>
                            <td style="padding: 10px; background-color: #f7fafc; border: 1px solid #e2e8f0;">${subject}</td>
                        </tr>
                    </table>

                    <h3 style="color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Pesan</h3>
                    <div style="padding: 15px; background-color: #edf2f7; border-left: 4px solid #3182ce; border-radius: 4px;">
                        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                </div>

                <div style="padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; background-color: #f7fafc;">
                    <p style="margin: 0; font-size: 12px; color: #718096;">Balas email ini untuk menanggapi tiket pengguna secara langsung.</p>
                </div>

            </div>
        </div>
      `,
    });

    if (resendResponse.error) {
        console.error('Resend Error:', resendResponse.error);
        throw new Error(resendResponse.error.message || 'Failed to send email via Resend.');
    }

    // Simulasi pembuatan ID tiket
    const simulatedTicketId = Math.floor(10000 + Math.random() * 90000);

    // --- 3. Mengirim Respons Berhasil ke Frontend ---
    return NextResponse.json(
      {
        success: true,
        message: `Pesan Anda berhasil terkirim! Tim kami akan merespons melalui email secepatnya.`,
        ticketId: simulatedTicketId,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('API Support Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server internal yang tidak diketahui.';
    
    // --- 4. Mengirim Respons Gagal ---
    return NextResponse.json(
      { 
        success: false, 
        error: `Gagal mengirim pesan: ${errorMessage}`
      },
      { status: 500 }
    );
  }
}