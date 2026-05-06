import { useState } from 'react'
import { PauseCircle, XCircle } from 'lucide-react'
import { mockSubscriptions } from '../../data/mockData'
import type { SubscriptionStatus } from '../../types'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/Badge'
import { formatDate, formatCurrency } from '../../lib/helpers'

export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions)

  function updateStatus(id: string, status: SubscriptionStatus) {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Subscriptions</h1>
        <span className="text-sm text-gray-400">{subscriptions.length} subscriptions</span>
      </div>

      <Table
        columns={[
          { key: 'id', label: 'ID', render: s => <span className="font-mono text-xs text-primary">{s.id}</span> },
          { key: 'user', label: 'Customer', render: s => <span className="font-medium text-gray-900">{s.profile?.full_name}</span> },
          { key: 'plan', label: 'Plan', render: s => <span className="text-gray-700 text-sm">{s.meal_plan?.name}</span> },
          { key: 'start_date', label: 'Start', render: s => <span className="text-gray-500 text-sm">{formatDate(s.start_date)}</span> },
          { key: 'end_date', label: 'End', render: s => <span className="text-gray-500 text-sm">{formatDate(s.end_date)}</span> },
          { key: 'price', label: 'Value', render: s => <span className="font-semibold text-primary">{s.meal_plan?.price ? formatCurrency(s.meal_plan.price) : '—'}/wk</span> },
          { key: 'status', label: 'Status', render: s => <StatusBadge status={s.status} /> },
          {
            key: 'actions', label: 'Actions',
            render: s => (
              <div className="flex gap-2">
                {s.status === 'active' && (
                  <button
                    onClick={() => updateStatus(s.id, 'paused')}
                    className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer"
                  >
                    <PauseCircle size={13} /> Pause
                  </button>
                )}
                {s.status === 'paused' && (
                  <button
                    onClick={() => updateStatus(s.id, 'active')}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer"
                  >
                    Resume
                  </button>
                )}
                {s.status !== 'cancelled' && (
                  <button
                    onClick={() => updateStatus(s.id, 'cancelled')}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                  >
                    <XCircle size={13} /> Cancel
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={subscriptions}
        keyExtractor={s => s.id}
        emptyMessage="No subscriptions found."
      />
    </div>
  )
}
