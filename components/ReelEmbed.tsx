interface ReelEmbedProps {
  embedUrl: string
  platform: 'tiktok' | 'instagram'
  title: string
  className?: string
}

export default function ReelEmbed({ embedUrl, platform, title, className = '' }: ReelEmbedProps) {
  if (platform === 'tiktok') {
    // TikTok embed placeholder - v produkci by se použilo TikTok embed API
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🎵</div>
            <div className="font-bold text-lg">TikTok</div>
            <div className="text-sm opacity-90 px-4 mt-2">{title}</div>
            <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              Click to view on TikTok
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (platform === 'instagram') {
    // Instagram embed placeholder - v produkci by se použilo Instagram embed API  
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">📷</div>
            <div className="font-bold text-lg">Instagram</div>
            <div className="text-sm opacity-90 px-4 mt-2">{title}</div>
            <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              Click to view on Instagram
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
} 