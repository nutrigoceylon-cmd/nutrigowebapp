import { useEffect, useState } from 'react'
import { ExternalLink, Play, Clock, Headphones } from 'lucide-react'
import type { Podcast } from '../../types'
import { supabase } from '../../lib/supabase'
import { formatDateShort, formatDuration } from '../../lib/helpers'

export function Podcast() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])

  useEffect(() => {
    supabase.from('podcasts').select('*').eq('is_published', true).order('episode_number', { ascending: false })
      .then(({ data }) => setPodcasts(data ?? []))
  }, [])

  const latest = podcasts[0]
  const episodes = podcasts.slice(1)

  return (
    <div>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Headphones size={28} className="text-white" />
          </div>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">Audio Content</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">The NutriGo Podcast</h1>
          <p className="text-white/60 text-lg">Deep-dive conversations on nutrition, performance, and the science of healthy living. New episodes weekly.</p>
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium">
              {podcasts.length} published episode{podcasts.length === 1 ? '' : 's'}
            </div>
            {latest && (
              <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium">
                Latest: Ep. {latest.episode_number}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Latest Episode */}
        {latest && (
          <div className="mb-14">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-6">Latest Episode</p>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {latest.image_url
                  ? <img src={latest.image_url} alt={latest.title} className="w-full h-full object-cover min-h-48" />
                  : <div className="w-full min-h-48 bg-light-olive/40 flex items-center justify-center"><Headphones size={48} className="text-sage" /></div>
                }
                <div className="md:col-span-2 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                      <span className="font-medium text-gold">Ep. {latest.episode_number}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={13} />{formatDuration(latest.duration)}</span>
                      <span>·</span>
                      <span>{latest.published_at ? formatDateShort(latest.published_at) : ''}</span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-3">{latest.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">{latest.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={latest.audio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                    >
                      <Play size={16} />
                      Watch on YouTube
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Episode List */}
        {episodes.length > 0 && (
          <div>
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-6">All Episodes</p>
            <div className="space-y-4">
              {episodes.map(ep => (
                <div key={ep.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-5 hover:shadow-sm transition-shadow">
                  {ep.image_url
                    ? <img src={ep.image_url} alt={ep.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-16 h-16 rounded-xl bg-light-olive/40 flex items-center justify-center flex-shrink-0"><Headphones size={20} className="text-sage" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <span className="font-medium text-gold">Ep. {ep.episode_number}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{formatDuration(ep.duration)}</span>
                      <span>·</span>
                      <span>{ep.published_at ? formatDateShort(ep.published_at) : ''}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{ep.title}</h3>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">{ep.description}</p>
                  </div>
                  <a
                    href={ep.audio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-primary hover:bg-secondary text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Play size={15} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {podcasts.length === 0 && (
          <div className="text-center py-20 text-gray-400">No episodes published yet.</div>
        )}
      </div>
    </div>
  )
}
