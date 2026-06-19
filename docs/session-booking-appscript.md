# Session Booking Apps Script

Use this Google Apps Script as a Web App. It receives the session booking JSON payload from the frontend and sends an email to the admin.

## Apps Script Code

```javascript
const ADMIN_EMAIL = 'your-admin@email.com';

function escapeHtml(value) {
  return String(value || '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');

    const subject = `New Session Booking: ${payload.contactName || 'Client'} with ${payload.providerName || 'Provider'}`;

    const body = [
      'A new session booking was submitted.',
      '',
      'Client Details',
      `Name: ${payload.contactName || '-'}`,
      `Phone: ${payload.contactPhone || '-'}`,
      `Email: ${payload.contactEmail || '-'}`,
      '',
      'Session Details',
      `Provider: ${payload.providerName || '-'}`,
      `Specialty: ${payload.providerSpecialty || '-'}`,
      `Session Type: ${payload.sessionType || '-'}`,
      `Date: ${payload.bookingDate || '-'}`,
      `Time: ${payload.startTime || '-'}`,
      `Booking ID: ${payload.bookingId || '-'}`,
      '',
      `Notes: ${payload.notes || '-'}`
    ].join('\n');

    const htmlBody = `
      <div style="margin:0;padding:24px;background:#f5f4ee;font-family:Arial,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:0;background:linear-gradient(135deg,#1f4d3a 0%,#2f6b53 100%);">
              <div style="padding:28px 32px;">
                <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#d4af37;font-weight:700;margin-bottom:10px;">
                  NutriGo Ceylon
                </div>
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;">
                  New Session Booking
                </h1>
                <p style="margin:10px 0 0 0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.82);">
                  A client has submitted a new expert session request.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 12px 32px;">
              <div style="background:#faf8f1;border:1px solid #eee4c8;border-radius:16px;padding:18px 20px;margin-bottom:18px;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#9a7b18;font-weight:700;margin-bottom:8px;">
                  Booking Overview
                </div>
                <div style="font-size:20px;font-weight:700;color:#1f4d3a;margin-bottom:4px;">
                  ${escapeHtml(payload.sessionType)}
                </div>
                <div style="font-size:14px;color:#4b5563;line-height:1.7;">
                  ${escapeHtml(payload.bookingDate)} at ${escapeHtml(payload.startTime)}<br />
                  Provider: ${escapeHtml(payload.providerName)}<br />
                  Specialty: ${escapeHtml(payload.providerSpecialty)}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top" width="50%" style="padding-right:10px;">
                    <div style="border:1px solid #e5e7eb;border-radius:16px;padding:18px;background:#ffffff;height:100%;">
                      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:700;margin-bottom:12px;">
                        Client Details
                      </div>
                      <div style="font-size:14px;line-height:1.8;color:#374151;">
                        <strong>Name:</strong> ${escapeHtml(payload.contactName)}<br />
                        <strong>Phone:</strong> ${escapeHtml(payload.contactPhone)}<br />
                        <strong>Email:</strong> ${escapeHtml(payload.contactEmail)}
                      </div>
                    </div>
                  </td>
                  <td valign="top" width="50%" style="padding-left:10px;">
                    <div style="border:1px solid #e5e7eb;border-radius:16px;padding:18px;background:#ffffff;height:100%;">
                      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:700;margin-bottom:12px;">
                        Booking Details
                      </div>
                      <div style="font-size:14px;line-height:1.8;color:#374151;">
                        <strong>Booking ID:</strong> ${escapeHtml(payload.bookingId)}<br />
                        <strong>Date:</strong> ${escapeHtml(payload.bookingDate)}<br />
                        <strong>Time:</strong> ${escapeHtml(payload.startTime)}<br />
                        <strong>Provider:</strong> ${escapeHtml(payload.providerName)}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 28px 32px;">
              <div style="border:1px solid #e5e7eb;border-radius:16px;padding:18px;background:#fcfcfb;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:700;margin-bottom:12px;">
                  Client Notes
                </div>
                <div style="font-size:14px;line-height:1.8;color:#374151;white-space:pre-wrap;">
                  ${escapeHtml(payload.notes || 'No additional notes provided.')}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <div style="font-size:12px;line-height:1.7;color:#6b7280;">
                This message was generated automatically from the NutriGo Ceylon booking form.
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: subject,
      body: body,
      htmlBody: htmlBody,
      replyTo: payload.contactEmail || undefined
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Deploy

1. Create a new Apps Script project.
2. Paste the code above.
3. Change `ADMIN_EMAIL` to your real admin email.
4. Deploy as `Web app`.
5. Access:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy the Web App URL.

## Frontend Env

After you send the Web App URL back, add it as:

```bash
VITE_SESSION_BOOKING_WEBHOOK_URL=YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL
```
