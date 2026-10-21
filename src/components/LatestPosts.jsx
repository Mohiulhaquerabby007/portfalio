import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Reveal, Wrap } from './Sections'
import usePosts from '../hooks/usePosts'
import PostCover from './PostCover'
import { fmtDate } from '../lib/format'

const LIMIT = 3

// Compact card: no excerpt on purpose — the home page only teases, the full dashboard lives on /blog.
function PostCard({ post }) {
  const inSite = post.source === 'github'
  const cls = 'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-2xl hover:shadow-stone-900/10'
  const body = (
    <>
      <div className="relative -mx-6 -mt-6 mb-5 h-28 overflow-hidden">
        <PostCover post={post} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="label truncate">{post.event || (post.source === 'medium' ? 'Medium' : 'GitHub')}</span>
        <time dateTime={post.date} className="shrink-0 font-mono text-[11px] text-stone-400">{fmtDate(post.date)}</time>
      </div>
      <h3 className="mt-4 line-clamp-3 font-serif text-xl font-semibold leading-snug md:text-2xl">{post.title}</h3>
      <div className="mt-auto flex items-center justify-between pt-6 text-sm">
        <span className="text-xs text-stone-500">{post.readingTime} min read</span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-accent">Read more {inSite ? <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /> : <ArrowUpRight size={14} />}</span>
      </div>
    </>
  )
  return inSite
    ? <Link to={`/blog/${post.slug}`} className={cls}>{body}</Link>
    : <a href={post.url} target="_blank" rel="noreferrer" className={cls}>{body}</a>
}

export default function LatestPosts() {
  const { status, data } = usePosts()
  const posts = data?.posts.slice(0, LIMIT) ?? []

  return (
    <Wrap id="blog" num="05" kicker="Blog" title="Latest writeups.">
      {status === 'loading' && <div className="grid gap-4 md:grid-cols-3" aria-busy>{[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-stone-100" />)}</div>}
      {status !== 'loading' && posts.length === 0 && <p className="text-stone-500">No writeups published yet — check back soon.</p>}

      {posts.length > 0 && (
        <Reveal>
          {/* one row of equal cards: swipeable on phones, three across from md up */}
          <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
            {posts.map((p) => <div key={p.id} className="w-[82%] shrink-0 snap-start sm:w-[55%] md:w-auto"><PostCard post={p} /></div>)}
          </div>
        </Reveal>
      )}

      <Reveal className="mt-8">
        <Link to="/blog" className="btn border border-stone-300 bg-surface hover:border-ink">All writeups <ArrowRight size={16} /></Link>
      </Reveal>
    </Wrap>
  )
}
