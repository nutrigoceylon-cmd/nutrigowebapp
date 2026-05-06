import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Share2, Tag } from 'lucide-react'
import type { Article } from '../../types'
import { supabase } from '../../lib/supabase'
import { formatDate, truncate } from '../../lib/helpers'

export function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null | undefined>(undefined)
  const [related, setRelated] = useState<Article[]>([])

  useEffect(() => {
    if (!slug) return
    supabase.from('articles').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data }) => {
        setArticle(data ?? null)
        if (data) {
          supabase.from('articles').select('*').eq('is_published', true).eq('category', data.category).neq('id', data.id).limit(3)
            .then(({ data: rel }) => setRelated(rel ?? []))
        }
      })
  }, [slug])

  if (article === undefined) return null

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-primary mb-4">Article Not Found</h1>
        <Link to="/articles" className="text-gold hover:text-gold-dark">← Back to Articles</Link>
      </div>
    )
  }

  return (
    <div>
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {article.image_url
          ? <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-light-olive/40" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 bg-gold text-white text-xs font-semibold rounded-full mb-3">{article.category}</span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">{article.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Back */}
        <Link to="/articles" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Articles
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-5 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100 flex-wrap">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{article.published_at ? formatDate(article.published_at) : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>5 min read</span>
          </div>
          <button className="ml-auto flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer">
            <Share2 size={15} /> Share
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none mb-12">
          {article.content.split('\n\n').map((para, i) => {
            if (para.startsWith('## ')) {
              return <h2 key={i} className="font-serif text-xl font-bold text-primary mt-8 mb-3">{para.replace('## ', '')}</h2>
            }
            if (para.startsWith('**') && para.endsWith('**')) {
              return <p key={i} className="font-semibold text-gray-800 mb-2">{para.replace(/\*\*/g, '')}</p>
            }
            if (para.startsWith('- ')) {
              return (
                <ul key={i} className="list-disc list-inside text-gray-600 leading-relaxed mb-4 space-y-1">
                  {para.split('\n').map((line, j) => (
                    <li key={j}>{line.replace(/^- \*\*[^*]+\*\*: /, match => match.replace(/\*\*/g, ''))}</li>
                  ))}
                </ul>
              )
            }
            return <p key={i} className="text-gray-600 leading-relaxed mb-4">{para}</p>
          })}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-12 pb-8 border-b border-gray-100">
            <Tag size={15} className="text-gray-400" />
            {article.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-light-olive text-olive text-xs font-medium rounded-full capitalize">{tag}</span>
            ))}
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h3 className="font-serif text-xl font-bold text-primary mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rel => (
                <Link key={rel.id} to={`/articles/${rel.slug}`} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  {rel.image_url && <img src={rel.image_url} alt={rel.title} className="w-full h-32 object-cover" />}
                  <div className="p-3">
                    <p className="text-xs text-gold font-medium mb-1">{rel.category}</p>
                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors leading-snug">
                      {truncate(rel.title, 60)}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
