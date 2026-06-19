export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date))
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + '...' : text
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] ?? ''
}

export function getGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    healthy_lifestyle: 'Healthy Lifestyle',
  }
  return labels[goal] ?? goal
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    delivering: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-800',
    replied: 'bg-green-100 text-green-800',
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    // NutriOrder statuses
    order_received: 'bg-blue-100 text-blue-800',
    payment_pending: 'bg-yellow-100 text-yellow-800',
    payment_confirmed: 'bg-teal-100 text-teal-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
    // Delivery statuses
    not_assigned: 'bg-gray-100 text-gray-700',
    assigned: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-indigo-100 text-indigo-700',
    failed_delivery: 'bg-red-100 text-red-700',
    // Payment
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}

export function getNutriOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    order_received: 'Order Received',
    payment_pending: 'Payment Pending',
    payment_confirmed: 'Payment Confirmed',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function getDeliveryStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_assigned: 'Not Assigned',
    assigned: 'Assigned',
    picked_up: 'Picked Up',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    failed_delivery: 'Failed Delivery',
  }
  return labels[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function getPaymentMethodLabel(method: string): string {
  return method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'
}
