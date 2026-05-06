import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Clock } from 'lucide-react'
import type { Article } from '../../types'
import { supabase } from '../../lib/supabase'
import { formatDateShort, truncate } from '../../lib/helpers'

const categories = ['All', 'Nutrition Science', 'Fitness & Performance', 'Gut Health', 'Lifestyle']

export function Articles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    supabase.from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false })
      .then(({ data }) => setArticles(data ?? []))
  }, [])

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || (a.excerpt ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || a.category === category
    return matchSearch && matchCat
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div>
      {/* Header */}
      <section className="bg-light-olive/30 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">Educational Hub</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Nutrition Articles</h1>
          <p className="text-gray-500 text-lg mb-8">Evidence-based insights from our team of nutritionists and health experts.</p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all cursor-pointer ${
                category === cat
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">No articles found matching your search.</div>
        )}

        {/* Featured */}
        {featured && (
          <Link to={`/articles/${featured.slug}`} className="group block mb-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              {featured.image_url && <img src={featured.image_url} alt={featured.title} className="w-full h-64 lg:h-80 object-cover" />}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full">{featured.category}</span>
                  <span className="text-gray-400 text-xs">Featured</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary group-hover:text-gold transition-colors mb-3">{featured.title}</h2>
                <p className="text-gray-500 leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{featured.published_at ? formatDateShort(featured.published_at) : ''}</span>
                  <Clock size={14} />
                  <span>5 min read</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Article Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(article => (
              <Link key={article.id} to={`/articles/${article.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                {article.image_url && <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover" />}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-light-olive text-olive text-xs font-medium rounded-full">{article.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base group-hover:text-primary transition-colors mb-2 leading-snug">
                    {truncate(article.title, 70)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{truncate(article.excerpt ?? '', 100)}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{article.published_at ? formatDateShort(article.published_at) : ''}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
