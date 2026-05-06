import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, RefreshCw } from 'lucide-react'
import type { NutriOrder, NutriOrderStatus } from '../../types'
import { adminGetOrders } from '../../lib/orders'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../lib/helpers'

const STATUS_OPTIONS: { value: NutriOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'order_received', label: 'Order Received' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'payment_confirmed', label: 'Payment Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function AdminOrders() {
  const [orders, setOrders] = useState<NutriOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<NutriOrderStatus | 'all'>('all')

  async function loadOrders() {
    setLoading(true)
    const data = await adminGetOrders()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch =
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.city.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || o.checkout_status === statusFilter
    return matchSearch && matchStatus
  })

  // Summary counts
  const counts = {
    total: orders.length,
    pending: orders.filter(o => o.checkout_status === 'order_received' || o.checkout_status === 'payment_pending').length,
    preparing: orders.filter(o => o.checkout_status === 'preparing').length,
    delivering: orders.filter(o => o.checkout_status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.checkout_status === 'delivered').length,
  }

  const summaryCards = [
    { label: "Today's Orders", value: counts.total, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: counts.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Preparing', value: counts.preparing, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Out for Delivery', value: counts.delivering, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Delivered', value: counts.delivered, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-3">
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, name, phone, city..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as NutriOrderStatus | 'all')}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold bg-white cursor-pointer"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <Table
          columns={[
            {
              key: 'order_number',
              label: 'Order #',
              render: o => (
                <Link to={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                  {o.order_number}
                </Link>
              ),
            },
            {
              key: 'customer',
              label: 'Customer',
              render: o => (
                <div>
                  <p className="font-medium text-gray-900 text-sm">{o.customer_name}</p>
                  <p className="text-gray-400 text-xs">{o.customer_phone}</p>
                </div>
              ),
            },
            {
              key: 'plan',
              label: 'Plan',
              render: o => <span className="text-sm text-gray-700">{o.meal_plan_name}</span>,
            },
            {
              key: 'delivery',
              label: 'Delivery',
              render: o => (
                <div>
                  <p className="text-sm text-gray-700">{formatDate(o.preferred_delivery_date)}</p>
                  <p className="text-gray-400 text-xs">{o.city}</p>
                </div>
              ),
            },
            {
              key: 'total',
              label: 'Amount',
              render: o => <span className="font-semibold text-primary">{formatCurrency(o.total_amount)}</span>,
            },
            {
              key: 'payment',
              label: 'Payment',
              render: o => <StatusBadge status={o.checkout_payment_status} />,
            },
            {
              key: 'status',
              label: 'Status',
              render: o => <StatusBadge status={o.checkout_status} />,
            },
            {
              key: 'actions',
              label: 'Actions',
              render: o => (
                <Link
                  to={`/admin/orders/${o.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-gold transition-colors"
                >
                  <Eye size={14} /> View
                </Link>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={o => o.id}
          emptyMessage={orders.length === 0 ? 'No orders yet. Orders placed through the checkout flow will appear here.' : 'No orders match your search.'}
        />
      )}

      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {orders.length} orders
      </p>
    </div>
  )
}
