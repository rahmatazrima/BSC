import { Resend } from 'resend';

// Initialize Resend dengan API key dari environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Mengirim email menggunakan Resend
 */
export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY tidak ditemukan di environment variables');
    }

    const result = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'Bukhari Service Center <noreply@bukhariservicecenter.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Template email untuk notifikasi status service
 */
export function createStatusNotificationTemplate({
  userName,
  status,
  oldStatus,
  serviceId,
  device,
  scheduledDate,
  scheduledTime,
  problems,
  totalPrice,
  serviceFee = 38000,
}: {
  userName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  oldStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  serviceId: string;
  device: string;
  scheduledDate?: string;
  scheduledTime?: string;
  problems?: string[];
  totalPrice?: number;
  serviceFee?: number;
}) {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    'PENDING': {
      title: 'Pesanan Anda Sedang Menunggu',
      message: 'Pesanan service Anda telah diterima dan sedang dalam antrian. Tim kami akan segera memproses pesanan Anda.',
      color: '#f59e0b'
    },
    'IN_PROGRESS': {
      title: 'Pesanan Anda Sedang Dikerjakan',
      message: 'Pesanan service Anda sedang dalam proses pengerjaan. Tim teknisi kami sedang menangani perangkat Anda dengan sebaik-baiknya.',
      color: '#3b82f6'
    },
    'COMPLETED': {
      title: 'Pesanan Anda Telah Selesai',
      message: 'Selamat! Pesanan service Anda telah selesai dikerjakan. Perangkat Anda siap untuk diambil.',
      color: '#10b981'
    },
    'CANCELLED': {
      title: 'Pesanan Anda Dibatalkan',
      message: 'Pesanan service Anda telah dibatalkan. Jika Anda memiliki pertanyaan, silakan hubungi kami.',
      color: '#ef4444'
    }
  };

  const statusInfo = statusMessages[status];
  const statusText = {
    'PENDING': 'Menunggu',
    'IN_PROGRESS': 'Sedang Dikerjakan',
    'COMPLETED': 'Selesai',
    'CANCELLED': 'Dibatalkan'
  }[status];

  const totalCost = totalPrice ? totalPrice + serviceFee : serviceFee;

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusInfo.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    Bukhari Service Center
                  </h1>
                </td>
              </tr>
              
              <!-- Status Badge -->
              <tr>
                <td style="padding: 30px 40px 20px; text-align: center;">
                  <div style="display: inline-block; padding: 12px 24px; background-color: ${statusInfo.color}20; border: 2px solid ${statusInfo.color}; border-radius: 6px;">
                    <span style="color: ${statusInfo.color}; font-size: 18px; font-weight: 600;">${statusText}</span>
                  </div>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 0 40px 40px;">
                  <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px;">Halo <strong>${userName}</strong>,</p>
                  
                  <h2 style="margin: 0 0 20px; color: #1e40af; font-size: 20px; font-weight: 600;">
                    ${statusInfo.title}
                  </h2>
                  
                  <div style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    <p style="margin: 0 0 16px;">${statusInfo.message}</p>
                  </div>

                  <!-- Service Details -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; font-weight: 600;">Detail Pesanan</h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">ID Pesanan:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${serviceId.slice(0, 8)}...</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Perangkat:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${device}</td>
                      </tr>
                      ${scheduledDate ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Jadwal:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${scheduledDate}${scheduledTime ? ` (${scheduledTime})` : ''}</td>
                      </tr>
                      ` : ''}
                      ${problems && problems.length > 0 ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Masalah:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${problems.map(p => `<div style="margin-bottom: 4px;">• ${p}</div>`).join('')}
                        </td>
                      </tr>
                      ` : ''}
                      ${status === 'COMPLETED' && totalPrice !== undefined ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Biaya:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">Rp ${totalCost.toLocaleString('id-ID')}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>

                  ${status === 'COMPLETED' ? `
                  <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">📦 Perangkat Anda siap diambil!</p>
                    <p style="margin: 8px 0 0; color: #047857; font-size: 14px;">Silakan datang ke workshop kami untuk mengambil perangkat Anda.</p>
                  </div>
                  ` : ''}

                  ${status === 'IN_PROGRESS' ? `
                  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">⏳ Sedang dalam proses pengerjaan</p>
                    <p style="margin: 8px 0 0; color: #1e3a8a; font-size: 14px;">Kami akan menginformasikan Anda segera setelah pengerjaan selesai.</p>
                  </div>
                  ` : ''}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                    Email ini dikirim dari sistem Bukhari Service Center
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                    Jl. Laksamana Malahayati, Baet, Aceh Besar, Indonesia<br>
                    Telp: +62 813 6186 6731 | Email: bukhariservicec@gmail.com
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

/**
 * Template email untuk notifikasi umum
 */
export function createEmailTemplate({
  title,
  message,
  userName,
  actionText,
  actionUrl,
}: {
  title: string;
  message: string;
  userName?: string;
  actionText?: string;
  actionUrl?: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    Bukhari Service Center
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  ${userName ? `<p style="margin: 0 0 20px; color: #1f2937; font-size: 16px;">Halo <strong>${userName}</strong>,</p>` : ''}
                  
                  <h2 style="margin: 0 0 20px; color: #1e40af; font-size: 20px; font-weight: 600;">
                    ${title}
                  </h2>
                  
                  <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    ${message.split('\n').map(para => `<p style="margin: 0 0 16px;">${para}</p>`).join('')}
                  </div>
                  
                  ${actionText && actionUrl ? `
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="${actionUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            ${actionText}
                          </a>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                    Email ini dikirim dari sistem Bukhari Service Center
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                    Jl. Laksamana Malahayati, Baet, Aceh Besar, Indonesia<br>
                    Telp: +62 813 6186 6731 | Email: bukhariservicec@gmail.com
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

