import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Github } from 'lucide-react'
import usePosts from '../hooks/usePosts'
import { fmtDate } from '../lib/format'

// GitHub writeups are rendered here. Raw HTML inside markdown is NOT rendered (react-markdown escapes it),
// so content from a repo can't inject scripts into the site.
export default function Post() {
  const { slug } = useParams()
  const { status, data } = usePosts()
  const post = data?.posts.find((p) => p.slug === slug && p.source === 'github')
  const [md, setMd] = useState({ state: 'loading', text: '' })

  useEffect(() => {
    if (!post) return
    setMd({ state: 'loading', text: '' })
    fetch(`${import.meta.env.BASE_URL}posts/${post.slug}.md`).then((r) => { if (!r.ok) throw new Error(r.status); return r.text() })
      .then((text) => setMd({ state: 'ready', text })).catch(() => setMd({ state: 'error', text: '' }))
  }, [post?.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark"><ArrowLeft size={15} /> All writeups</Link>

  if (status === 'loading') return <section className="mx-auto max-w-3xl px-5 pb-24 pt-36"><div className="h-8 w-2/3 animate-pulse rounded bg-stone-100" /></section>
  if (!post) return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-36 text-center">
      <p className="label">Not found</p><h1 className="h2 mt-2">That writeup doesn't exist</h1><div className="mt-6">{back}</div>
    </section>
  )

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-28 md:pt-36">
      {back}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          {post.event && <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-dark">{post.event}</span>}
          <span className="font-mono text-xs text-stone-500">{fmtDate(post.date)} · {post.readingTime} min read</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight md:text-5xl">{post.title}</h1>
        {post.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{post.tags.map((t) => <span key={t} className="chip !px-2.5 !py-0.5 !text-xs">#{t}</span>)}</div>}
      </header>
      <div className="md mt-10">
        {md.state === 'loading' && <div className="space-y-3">{[90, 100, 70, 95].map((w, i) => <div key={i} className="h-4 animate-pulse rounded bg-stone-100" style={{ width: `${w}%` }} />)}</div>}
        {md.state === 'error' && <p className="text-stone-500">Couldn't load this writeup. <a className="text-accent underline" href={post.url} target="_blank" rel="noreferrer">Read it on GitHub</a>.</p>}
        {md.state === 'ready' && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}
            components={{ a: ({ node, ...p }) => <a {...p} target="_blank" rel="noreferrer" />, img: ({ node, ...p }) => <img {...p} loading="lazy" /> }}>
            {md.text}
          </ReactMarkdown>
        )}
      </div>
      <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-6">
        {back}
        <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-accent"><Github size={15} /> View source on GitHub</a>
      </footer>
    </article>
  )
}
