import { useState } from 'react'
import { mockContactMessages } from '../../data/mockData'
import type { ContactMessage, ContactStatus } from '../../types'
import { StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/helpers'
import { Mail, MailOpen, MessageSquareReply } from 'lucide-react'

export function AdminMessages() {
  const [messages, setMessages] = useState(mockContactMessages)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replied, setReplied] = useState(false)

  function updateStatus(id: string, status: ContactStatus) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
  }

  function openMessage(msg: ContactMessage) {
    setSelected(msg)
    setReplyText('')
    setReplied(false)
    if (msg.status === 'new') updateStatus(msg.id, 'read')
  }

  function handleReply() {
    if (!selected) return
    updateStatus(selected.id, 'replied')
    setReplied(true)
    setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, status: 'replied' } : m))
  }

  const counts = {
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <div className="flex gap-3 text-sm">
          <span className="text-blue-600 font-medium">{counts.new} new</span>
          <span className="text-gray-400">{counts.read} read</span>
          <span className="text-green-600">{counts.replied} replied</span>
        </div>
      </div>

      <div className="space-y-2">
        {messages.map(msg => (
          <button
            key={msg.id}
            onClick={() => openMessage(msg)}
            className={`w-full text-left bg-white border rounded-xl px-5 py-4 flex items-start gap-4 hover:shadow-sm transition-all cursor-pointer ${
              msg.status === 'new' ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.status === 'new' ? 'bg-blue-100' : msg.status === 'replied' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {msg.status === 'replied' ? (
                <MessageSquareReply size={16} className="text-green-600" />
              ) : msg.status === 'new' ? (
                <Mail size={16} className="text-blue-600" />
              ) : (
                <MailOpen size={16} className="text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-semibold text-sm ${msg.status === 'new' ? 'text-gray-900' : 'text-gray-700'}`}>
                    {msg.name}
                  </span>
                  <span className="text-gray-400 text-xs truncate hidden sm:block">{msg.email}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={msg.status} />
                  <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
                </div>
              </div>
              <p className={`text-sm ${msg.status === 'new' ? 'font-medium text-gray-800' : 'text-gray-600'}`}>{msg.subject}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.message}</p>
            </div>
          </button>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400">No messages yet.</div>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Message" size="md">
        {selected && (
          <div>
            <div className="bg-light-olive/40 rounded-xl p-4 mb-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <p className="font-medium text-primary text-sm mb-3">{selected.subject}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{selected.message}</p>
              <p className="text-xs text-gray-400 mt-3">{formatDate(selected.created_at)}</p>
            </div>

            {!replied ? (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Reply</label>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold resize-none mb-4"
                  placeholder="Type your reply..."
                />
                <Button onClick={handleReply} disabled={!replyText.trim()} fullWidth>
                  Send Reply
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 bg-green-50 rounded-xl">
                <p className="text-green-600 font-medium text-sm">✓ Reply sent successfully!</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
