import { useState, useEffect } from 'react'
import { Calendar, MapPin, Video, Users } from 'lucide-react'
import type { Event } from '../../types'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/helpers'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'

const eventTypeIcons: Record<string, string> = {
  cooking_class: '🍳',
  webinar: '💻',
  workshop: '🏕️',
  fitness_session: '🏃',
  nutrition_talk: '🎤',
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [registerEvent, setRegisterEvent] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    supabase.from('events').select('*').order('start_date', { ascending: false })
      .then(({ data }) => setEvents(data ?? []))
  }, [])

  const filtered = events.filter(e => filter === 'all' || e.status === filter)
  const upcoming = filtered.filter(e => e.status === 'upcoming' || e.status === 'ongoing')
  const past = filtered.filter(e => e.status === 'completed' || e.status === 'cancelled')
  const selectedEvent = events.find(e => e.id === registerEvent)

  function handleRegister() {
    setRegistered(true)
    setTimeout(() => {
      setRegistered(false)
      setRegisterEvent(null)
    }, 2500)
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-light-olive/30 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">Community</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Events & Workshops</h1>
          <p className="text-gray-500 text-lg">Join our live cooking classes, webinars, fitness sessions, and wellness retreats.</p>
        </div>
      </section>

      {/* Filter */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-3">
          {(['all', 'upcoming', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer capitalize ${
                filter === f ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Upcoming Events */}
        {upcoming.length > 0 && (
          <div className="mb-16">
            <h2 className="font-serif text-2xl font-bold text-primary mb-8">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map(event => (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative">
                    {event.image_url
                      ? <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />
                      : <div className="w-full h-48 bg-light-olive/40 flex items-center justify-center text-4xl">{eventTypeIcons[event.event_type] ?? '📅'}</div>
                    }
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="absolute top-3 right-3 text-2xl">
                      {eventTypeIcons[event.event_type] ?? '📅'}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 text-base mb-3 leading-snug">{event.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={13} className="text-gold flex-shrink-0" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      {event.is_virtual ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Video size={13} className="text-gold flex-shrink-0" />
                          <span>Virtual Event</span>
                        </div>
                      ) : event.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={13} className="text-gold flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users size={13} className="text-gold flex-shrink-0" />
                        <span>{event.max_attendees} spots available</span>
                      </div>
                    </div>
                    <Button size="sm" fullWidth onClick={() => setRegisterEvent(event.id)}>Register Now</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {past.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary mb-8">Past Events</h2>
            <div className="space-y-4">
              {past.map(event => (
                <div key={event.id} className="bg-white rounded-xl border border-gray-100 p-5 flex gap-5 items-center opacity-75">
                  {event.image_url
                    ? <img src={event.image_url} alt={event.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 grayscale" />
                    : <div className="w-20 h-20 rounded-xl bg-light-olive/40 flex items-center justify-center text-2xl flex-shrink-0">{eventTypeIcons[event.event_type] ?? '📅'}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-1">{event.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(event.start_date)}</span>
                      {event.location && <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>}
                    </div>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">No events found.</div>
        )}
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={!!registerEvent}
        onClose={() => { setRegisterEvent(null); setRegistered(false) }}
        title="Event Registration"
        size="sm"
      >
        {selectedEvent && !registered && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{selectedEvent.title}</h3>
            <p className="text-gray-400 text-sm mb-5">{formatDate(selectedEvent.start_date)}</p>
            <div className="space-y-3 mb-6">
              <input placeholder="Full Name" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold" />
              <input placeholder="Email Address" type="email" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold" />
            </div>
            <Button fullWidth onClick={handleRegister}>Confirm Registration</Button>
          </div>
        )}
        {registered && (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-semibold text-primary text-lg mb-2">You're Registered!</h3>
            <p className="text-gray-500 text-sm">We've sent a confirmation email with event details.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
