import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Article } from '../../types'
import { supabase } from '../../lib/supabase'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { formatDateShort, truncate } from '../../lib/helpers'

const categories = ['Nutrition Science', 'Fitness & Performance', 'Gut Health', 'Lifestyle']

export function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState({ title: '', excerpt: '', category: categories[0], content: '', is_published: false })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
    setArticles(data ?? [])
  }

  function openCreate() {
    setEditing(null)
    setForm({ title: '', excerpt: '', category: categories[0], content: '', is_published: false })
    setModalOpen(true)
  }

  function openEdit(article: Article) {
    setEditing(article)
    setForm({ title: article.title, excerpt: article.excerpt ?? '', category: article.category, content: article.content, is_published: article.is_published })
    setModalOpen(true)
  }

  async function handleSave() {
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (editing) {
      await supabase.from('articles').update({ ...form, slug }).eq('id', editing.id)
    } else {
      await supabase.from('articles').insert({
        ...form, slug, tags: [],
        published_at: form.is_published ? new Date().toISOString() : null,
      })
    }
    await load()
    setModalOpen(false)
  }

  async function togglePublish(id: string) {
    const a = articles.find(a => a.id === id)
    if (!a) return
    const is_published = !a.is_published
    await supabase.from('articles').update({ is_published, published_at: is_published ? new Date().toISOString() : null }).eq('id', id)
    setArticles(prev => prev.map(a => a.id === id ? { ...a, is_published } : a))
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this article?')) {
      await supabase.from('articles').delete().eq('id', id)
      setArticles(prev => prev.filter(a => a.id !== id))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Articles CMS</h1>
        <Button size="sm" onClick={openCreate}><Plus size={15} /> New Article</Button>
      </div>

      <Table
        columns={[
          {
            key: 'title', label: 'Article',
            render: a => (
              <div>
                <p className="font-medium text-gray-900">{truncate(a.title, 55)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.category}</p>
              </div>
            ),
          },
          { key: 'published_at', label: 'Published', render: a => <span className="text-sm text-gray-500">{a.published_at ? formatDateShort(a.published_at) : '—'}</span> },
          { key: 'is_published', label: 'Status', render: a => <StatusBadge status={a.is_published ? 'active' : 'read'} /> },
          {
            key: 'actions', label: '',
            render: a => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors cursor-pointer"><Pencil size={14} /></button>
                <button onClick={() => togglePublish(a.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gold transition-colors cursor-pointer">
                  {a.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
              </div>
            ),
          },
        ]}
        data={articles}
        keyExtractor={a => a.id}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Article' : 'New Article'} size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Select
            label="Category"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            options={categories.map(c => ({ value: c, label: c }))}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Excerpt</label>
            <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none" placeholder="Brief summary..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Content</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none font-mono" placeholder="Article content (supports ## headings and paragraphs)..." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 rounded accent-gold" />
            <span className="text-sm font-medium text-gray-700">Publish immediately</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleSave} fullWidth>{editing ? 'Save Changes' : 'Create Article'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
