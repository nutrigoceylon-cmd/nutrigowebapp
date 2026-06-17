export const WHATSAPP_NUMBER = '94716113385'

export function buildWhatsAppUrl(message?: string) {
  if (!message) {
    return `https://wa.me/${WHATSAPP_NUMBER}`
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
