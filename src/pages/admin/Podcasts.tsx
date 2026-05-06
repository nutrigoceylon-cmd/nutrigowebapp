import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Podcast } from '../../types'
import { supabase } from '../../lib/supabase'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { formatDateShort, formatDuration } from '../../lib/helpers'

export function AdminPodcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Podcast | null>(null)
  const [form, setForm] = useState({ title: '', description: '', episode_number: 1, duration: 0, audio_url: '', show_notes: '', is_published: false })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('podcasts').select('*').order('episode_number', { ascending: false })
    setPodcasts(data ?? [])
  }

  function openCreate() {
    setEditing(null)
    const nextEp = podcasts.length > 0 ? Math.max(...podcasts.map(p => p.episode_number)) + 1 : 1
    setForm({ title: '', description: '', episode_number: nextEp, duration: 0, audio_url: '', show_notes: '', is_published: false })
    setModalOpen(true)
  }

  function openEdit(pod: Podcast) {
    setEditing(pod)
    setForm({ title: pod.title, description: pod.description ?? '', episode_number: pod.episode_number, duration: pod.duration, audio_url: pod.audio_url, show_notes: pod.show_notes ?? '', is_published: pod.is_published })
    setModalOpen(true)
  }

  async function handleSave() {
    if (editing) {
      await supabase.from('podcasts').update(form).eq('id', editing.id)
    } else {
      await supabase.from('podcasts').insert({
        ...form,
        published_at: form.is_published ? new Date().toISOString() : null,
      })
    }
    await load()
    setModalOpen(false)
  }

  async function togglePublish(id: string) {
    const p = podcasts.find(p => p.id === id)
    if (!p) return
    const is_published = !p.is_published
    await supabase.from('podcasts').update({ is_published, published_at: is_published ? new Date().toISOString() : null }).eq('id', id)
    setPodcasts(prev => prev.map(p => p.id === id ? { ...p, is_published } : p))
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this episode?')) {
      await supabase.from('podcasts').delete().eq('id', id)
      setPodcasts(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Podcasts</h1>
        <Button size="sm" onClick={openCreate}><Plus size={15} /> New Episode</Button>
      </div>

      <Table
        columns={[
          {
            key: 'episode', label: 'Episode',
            render: p => (
              <div>
                <p className="text-xs text-gold font-semibold mb-0.5">Ep. {p.episode_number}</p>
                <p className="font-medium text-gray-900 text-sm leading-snug">{p.title}</p>
              </div>
            ),
          },
          { key: 'duration', label: 'Duration', render: p => <span className="text-sm text-gray-600">{formatDuration(p.duration)}</span> },
          { key: 'published_at', label: 'Published', render: p => <span className="text-sm text-gray-500">{p.published_at ? formatDateShort(p.published_at) : '—'}</span> },
          { key: 'is_published', label: 'Status', render: p => <StatusBadge status={p.is_published ? 'active' : 'read'} /> },
          {
            key: 'actions', label: '',
            render: p => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors cursor-pointer"><Pencil size={14} /></button>
                <button onClick={() => togglePublish(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gold transition-colors cursor-pointer">
                  {p.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
              </div>
            ),
          },
        ]}
        data={podcasts}
        keyExtractor={p => p.id}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Episode' : 'New Episode'} size="md">
        <div className="space-y-4">
          <Input label="Episode Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Episode #" type="number" value={String(form.episode_number)} onChange={e => setForm(f => ({ ...f, episode_number: Number(e.target.value) }))} />
            <Input label="Duration (seconds)" type="number" value={String(form.duration)} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none" />
          </div>
          <Input label="Audio URL" value={form.audio_url} onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))} placeholder="https://..." />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Show Notes</label>
            <textarea value={form.show_notes} onChange={e => setForm(f => ({ ...f, show_notes: e.target.value }))} rows={3} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-gold" />
            <span className="text-sm font-medium text-gray-700">Publish immediately</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleSave} fullWidth>{editing ? 'Save' : 'Create Episode'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
