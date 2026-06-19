const sessionBookingWebhookUrl =
  import.meta.env.VITE_SESSION_BOOKING_WEBHOOK_URL ??
  'https://script.google.com/macros/s/AKfycbw-nc3kaZLVlhX3CubLShlYTto1FzGC4Mc0J_fyyo6EV3juy_NKMOix0iv7PXlPqZs/exec'

export interface SessionBookingWebhookPayload {
  bookingId: string
  providerId: string
  providerName: string
  providerSpecialty: string
  sessionType: string
  bookingDate: string
  startTime: string
  notes?: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

export async function notifySessionBookingWebhook(payload: SessionBookingWebhookPayload) {
  if (!sessionBookingWebhookUrl) return

  const body = JSON.stringify(payload)

  // Google Apps Script web apps do not reliably support CORS preflight.
  // Send a simple request so the browser does not block it before delivery.
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const queued = navigator.sendBeacon(
      sessionBookingWebhookUrl,
      new Blob([body], { type: 'text/plain;charset=UTF-8' })
    )

    if (queued) return
  }

  await fetch(sessionBookingWebhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
    body,
    keepalive: true,
  })
}
