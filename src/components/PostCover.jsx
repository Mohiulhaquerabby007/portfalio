import { useState } from 'react'
import { topicOf } from '../lib/topic'

// Cover for a post. Uses the post's own image when it has one (relevant by definition); otherwise a generated
// cover built from the detected topic (icon, label, colour) — no third-party service involved.
export default function PostCover({ post, big = false }) {
  const [failed, setFailed] = useState(false)
  const { Icon, label, hue } = topicOf(post)

  if (post.thumbnail && !failed) {
    return <img src={post.thumbnail} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
  }
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 16%), hsl(${hue} 60% 38%))` }} aria-hidden>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <Icon strokeWidth={1.1} className={`absolute text-white/25 transition duration-500 group-hover:scale-110 ${big ? '-right-6 -top-6 h-56 w-56 md:h-72 md:w-72' : '-right-3 -top-3 h-28 w-28'}`} />
      <Icon strokeWidth={1.6} className={`absolute text-white/90 ${big ? 'bottom-5 right-6 h-10 w-10' : 'bottom-3 right-4 h-6 w-6'}`} />
      <span className={`absolute left-4 font-mono uppercase tracking-[0.18em] text-white/80 ${big ? 'bottom-5 text-sm' : 'bottom-3 text-[10px]'}`}>{label}</span>
    </div>
  )
}
