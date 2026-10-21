import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, CircleAlert, FileText, Github, RefreshCw, Search, X } from 'lucide-react'
import usePosts from '../hooks/usePosts'
import PostCover from '../components/PostCover'
import { fmtDate } from '../lib/format'


const SRC = {
  medium: { label: 'Medium', Icon: BookOpen, cls: 'bg-stone-500/15 text-stone-600' },
  github: { label: 'GitHub', Icon: Github, cls: 'bg-accent-soft text-accent-dark' },
}

function SourceBadge({ source }) {
  const { label, Icon, cls } = SRC[source]
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${cls}`}><Icon size={11} />{label}</span>
}

/* ───────── one post in the bento grid ───────── */
function PostTile({ post, size }) {
  const feature = size === 'feature'
  const cls = `group relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-2xl hover:shadow-stone-900/10 ${feature ? 'sm:col-span-2 lg:row-span-2' : size === 'wide' ? 'sm:col-span-2' : ''}`
  const body = (
    <>
      <div className={`relative overflow-hidden ${feature ? 'min-h-48 flex-1' : 'h-28 shrink-0'}`}>
        <PostCover post={post} big={feature} />
        {feature && (post.event || post.tags?.[0]) && <span className="pointer-events-none absolute bottom-5 left-6 right-6 truncate font-serif text-4xl font-extrabold leading-none text-white/20 md:text-6xl" aria-hidden>{post.event || post.tags[0]}</span>}
        {post.event && <span className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">{post.event}</span>}
      </div>
      <div className={`flex flex-col p-5 ${feature ? '' : 'flex-1'}`}>
        <div className="mb-2 flex items-center justify-between gap-2"><SourceBadge source={post.source} /><span className="font-mono text-[11px] text-stone-400">{post.readingTime} min read</span></div>
        <h3 className={`font-serif font-semibold leading-snug ${feature ? 'text-2xl md:text-3xl' : 'text-lg'}`}>{post.title}</h3>
        {post.summary && <p className={`mt-2 text-sm text-stone-600 ${feature ? 'line-clamp-5' : 'line-clamp-3'}`}>{post.summary}</p>}
        {post.tags?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{post.tags.slice(0, feature ? 6 : 3).map((t) => <span key={t} className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">#{t}</span>)}</div>}
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-stone-400">
          <span>{fmtDate(post.date)}</span>
          <ArrowUpRight size={16} className="text-accent transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </>
  )
  return post.source === 'github'
    ? <Link to={`/blog/${post.slug}`} className={cls}>{body}</Link>
    : <a href={post.url} target="_blank" rel="noreferrer" className={cls}>{body}</a>
}

/* ───────── stats & sources ───────── */
const Stat = ({ label, value, sub }) => (
  <div className="tile !p-4 md:!p-5">
    <p className="label mb-2">{label}</p>
    <p className="font-serif text-3xl font-semibold text-accent md:text-4xl">{value}</p>
    {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
  </div>
)

function SourcesTile({ data }) {
  const rows = [
    data.sources.medium && { key: 'medium', name: `Medium ${data.sources.medium.handle}`, s: data.sources.medium },
    data.sources.github && { key: 'github', name: `GitHub ${data.sources.github.repo}`, s: data.sources.github },
    data.sources.local && { key: 'local', name: 'Articles & Writeups', s: data.sources.local },
  ].filter(Boolean)
  return (
    <div className="tile col-span-2 !p-5">
      <p className="label mb-3">Sources</p>
      <ul className="space-y-2.5">
        {rows.map(({ key, name, s }) => (
          <li key={key} className="flex items-start gap-2.5 text-sm">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="min-w-0"><span className="block truncate font-medium">{name}</span>
              <span className="block text-xs text-stone-500">{s.ok ? `${s.count} ${s.count === 1 ? 'post' : 'posts'}${s.note ? ` · ${s.note}` : ''}` : `couldn't sync (${s.error}) — showing last saved`}</span></span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-stone-400"><RefreshCw size={12} /> Last updated {new Date(data.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} · checked hourly</p>
    </div>
  )
}

/* ───────── empty state doubles as setup guide ───────── */
function EmptyState({ data }) {
  const gh = data?.sources?.github?.repo || 'your-user/writeup'
  const handle = data?.sources?.medium?.handle || '@your-handle'
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="tile lg:col-span-2 lg:row-span-2 !p-8">
        <FileText className="text-accent" size={32} />
        <h2 className="mt-4 font-serif text-3xl font-semibold">No writeups published yet</h2>
        <p className="mt-3 text-stone-600">This page fills itself in. Publish a story on Medium or push a markdown file to your GitHub writeup repo, and it shows up here as a tile within the hour — no code changes needed.</p>
      </div>
      <div className="tile lg:col-span-2">
        <p className="label mb-2">Option A · Medium</p>
        <p className="font-semibold">Publish a story at <span className="font-mono text-sm text-accent">medium.com/{handle}</span></p>
        <p className="mt-2 text-sm text-stone-600">Title, tags, cover image, date and a summary are read from the feed. Tags become filters. Readers are sent to Medium.</p>
      </div>
      <div className="tile lg:col-span-2">
        <p className="label mb-2">Option B · GitHub</p>
        <p className="font-semibold">Push a <span className="font-mono text-sm">.md</span> file to <span className="font-mono text-sm text-accent">{gh}</span></p>
        <p className="mt-2 text-sm text-stone-600">Use a folder per event (<span className="font-mono text-xs">BCS-CTF-2026/web-ssti.md</span>). Optional front matter:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-stone-100 p-3 font-mono text-xs text-stone-700">{`---
title: Web 3 — SSTI
date: 2026-09-27
tags: [web, ssti]
---`}</pre>
      </div>
    </div>
  )
}

/* ───────── page ───────── */
export default function Blog() {
  const { status, data } = usePosts()
  const [q, setQ] = useState('')
  const [src, setSrc] = useState('all')
  const [topic, setTopic] = useState(null)
  const posts = data?.posts ?? []

  const topics = useMemo(() => {
    const m = new Map()
    posts.forEach((p) => new Set([p.event, ...(p.tags || [])].filter(Boolean)).forEach((t) => m.set(t, (m.get(t) || 0) + 1)))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14)
  }, [posts])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return posts.filter((p) => (src === 'all' || p.source === src)
      && (!topic || p.event === topic || p.tags?.includes(topic))
      && (!needle || `${p.title} ${p.summary} ${p.event || ''} ${(p.tags || []).join(' ')}`.toLowerCase().includes(needle)))
  }, [posts, q, src, topic])

  const events = new Set(posts.map((p) => p.event).filter(Boolean)).size
  const minutes = posts.reduce((n, p) => n + (p.readingTime || 0), 0)
  const hasFilters = q || src !== 'all' || topic

  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:pt-36">
      <p className="kicker">Blog</p>
      <h1 className="h2 max-w-3xl">Writeups &amp; notes from the field.</h1>
      <p className="mt-3 max-w-2xl text-stone-600">CTF writeups, bug-bounty notes and write-ups pulled live from Medium and GitHub into one dashboard.</p>

      {status === 'loading' && <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy>{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-stone-100" />)}</div>}

      {status === 'error' && (
        <div className="tile mt-10 flex items-start gap-3"><CircleAlert className="shrink-0 text-red-500" />
          <p className="text-sm text-stone-600">Couldn't load <span className="font-mono">posts.json</span>. Run <span className="font-mono">npm run posts</span> to generate it, then reload.</p></div>
      )}

      {status === 'ready' && (
        <>
          <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            <Stat label="Writeups" value={posts.length} sub={`${posts.filter((p) => p.source === 'medium').length} Medium · ${posts.filter((p) => p.source === 'github').length} GitHub`} />
            <Stat label="Events covered" value={events || '—'} sub={events ? 'from repo folders' : 'tag by folder or front matter'} />
            <Stat label="Latest" value={posts[0] ? fmtDate(posts[0].date).replace(/, \d{4}/, '') : '—'} sub={posts[0] ? new Date(posts[0].date).getFullYear() : ''} />
            <Stat label="Reading time" value={minutes ? `${minutes} min` : '—'} sub="across all posts" />
            <SourcesTile data={data} />
            <div className="tile col-span-2 !p-5">
              <p className="label mb-3">Browse by topic</p>
              {topics.length === 0 ? <p className="text-sm text-stone-500">Topics appear here once posts have an event folder or tags.</p> : (
                <div className="flex flex-wrap gap-1.5">
                  {topics.map(([t, n]) => (
                    <button key={t} onClick={() => setTopic(topic === t ? null : t)} aria-pressed={topic === t}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${topic === t ? 'border-accent bg-accent text-paper' : 'border-stone-200 text-stone-600 hover:border-accent'}`}>{t} <span className="opacity-60">{n}</span></button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {posts.length === 0 ? <div className="mt-8"><EmptyState data={data} /></div> : (
            <>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <label className="relative w-full sm:w-auto sm:min-w-[18rem] sm:max-w-sm sm:flex-1">
                  <span className="sr-only">Search writeups</span>
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, tag, event…"
                    className="w-full rounded-full border border-stone-300 bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15" />
                </label>
                <div role="tablist" className="flex gap-2">
                  {[['all', 'All'], ['medium', 'Medium'], ['github', 'GitHub']].map(([k, l]) => (
                    <button key={k} role="tab" aria-selected={src === k} onClick={() => setSrc(k)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${src === k ? 'bg-ink text-paper' : 'border border-stone-200 bg-surface text-stone-600 hover:border-ink'}`}>{l}</button>
                  ))}
                </div>
                {hasFilters && <button onClick={() => { setQ(''); setSrc('all'); setTopic(null) }} className="inline-flex items-center gap-1 text-sm font-medium text-accent"><X size={14} /> Clear</button>}
                <span className="ml-auto font-mono text-xs text-stone-400">{filtered.length} / {posts.length}</span>
              </div>

              {filtered.length === 0
                ? <p className="mt-10 text-center text-stone-500">No writeups match those filters.</p>
                : (
                  <div className="mt-6 grid auto-rows-[minmax(14rem,auto)] grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {filtered.map((p, i) => <PostTile key={p.id} post={p} size={i === 0 ? 'feature' : i % 6 === 3 ? 'wide' : 'std'} />)}
                  </div>
                )}
            </>
          )}
        </>
      )}
    </section>
  )
}
