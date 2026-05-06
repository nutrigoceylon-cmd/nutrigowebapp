import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, MapPin, Package, CreditCard, Truck, StickyNote, Clock, Save } from 'lucide-react'
import type { NutriOrder, NutriOrderStatus, NutriPaymentStatus, DeliveryStatus, OrderStatusHistoryEntry } from '../../types'
import {
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminUpdatePaymentStatus,
  adminUpdateDeliveryStatus,
  adminSaveNote,
} from '../../lib/orders'
import { formatCurrency, formatDate, getPaymentMethodLabel, getNutriOrderStatusLabel } from '../../lib/helpers'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

const ORDER_STATUS_OPTIONS: { value: NutriOrderStatus; label: string }[] = [
  { value: 'order_received', label: 'Order Received' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'payment_confirmed', label: 'Payment Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAYMENT_STATUS_OPTIONS: { value: NutriPaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const DELIVERY_STATUS_OPTIONS: { value: DeliveryStatus; label: string }[] = [
  { value: 'not_assigned', label: 'Not Assigned' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed_delivery', label: 'Failed Delivery' },
]

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()

  const [order, setOrder] = useState<NutriOrder | null>(null)
  const [history, setHistory] = useState<OrderStatusHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Status update state
  const [newOrderStatus, setNewOrderStatus] = useState<NutriOrderStatus>('order_received')
  const [statusNote, setStatusNote] = useState('')
  const [newPaymentStatus, setNewPaymentStatus] = useState<NutriPaymentStatus>('pending')
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<DeliveryStatus>('not_assigned')
  const [adminNote, setAdminNote] = useState('')

  const [saving, setSaving] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    load(id)
  }, [id])

  async function load(orderId: string) {
    setLoading(true)
    const { order: o, history: h } = await adminGetOrderById(orderId)
    if (o) {
      setOrder(o)
      setHistory(h)
      setNewOrderStatus(o.checkout_status)
      setNewPaymentStatus(o.checkout_payment_status)
      setNewDeliveryStatus(o.delivery_status)
      setAdminNote(o.admin_note ?? '')
    }
    setLoading(false)
  }

  function showMsg(key: string, msg: string) {
    setSaveMsg(prev => ({ ...prev, [key]: msg }))
    setTimeout(() => setSaveMsg(prev => { const n = { ...prev }; delete n[key]; return n }), 3000)
  }

  async function handleUpdateOrderStatus() {
    if (!id) return
    setSaving('order_status')
    const { error } = await adminUpdateOrderStatus(id, newOrderStatus, statusNote || undefined)
    if (!error) {
      setOrder(prev => prev ? { ...prev, checkout_status: newOrderStatus } : prev)
      setHistory(prev => [{
        id: crypto.randomUUID(),
        order_id: id,
        status: newOrderStatus,
        note: statusNote || undefined,
        created_at: new Date().toISOString(),
      }, ...prev])
      setStatusNote('')
      showMsg('order_status', 'Status updated')
    } else {
      showMsg('order_status', `Error: ${error}`)
    }
    setSaving(null)
  }

  async function handleUpdatePaymentStatus() {
    if (!id) return
    setSaving('payment_status')
    const { error } = await adminUpdatePaymentStatus(id, newPaymentStatus)
    if (!error) {
      setOrder(prev => prev ? { ...prev, checkout_payment_status: newPaymentStatus } : prev)
      showMsg('payment_status', 'Payment status updated')
    } else {
      showMsg('payment_status', `Error: ${error}`)
    }
    setSaving(null)
  }

  async function handleUpdateDeliveryStatus() {
    if (!id) return
    setSaving('delivery_status')
    const { error } = await adminUpdateDeliveryStatus(id, newDeliveryStatus)
    if (!error) {
      setOrder(prev => prev ? { ...prev, delivery_status: newDeliveryStatus } : prev)
      showMsg('delivery_status', 'Delivery status updated')
    } else {
      showMsg('delivery_status', `Error: ${error}`)
    }
    setSaving(null)
  }

  async function handleSaveNote() {
    if (!id) return
    setSaving('note')
    const { error } = await adminSaveNote(id, adminNote)
    if (!error) {
      setOrder(prev => prev ? { ...prev, admin_note: adminNote } : prev)
      showMsg('note', 'Note saved')
    } else {
      showMsg('note', `Error: ${error}`)
    }
    setSaving(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p>Order not found.</p>
        <Link to="/admin/orders" className="text-gold hover:underline text-sm mt-2 inline-block">
          ← Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/orders"
          className="flex items-center gap-1.5 text-gray-500 hover:text-primary text-sm transition-colors"
        >
          <ArrowLeft size={15} /> Orders
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-mono font-semibold text-primary">{order.order_number}</span>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={order.checkout_status} />
          <StatusBadge status={order.checkout_payment_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column – details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-gold" />
              <h3 className="font-semibold text-gray-900">Customer</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Name</p>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Phone</p>
                <p className="text-gray-700">{order.customer_phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-xs mb-0.5">Email</p>
                <p className="text-gray-700">{order.customer_email}</p>
              </div>
              {order.user_id && (
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs mb-0.5">Account</p>
                  <p className="text-gray-700 font-mono text-xs">{order.user_id}</p>
                </div>
              )}
              {!order.user_id && (
                <div className="col-span-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Guest order</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-gold" />
              <h3 className="font-semibold text-gray-900">Delivery</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <p className="text-gray-400 text-xs mb-0.5">Address</p>
                <p className="text-gray-700">{order.delivery_address_line}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">City</p>
                <p className="text-gray-700">{order.city}</p>
              </div>
              {order.nearest_landmark && (
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Landmark</p>
                  <p className="text-gray-700">{order.nearest_landmark}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Date</p>
                <p className="text-gray-700">{formatDate(order.preferred_delivery_date)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Time</p>
                <p className="text-gray-700">{order.preferred_delivery_time}</p>
              </div>
              {order.special_instructions && (
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs mb-0.5">Special Instructions</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-2 text-xs">{order.special_instructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Plan & Meals */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-gold" />
              <h3 className="font-semibold text-gray-900">Plan & Meals</h3>
            </div>
            <div className="bg-light-olive/40 rounded-xl p-3 mb-3">
              <p className="font-semibold text-primary">{order.meal_plan_name}</p>
            </div>
            {(order.items ?? []).length > 0 ? (
              <div className="space-y-2">
                {order.items!.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.meal_name}</p>
                      <p className="text-gray-400 text-xs capitalize">{item.meal_category}{item.calories ? ` · ${item.calories} cal` : ''}</p>
                    </div>
                    <span className="text-gray-500 font-medium">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No meal items recorded.</p>
            )}
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-primary">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-gold" />
              <h3 className="font-semibold text-gray-900">Payment</h3>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-1">Method</p>
                <p className="font-medium text-gray-800">{getPaymentMethodLabel(order.payment_method)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Status</p>
                <StatusBadge status={order.checkout_payment_status} />
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Delivery</p>
                <StatusBadge status={order.delivery_status} />
              </div>
            </div>
          </div>

          {/* Status history */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-gold" />
                <h3 className="font-semibold text-gray-900">Status History</h3>
              </div>
              <div className="space-y-3">
                {history.map(entry => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gold mt-2" />
                    <div>
                      <p className="font-medium text-gray-800">{getNutriOrderStatusLabel(entry.status as NutriOrderStatus)}</p>
                      {entry.note && <p className="text-gray-500 text-xs">{entry.note}</p>}
                      <p className="text-gray-300 text-xs">{new Date(entry.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column – actions */}
        <div className="space-y-5">

          {/* Order status update */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Update Order Status</h3>
            <div className="space-y-3">
              <select
                value={newOrderStatus}
                onChange={e => setNewOrderStatus(e.target.value as NutriOrderStatus)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gold bg-white"
              >
                {ORDER_STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="Optional note (visible in history)..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gold"
              />
              <Button
                fullWidth
                onClick={handleUpdateOrderStatus}
                loading={saving === 'order_status'}
                className="flex items-center justify-center gap-2"
              >
                <Save size={14} /> Update Status
              </Button>
              {saveMsg.order_status && (
                <p className="text-xs text-center text-green-600">{saveMsg.order_status}</p>
              )}
            </div>
          </div>

          {/* Payment status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Status</h3>
            <div className="space-y-3">
              <select
                value={newPaymentStatus}
                onChange={e => setNewPaymentStatus(e.target.value as NutriPaymentStatus)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gold bg-white"
              >
                {PAYMENT_STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button
                fullWidth
                variant="secondary"
                onClick={handleUpdatePaymentStatus}
                loading={saving === 'payment_status'}
              >
                Confirm Payment Status
              </Button>
              {saveMsg.payment_status && (
                <p className="text-xs text-center text-green-600">{saveMsg.payment_status}</p>
              )}
            </div>
          </div>

          {/* Delivery status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={16} className="text-gold" />
              <h3 className="font-semibold text-gray-900">Delivery Status</h3>
            </div>
            <div className="space-y-3">
              <select
                value={newDeliveryStatus}
                onChange={e => setNewDeliveryStatus(e.target.value as DeliveryStatus)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gold bg-white"
              >
                {DELIVERY_STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button
                fullWidth
                variant="outline"
                onClick={handleUpdateDeliveryStatus}
                loading={saving === 'delivery_status'}
              >
                Update Delivery
              </Button>
              {saveMsg.delivery_status && (
                <p className="text-xs text-center text-green-600">{saveMsg.delivery_status}</p>
              )}
            </div>
          </div>

          {/* Admin note */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote size={16} className="text-gold" />
              <h3 className="font-semibold text-gray-900">Admin Note</h3>
            </div>
            <div className="space-y-3">
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={4}
                placeholder="Internal note (not visible to customer)..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none"
              />
              <Button
                fullWidth
                variant="ghost"
                onClick={handleSaveNote}
                loading={saving === 'note'}
                className="border border-gray-200"
              >
                Save Note
              </Button>
              {saveMsg.note && (
                <p className="text-xs text-center text-green-600">{saveMsg.note}</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 space-y-1">
            <p>Created: {new Date(order.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(order.updated_at).toLocaleString()}</p>
            <p className="font-mono break-all">ID: {order.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
