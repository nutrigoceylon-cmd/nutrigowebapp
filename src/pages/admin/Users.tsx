import { useEffect, useState } from 'react'
import { Search, UserCog } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import type { Profile, UserRole } from '../../types'
import { formatDate, getGoalLabel } from '../../lib/helpers'

export function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [users, setUsers] = useState<Profile[]>([])
  const [editUser, setEditUser] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setUsers(data ?? []))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  function handleRoleChange(role: UserRole) {
    if (!editUser) return
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, role } : u))
    supabase.from('profiles').update({ role }).eq('id', editUser.id)
    setEditUser(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <span className="text-sm text-gray-400">{filtered.length} users</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold bg-white cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="nutritionist">Nutritionist</option>
        </select>
      </div>

      <Table
        columns={[
          {
            key: 'full_name',
            label: 'User',
            render: (u) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {u.full_name[0]}
                </div>
                <span className="font-medium text-gray-900">{u.full_name}</span>
              </div>
            ),
          },
          { key: 'role', label: 'Role', render: (u) => <StatusBadge status={u.role} /> },
          { key: 'goal', label: 'Goal', render: (u) => <span className="text-gray-600 text-sm">{u.goal ? getGoalLabel(u.goal) : '—'}</span> },
          { key: 'created_at', label: 'Joined', render: (u) => <span className="text-gray-400 text-sm">{u.created_at ? formatDate(u.created_at) : '—'}</span> },
          {
            key: 'actions', label: 'Actions',
            render: (u) => (
              <button
                onClick={() => setEditUser(u)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-gold transition-colors cursor-pointer font-medium"
              >
                <UserCog size={14} /> Edit Role
              </button>
            ),
          },
        ]}
        data={filtered}
        keyExtractor={u => u.id}
        emptyMessage="No users found."
      />

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User Role" size="sm">
        {editUser && (
          <div>
            <div className="flex items-center gap-3 mb-5 p-3 bg-light-olive/40 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {editUser.full_name[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">{editUser.full_name}</p>
                <StatusBadge status={editUser.role} />
              </div>
            </div>
            <Select
              label="Assign Role"
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
                { value: 'nutritionist', label: 'Nutritionist' },
              ]}
              defaultValue={editUser.role}
              onChange={e => handleRoleChange(e.target.value as UserRole)}
            />
            <div className="flex gap-3 mt-5">
              <Button variant="outline" onClick={() => setEditUser(null)} fullWidth>Cancel</Button>
              <Button fullWidth onClick={() => setEditUser(null)}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
