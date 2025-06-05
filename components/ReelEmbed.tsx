interface ReelEmbedProps {
  embedUrl: string
  thumbnailUrl: string
  platform: 'tiktok' | 'instagram'
  title: string
  className?: string
  onClick?: () => void
}

export default function ReelEmbed({ embedUrl, thumbnailUrl, platform, title, className = '', onClick }: ReelEmbedProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 ${className}`}
      onClick={handleClick}
    >
      {/* Thumbnail Image */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Platform Badge */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
        <span className="text-white text-xs font-medium">
          {platform === 'tiktok' ? '🎵 TikTok' : '📷 Instagram'}
        </span>
      </div>
      
      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
        </div>
      </div>
      
      {/* Bottom Text Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-white text-xs font-medium opacity-90">
          Click to view on {platform === 'tiktok' ? 'TikTok' : 'Instagram'}
        </div>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200" />
    </div>
  )
} 