// Email templates for booking confirmations
// Uses Resend or similar email service

interface BookingEmailData {
    userName: string;
    courtName: string;
    sport: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalCost: number;
    bookingId: string;
    clubName: string;
}

export function getBookingConfirmationEmail(data: BookingEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold;">✓ Booking Confirmed!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your court is reserved</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 30px 0; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                Hi <strong>${data.userName}</strong>,
              </p>
              <p style="margin: 0 0 30px 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                Great news! Your booking at <strong>${data.clubName}</strong> has been confirmed. Get ready to play!
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; margin: 30px 0;">
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin: 0 0 20px 0; color: white; font-size: 20px; font-weight: bold;">Booking Details</h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Court</td>
                        <td style="color: white; font-size: 14px; font-weight: bold; text-align: right; padding: 8px 0;">${data.courtName}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Sport</td>
                        <td style="color: white; font-size: 14px; font-weight: bold; text-align: right; padding: 8px 0;">${data.sport}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Date</td>
                        <td style="color: white; font-size: 14px; font-weight: bold; text-align: right; padding: 8px 0;">${data.bookingDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Time</td>
                        <td style="color: white; font-size: 14px; font-weight: bold; text-align: right; padding: 8px 0;">${data.startTime} - ${data.endTime}</td>
                      </tr>
                      <tr style="border-top: 1px solid rgba(255,255,255,0.1);">
                        <td style="color: #94a3b8; font-size: 16px; padding: 16px 0 8px 0; font-weight: bold;">Total Paid</td>
                        <td style="color: #10b981; font-size: 24px; font-weight: bold; text-align: right; padding: 16px 0 8px 0;">€${data.totalCost}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://courtflow.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #93c5fd; font-size: 14px; line-height: 1.6;">
                      <strong>💡 Tip:</strong> Arrive 10 minutes early to warm up and get the most out of your session!
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Need to make changes? You can manage your booking anytime from your dashboard.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: rgba(255,255,255,0.03); padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px;">
                Booking ID: ${data.bookingId}
              </p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © 2025 CourtFlow. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getBookingCancellationEmail(data: BookingEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px;">Booking Cancelled</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #e2e8f0; font-size: 16px;">
                Hi <strong>${data.userName}</strong>,
              </p>
              <p style="color: #cbd5e1; font-size: 16px;">
                Your booking for <strong>${data.courtName}</strong> on <strong>${data.bookingDate}</strong> has been cancelled.
              </p>
              <p style="color: #cbd5e1; font-size: 16px;">
                If you paid for this booking, your refund of <strong>€${data.totalCost}</strong> will be processed within 3-5 business days.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
