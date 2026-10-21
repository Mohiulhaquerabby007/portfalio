import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import Home from './pages/Home'
// Blog pages pull in the markdown renderer, so load them only when visited.
const Blog = lazy(() => import('./pages/Blog'))
const Post = lazy(() => import('./pages/Post'))
import { PROFILE, SECTIONS } from './data'

// Home sections, with the Blog route slotted in before Contact.
const NAV = [
  ...SECTIONS.filter((s) => s.id !== 'hero' && s.id !== 'contact').map((s) => ({ ...s, to: `/#${s.id}` })),
  { id: 'blog', label: 'Blog', to: '/blog' },
  { id: 'contact', label: 'Contact', to: '/#contact' },
]

// Hash links need help from the router: scroll to the element after navigating, or to the top on a new page.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0, behavior: 'instant' }); return }
    const go = () => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    const t = setTimeout(go, 60) // the target may mount just after the route changes
    return () => clearTimeout(t)
  }, [pathname, hash])
  return null
}

function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-40 text-center">
      <p className="label">404</p>
      <h1 className="h2 mt-2">Page not found</h1>
      <Link to="/" className="btn mt-8 bg-ink text-paper hover:bg-teal-800">Back to home</Link>
    </section>
  )
}

export default function PortfolioApp() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  // Dark by default; choice is saved. index.html applies it before first paint.
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'dark' ? '#0a0a0b' : '#faf9f7')
    try { localStorage.setItem('theme', theme) } catch { /* storage blocked */ }
  }, [theme])
  useEffect(() => setOpen(false), [pathname])

  const toggle = (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 text-stone-600 transition hover:border-accent hover:text-accent">
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
  const linkCls = (n) => `rounded-full px-3 py-1.5 text-sm transition hover:bg-stone-100 hover:text-ink ${n.id === 'blog' && pathname.startsWith('/blog') ? 'bg-stone-100 font-medium text-ink' : 'text-stone-600'}`

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed inset-x-0 top-0 z-30 px-4 pt-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-stone-200/80 bg-surface/80 px-4 py-2 shadow-sm backdrop-blur-lg">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-paper">{PROFILE.handle[0]}</span>
            {PROFILE.handle}
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => <Link key={n.id} to={n.to} className={linkCls(n)}>{n.label}</Link>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {toggle}
            <Link to="/#contact" className="btn !py-2 bg-ink text-paper hover:bg-teal-800">Hire / Contact</Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">{toggle}
            <button className="grid h-9 w-9 place-items-center rounded-full" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button></div>
        </div>
        {open && (
          <nav className="mx-auto mt-2 max-w-6xl rounded-3xl border border-stone-200 bg-surface p-3 shadow-lg md:hidden">
            {NAV.map((n) => <Link key={n.id} to={n.to} className="block rounded-xl px-4 py-3 text-stone-700 hover:bg-stone-50">{n.label}</Link>)}
          </nav>
        )}
      </header>

      <ScrollManager />
      <main id="top" className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Post />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <footer className="border-t border-stone-200 px-6 py-8 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {PROFILE.name} · Built with React &amp; Tailwind
      </footer>
    </div>
  )
}
