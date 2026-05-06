import { useRef, useState } from 'react'
import { Upload, Link, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// Requires a public Supabase Storage bucket named 'meal-images'.
// Create it at: Supabase Dashboard → Storage → New Bucket → name: meal-images → Public: ON
const BUCKET = 'meal-images'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = 'Image' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [tab, setTab] = useState<'upload' | 'url'>('upload')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) {
      setUploadError('Upload failed — make sure the "meal-images" bucket exists and is public.')
    } else if (data) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
      onChange(publicUrl)
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">{label}</label>

      {/* Tab toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-3 w-fit">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            tab === 'upload' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload size={12} /> Upload file
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            tab === 'url' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link size={12} /> Paste URL
        </button>
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-primary rounded-xl py-6 text-sm text-gray-400 hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Uploading…</span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-gray-300" />
                <span>Click to choose an image from your device</span>
                <span className="text-xs text-gray-300">JPG, PNG, WEBP · max 5 MB</span>
              </>
            )}
          </button>
          {uploadError && (
            <p className="text-xs text-red-500 mt-1.5">{uploadError}</p>
          )}
        </>
      )}

      {/* URL tab */}
      {tab === 'url' && (
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold"
        />
      )}

      {/* Preview */}
      {value && (
        <div className="mt-3 relative rounded-xl overflow-hidden h-36 bg-gray-100 group">
          <img
            src={value}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
