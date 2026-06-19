import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import type { Event, EventRegistration, EventType, EventStatus } from '../../types'
import { supabase } from '../../lib/supabase'
import { ImageUpload } from '../../components/ui/ImageUpload'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { formatDateShort } from '../../lib/helpers'

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [registrationsOpen, setRegistrationsOpen] = useState(false)
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'webinar' as EventType,
    start_date: '', end_date: '', location: '', image_url: '', is_virtual: false,
    max_attendees: 50, status: 'upcoming' as EventStatus,
  })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('events').select('*').order('start_date', { ascending: false })
    setEvents(data ?? [])
  }

  function openCreate() {
    setEditing(null)
    setForm({ title: '', description: '', event_type: 'webinar', start_date: '', end_date: '', location: '', image_url: '', is_virtual: false, max_attendees: 50, status: 'upcoming' })
    setModalOpen(true)
  }

  function openEdit(event: Event) {
    setEditing(event)
    setForm({
      title: event.title,
      description: event.description ?? '',
      event_type: event.event_type,
      start_date: event.start_date.split('T')[0],
      end_date: event.end_date.split('T')[0],
      location: event.location ?? '',
      image_url: event.image_url ?? '',
      is_virtual: event.is_virtual,
      max_attendees: event.max_attendees,
      status: event.status,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    const payload = {
      ...form,
      image_url: form.image_url || null,
      start_date: form.start_date ? `${form.start_date}T00:00:00` : form.start_date,
      end_date: form.end_date ? `${form.end_date}T00:00:00` : form.end_date,
    }
    if (editing) {
      await supabase.from('events').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('events').insert(payload)
    }
    await load()
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this event?')) {
      await supabase.from('events').delete().eq('id', id)
      setEvents(prev => prev.filter(e => e.id !== id))
    }
  }

  async function openRegistrations(event: Event) {
    setViewingEvent(event)
    setRegistrationsOpen(true)
    setLoadingRegistrations(true)

    const { data } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false })

    setRegistrations(data ?? [])
    setLoadingRegistrations(false)
  }

  function closeRegistrations() {
    setRegistrationsOpen(false)
    setViewingEvent(null)
    setRegistrations([])
    setLoadingRegistrations(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Events</h1>
        <Button size="sm" onClick={openCreate}><Plus size={15} /> New Event</Button>
      </div>

      <Table
        columns={[
          {
            key: 'title', label: 'Event',
            render: e => (
              <div>
                <p className="font-medium text-gray-900">{e.title}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{e.event_type.replace(/_/g, ' ')} · {e.is_virtual ? 'Virtual' : 'In-Person'}</p>
              </div>
            ),
          },
          { key: 'start_date', label: 'Date', render: e => <span className="text-sm text-gray-600">{formatDateShort(e.start_date)}</span> },
          { key: 'max_attendees', label: 'Capacity', render: e => <span className="text-sm text-gray-600">{e.max_attendees} max</span> },
          { key: 'status', label: 'Status', render: e => <StatusBadge status={e.status} /> },
          {
            key: 'actions', label: '',
            render: e => (
              <div className="flex gap-2">
                <button
                  onClick={() => openRegistrations(e)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  title="View registrations"
                >
                  <Users size={14} />
                </button>
                <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors cursor-pointer"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
              </div>
            ),
          },
        ]}
        data={events}
        keyExtractor={e => e.id}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'New Event'} size="lg">
        <div className="space-y-4">
          <ImageUpload
            label="Event Image"
            value={form.image_url}
            onChange={url => setForm(f => ({ ...f, image_url: url }))}
          />
          <Input label="Event Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Event Type" value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value as EventType }))}
              options={[
                { value: 'cooking_class', label: 'Cooking Class' },
                { value: 'webinar', label: 'Webinar' },
                { value: 'workshop', label: 'Workshop' },
                { value: 'fitness_session', label: 'Fitness Session' },
                { value: 'nutrition_talk', label: 'Nutrition Talk' },
              ]}
            />
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EventStatus }))}
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'ongoing', label: 'Ongoing' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Input label="Start Date" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="End Date" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          <Input label="Max Attendees" type="number" value={String(form.max_attendees)} onChange={e => setForm(f => ({ ...f, max_attendees: Number(e.target.value) }))} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_virtual} onChange={e => setForm(f => ({ ...f, is_virtual: e.target.checked }))} className="w-4 h-4 accent-gold" />
            <span className="text-sm font-medium text-gray-700">Virtual event</span>
          </label>
          {!form.is_virtual && (
            <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Venue address..." />
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleSave} fullWidth>{editing ? 'Save' : 'Create Event'}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={registrationsOpen}
        onClose={closeRegistrations}
        title={viewingEvent ? `${viewingEvent.title} Registrations` : 'Event Registrations'}
        size="xl"
      >
        <div className="space-y-4">
          {viewingEvent && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-light-olive/30 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{viewingEvent.title}</p>
                <p className="text-gray-500">{formatDateShort(viewingEvent.start_date)}</p>
              </div>
              <div className="text-gray-600">
                {registrations.length} registration{registrations.length === 1 ? '' : 's'}
              </div>
            </div>
          )}

          {loadingRegistrations ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading registrations...</div>
          ) : (
            <Table
              columns={[
                {
                  key: 'contact_name',
                  label: 'Attendee',
                  render: r => (
                    <div>
                      <p className="font-medium text-gray-900">{r.contact_name || r.profile?.full_name || '—'}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{r.attendee_gender || '—'}</p>
                    </div>
                  ),
                },
                { key: 'contact_phone', label: 'Phone', render: r => r.contact_phone || '—' },
                { key: 'contact_email', label: 'Email', render: r => r.contact_email || '—' },
                { key: 'attendee_age', label: 'Age', render: r => r.attendee_age ?? '—' },
                { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
                { key: 'created_at', label: 'Registered', render: r => formatDateShort(r.created_at) },
              ]}
              data={registrations}
              keyExtractor={r => r.id}
              emptyMessage="No registrations for this event yet."
            />
          )}
        </div>
      </Modal>
    </div>
  )
}
