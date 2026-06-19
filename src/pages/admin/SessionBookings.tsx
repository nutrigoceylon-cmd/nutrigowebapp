import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import type { SessionBooking, BookingStatus } from '../../types'
import { supabase } from '../../lib/supabase'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/helpers'

export function AdminSessionBookings() {
  const [bookings, setBookings] = useState<SessionBooking[]>([])
  const [viewing, setViewing] = useState<SessionBooking | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('session_bookings')
      .select('*, provider:providers(name, title, specialty), profile:profiles(full_name, phone)')
      .order('booking_date', { ascending: false })
    setBookings(data ?? [])
  }

  async function updateStatus(id: string, status: BookingStatus) {
    await supabase.from('session_bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    if (viewing?.id === id) setViewing(v => v ? { ...v, status } : v)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Session Bookings</h1>

      <Table
        columns={[
          {
            key: 'client', label: 'Client',
            render: b => (
              <div>
                <p className="font-medium text-gray-900 text-sm">{b.contact_name ?? (b as any).profile?.full_name ?? '—'}</p>
                <p className="text-xs text-gray-400">{b.contact_phone ?? (b as any).profile?.phone ?? ''}</p>
                <p className="text-xs text-gray-400">{b.contact_email ?? ''}</p>
              </div>
            ),
          },
          {
            key: 'provider', label: 'Provider',
            render: b => (
              <div>
                <p className="text-sm text-gray-800">{(b as any).provider?.name ?? '—'}</p>
                <p className="text-xs text-gray-400 capitalize">{(b as any).provider?.specialty?.replace(/_/g, ' ')}</p>
              </div>
            ),
          },
          {
            key: 'booking_date', label: 'Date & Time',
            render: b => (
              <div>
                <p className="text-sm text-gray-800">{formatDate(b.booking_date)}</p>
                <p className="text-xs text-gray-400">{b.start_time} · {b.session_type}</p>
              </div>
            ),
          },
          { key: 'status', label: 'Status', render: b => <StatusBadge status={b.status} /> },
          {
            key: 'actions', label: '',
            render: b => (
              <div className="flex gap-2">
                <button onClick={() => setViewing(b)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary cursor-pointer"><Eye size={14} /></button>
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(b.id, 'confirmed')} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 cursor-pointer"><CheckCircle size={14} /></button>
                    <button onClick={() => updateStatus(b.id, 'cancelled')} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><XCircle size={14} /></button>
                  </>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => updateStatus(b.id, 'completed')} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 cursor-pointer text-xs font-medium">Done</button>
                )}
              </div>
            ),
          },
        ]}
        data={bookings}
        keyExtractor={b => b.id}
      />

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title="Booking Details" size="sm">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs mb-0.5">Client</p><p className="font-medium">{viewing.contact_name ?? (viewing as any).profile?.full_name}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Provider</p><p className="font-medium">{(viewing as any).provider?.name}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Phone</p><p className="font-medium">{viewing.contact_phone ?? (viewing as any).profile?.phone ?? '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Email</p><p className="font-medium break-all">{viewing.contact_email ?? '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Date</p><p className="font-medium">{formatDate(viewing.booking_date)}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Time</p><p className="font-medium">{viewing.start_time}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Type</p><p className="font-medium">{viewing.session_type}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Status</p><StatusBadge status={viewing.status} /></div>
            </div>
            {viewing.notes && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Client Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{viewing.notes}</p>
              </div>
            )}
            {viewing.status === 'confirmed' && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Meeting Link (optional)</p>
                <input
                  defaultValue={viewing.meeting_link ?? ''}
                  onBlur={async e => {
                    await supabase.from('session_bookings').update({ meeting_link: e.target.value }).eq('id', viewing.id)
                  }}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
            )}
            {viewing.status === 'pending' && (
              <div className="flex gap-3 pt-1">
                <Button onClick={() => updateStatus(viewing.id, 'confirmed')} fullWidth size="sm">Confirm Booking</Button>
                <Button variant="outline" onClick={() => updateStatus(viewing.id, 'cancelled')} fullWidth size="sm">Cancel</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
