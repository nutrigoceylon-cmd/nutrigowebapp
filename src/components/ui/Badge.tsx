import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    delivering: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-700',
    replied: 'bg-green-100 text-green-800',
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-700',
    user: 'bg-gray-100 text-gray-700',
    admin: 'bg-purple-100 text-purple-800',
    nutritionist: 'bg-teal-100 text-teal-800',
    // NutriOrder statuses
    order_received: 'bg-blue-100 text-blue-800',
    payment_pending: 'bg-yellow-100 text-yellow-700',
    payment_confirmed: 'bg-teal-100 text-teal-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
    // Delivery statuses
    not_assigned: 'bg-gray-100 text-gray-600',
    assigned: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-indigo-100 text-indigo-700',
    failed_delivery: 'bg-red-100 text-red-700',
    // Payment statuses
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-700',
    // Payment methods
    cash_on_delivery: 'bg-amber-100 text-amber-800',
    bank_transfer: 'bg-sky-100 text-sky-800',
  }
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return <Badge className={colors[status] ?? 'bg-gray-100 text-gray-700'}>{label}</Badge>
}
