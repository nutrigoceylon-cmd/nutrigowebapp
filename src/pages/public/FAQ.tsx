import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import type { FAQItem } from '../../types'
import { supabase } from '../../lib/supabase'
import { Accordion } from '../../components/ui/Accordion'
import { Link } from 'react-router-dom'

export function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('faq_items').select('*').eq('is_published', true).order('sort_order').order('created_at')
      .then(({ data }) => setFaqs(data ?? []))
  }, [])

  const categories = Array.from(new Set(faqs.map(f => f.category)))

  const filtered = faqs.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = categories.reduce<Record<string, typeof filtered>>((acc, cat) => {
    const items = filtered.filter(f => f.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">Support</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-white/60 text-lg mb-8">Everything you need to know about NutriGo.</p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 text-sm outline-none focus:border-gold focus:bg-white/15 transition-colors"
            />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-16 text-gray-400">No questions match your search.</div>
        )}

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="font-serif text-xl font-bold text-primary mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-100" />
              {category}
              <span className="h-px flex-1 bg-gray-100" />
            </h2>
            <Accordion items={items} />
          </div>
        ))}

        {/* Contact CTA */}
        <div className="mt-16 bg-light-olive/40 rounded-2xl p-8 text-center">
          <h3 className="font-serif text-xl font-bold text-primary mb-3">Still Have Questions?</h3>
          <p className="text-gray-500 text-sm mb-6">Our team is here to help. Reach out and we'll get back to you within 24 hours.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
