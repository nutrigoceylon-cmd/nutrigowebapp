import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import type { FAQItem } from '../../types'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'

const faqCategories = ['Getting Started', 'Meals & Nutrition', 'Subscriptions & Billing', 'Delivery']

export function AdminFAQ() {
  const [items, setItems] = useState<FAQItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FAQItem | null>(null)
  const [form, setForm] = useState({ question: '', answer: '', category: faqCategories[0], is_published: true })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('faq_items').select('*').order('sort_order').order('created_at')
    setItems(data ?? [])
  }

  function openCreate() {
    setEditing(null)
    setForm({ question: '', answer: '', category: faqCategories[0], is_published: true })
    setModalOpen(true)
  }

  function openEdit(item: FAQItem) {
    setEditing(item)
    setForm({ question: item.question, answer: item.answer, category: item.category, is_published: item.is_published })
    setModalOpen(true)
  }

  async function handleSave() {
    if (editing) {
      await supabase.from('faq_items').update(form).eq('id', editing.id)
    } else {
      await supabase.from('faq_items').insert({ ...form, sort_order: items.length + 1 })
    }
    await load()
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this FAQ item?')) {
      await supabase.from('faq_items').delete().eq('id', id)
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  async function togglePublish(id: string) {
    const item = items.find(i => i.id === id)
    if (!item) return
    const is_published = !item.is_published
    await supabase.from('faq_items').update({ is_published }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_published } : i))
  }

  const categories = Array.from(new Set(items.map(i => i.category)))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">FAQ Manager</h1>
        <Button size="sm" onClick={openCreate}><Plus size={15} /> Add FAQ</Button>
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">{cat}</h2>
          <div className="space-y-2">
            {items.filter(i => i.category === cat).map(item => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3.5 flex items-start gap-3 group">
                <GripVertical size={16} className="text-gray-300 mt-0.5 flex-shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">{item.question}</p>
                    <StatusBadge status={item.is_published ? 'active' : 'read'} />
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{item.answer}</p>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors cursor-pointer"><Pencil size={13} /></button>
                  <button onClick={() => togglePublish(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gold transition-colors cursor-pointer text-xs font-medium">{item.is_published ? 'Hide' : 'Show'}</button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit FAQ' : 'New FAQ Item'} size="md">
        <div className="space-y-4">
          <Input label="Question" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Answer</label>
            <textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} rows={5} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none" />
          </div>
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            options={faqCategories.map(c => ({ value: c, label: c }))}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-gold" />
            <span className="text-sm font-medium text-gray-700">Published</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleSave} fullWidth>{editing ? 'Save' : 'Add FAQ'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
