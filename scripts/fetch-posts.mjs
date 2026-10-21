// Build-time fetcher for /blog.
//   Medium  -> RSS feed (latest ~10 stories; Medium doesn't allow browser CORS, so this runs in Node)
//   GitHub  -> every .md file in a repo (folder name = event), rendered in-site at /blog/:slug
// Output: public/posts.json (+ public/posts/<slug>.md). If a source can't be reached the previous
// snapshot is kept, so an offline build never wipes the blog. Optional: GITHUB_TOKEN raises API limits.
import { mkdir, readFile, rm, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONFIG = process.env.BLOG_CONFIG || path.join(ROOT, 'blog.config.json')
const OUT = process.env.BLOG_OUT || path.join(ROOT, 'public')
const UA = 'Mozilla/5.0 (portfolio-blog-fetcher)'

/* ───────── pure helpers (exported for testing) ───────── */
export const slugify = (s) => s.toLowerCase().replace(/\.md$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'post'

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&hellip;': '…' }
export const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|nbsp|hellip);/g, (m) => ENTITIES[m])
export const stripHtml = (h) => decode(h.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
const readingTime = (text) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200))
const clip = (s, n = 200) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s)

export function parseFrontMatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { meta: {}, body: md }
  const meta = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim().replace(/^["']|["']$/g, '')
    if (/^\[.*\]$/.test(kv[2].trim())) v = kv[2].trim().slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    meta[kv[1].toLowerCase()] = v
  }
  return { meta, body: md.slice(m[0].length) }
}

export function parseMedium(xml, handle) {
  const field = (block, tag) => block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))?.[1]?.trim()
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, b]) => {
    const title = decode(field(b, 'title') || 'Untitled')
    const link = (field(b, 'link') || '').split('?')[0]
    const html = field(b, 'content:encoded') || ''
    const text = stripHtml(html)
    const lead = stripHtml(html.replace(/^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i, '')) // summary without the repeated heading
    const img = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((x) => x[1]).find((u) => !u.includes('/_/stat'))
    const tags = [...b.matchAll(/<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/g)].map((x) => decode(x[1].trim()))
    const date = new Date(field(b, 'pubDate') || Date.now()).toISOString()
    return { id: `medium-${slugify(link.split('/').pop() || title)}`, source: 'medium', title, url: link, date, summary: clip(lead),
      tags, event: null, thumbnail: img || null, readingTime: readingTime(text), handle }
  })
}

// Resolve relative images/links in a GitHub markdown file so they work when rendered on this site.
export function rewriteRelative(md, { user, repo, branch, dir }) {
  const raw = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/`
  const blob = `https://github.com/${user}/${repo}/blob/${branch}/`
  const abs = (base, p) => base + path.posix.normalize(path.posix.join(dir, p.replace(/^\.?\//, '')))
  const isRel = (u) => !/^([a-z]+:|#|\/\/)/i.test(u)
  return md
    .replace(/(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g, (m, a, u, c) => (isRel(u) ? a + abs(raw, u) + c : m))
    .replace(/(?<!!)(\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g, (m, a, u, c) => (isRel(u) ? a + abs(blob, u) + c : m))
}

export function buildGithubPost({ file, md, user, repo, branch, commitDate, fallbackDate }) {
  const { meta, body: rawBody } = parseFrontMatter(md)
  if (String(meta.draft).toLowerCase() === 'true') return null
  const segs = file.split('/')
  const base = segs[segs.length - 1].replace(/\.md$/i, '')
  const isReadme = /^readme$/i.test(base)
  let body = rawBody
  let title = meta.title
  if (!title) {
    const h1 = body.match(/^\s*#\s+(.+?)\s*$/m)
    if (h1) { title = h1[1]; body = body.replace(h1[0], '').replace(/^\s+/, '') }
  }
  title ||= (isReadme ? segs[segs.length - 2] || 'Untitled' : base).replace(/[-_]+/g, ' ')
  const dir = segs.slice(0, -1).join('/')
  body = rewriteRelative(body, { user, repo, branch, dir })
  const plain = body.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#>*_`~|-]+/g, ' ').replace(/\s+/g, ' ').trim()
  const firstPara = body.split(/\n\s*\n/).map((p) => p.trim()).find((p) => p && !/^(#|```|!\[|\||[-*] )/.test(p)) || ''
  const img = body.match(/!\[[^\]]*\]\(([^)\s]+)/)?.[1] || null
  const folder = segs.length > 1 ? segs[0] : null
  const date = (() => { const d = new Date(meta.date || commitDate || fallbackDate || Date.now()); return Number.isNaN(+d) ? new Date().toISOString() : d.toISOString() })()
  const tags = Array.isArray(meta.tags) ? meta.tags : typeof meta.tags === 'string' ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
  const slug = slugify(file)
  return {
    post: { id: `github-${slug}`, source: 'github', slug, title: decode(title), url: `https://github.com/${user}/${repo}/blob/${branch}/${file}`, date,
      summary: clip(meta.summary || firstPara.replace(/[*_`]/g, '') || plain), tags, event: meta.event || folder, thumbnail: img, readingTime: readingTime(plain) },
    body,
  }
}

/* ───────── network ───────── */
const ghFetch = (url) => fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) } })
const ghJson = async (url) => { const r = await ghFetch(url); if (!r.ok) throw Object.assign(new Error(`${r.status} ${url}`), { status: r.status }); return r.json() }

async function fetchMedium(handle) {
  const r = await fetch(`https://medium.com/feed/${handle}`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
  if (!r.ok) throw new Error(`Medium feed returned ${r.status}`)
  return parseMedium(await r.text(), handle)
}

async function fetchGithub({ user, repo, path: sub = '' }) {
  const meta = await ghJson(`https://api.github.com/repos/${user}/${repo}`)
  const branch = meta.default_branch
  let tree
  try { tree = await ghJson(`https://api.github.com/repos/${user}/${repo}/git/trees/${branch}?recursive=1`) }
  catch (e) { if (e.status === 409) return { posts: [], bodies: {}, note: 'repository is empty' }; throw e }
  const prefix = sub ? sub.replace(/^\/|\/$/g, '') + '/' : ''
  const files = tree.tree.filter((t) => t.type === 'blob' && /\.md$/i.test(t.path) && t.path.startsWith(prefix)
    && !/^readme\.md$/i.test(t.path.slice(prefix.length)) && !t.path.split('/').some((s) => s.startsWith('.') || s.startsWith('_')))
  const posts = [], bodies = {}
  for (const f of files) {
    const rel = f.path.slice(prefix.length)
    const md = await (await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/${f.path}`, { headers: { 'User-Agent': UA } })).text()
    let commitDate = null
    if (!parseFrontMatter(md).meta.date) try { commitDate = (await ghJson(`https://api.github.com/repos/${user}/${repo}/commits?path=${encodeURIComponent(f.path)}&per_page=1`))[0]?.commit?.committer?.date } catch { /* falls back to repo push date */ }
    const built = buildGithubPost({ file: rel, md, user, repo, branch, commitDate, fallbackDate: meta.pushed_at })
    if (built) { posts.push({ ...built.post, url: `https://github.com/${user}/${repo}/blob/${branch}/${f.path}` }); bodies[built.post.slug] = built.body }
  }
  return { posts, bodies, note: files.length ? null : 'no .md files found' }
}

async function fetchLocal(dir) {
  if (!existsSync(dir)) return { posts: [], bodies: {} }
  const posts = [], bodies = {}
  async function walk(d, relPrefix = '') {
    const list = await readdir(d, { withFileTypes: true })
    for (const ent of list) {
      const full = path.join(d, ent.name)
      const rel = relPrefix ? `${relPrefix}/${ent.name}` : ent.name
      if (ent.isDirectory()) {
        await walk(full, rel)
      } else if (/\.md$/i.test(ent.name) && !/^readme\.md$/i.test(ent.name)) {
        const md = await readFile(full, 'utf8')
        const built = buildGithubPost({
          file: rel,
          md,
          user: 'Mohiulhaquerabby007',
          repo: 'portfolio',
          branch: 'main',
          fallbackDate: new Date().toISOString(),
        })
        if (built) {
          posts.push({ ...built.post, source: 'github', url: `https://github.com/Mohiulhaquerabby007/portfolio/blob/main/posts/${rel}` })
          bodies[built.post.slug] = built.body
        }
      }
    }
  }
  await walk(dir)
  return { posts, bodies }
}

/* ───────── main ───────── */
async function main() {
  const cfg = JSON.parse(await readFile(CONFIG, 'utf8'))
  const file = path.join(OUT, 'posts.json')
  const previous = existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : null
  const sources = {}
  const posts = []
  let bodies = null
  let failed = false

  const localDir = path.join(ROOT, 'posts')
  if (existsSync(localDir)) {
    try {
      const loc = await fetchLocal(localDir)
      if (loc.posts.length) {
        posts.push(...loc.posts)
        bodies = { ...(bodies || {}), ...loc.bodies }
        sources.local = { ok: true, count: loc.posts.length }
      }
    } catch (e) {
      console.warn(`[posts] Local failed: ${e.message}`)
    }
  }

  if (cfg.medium) {
    try { const p = await fetchMedium(cfg.medium); posts.push(...p); sources.medium = { handle: cfg.medium, ok: true, count: p.length } }
    catch (e) { failed = true; console.warn(`[posts] Medium failed: ${e.message}`); sources.medium = { handle: cfg.medium, ok: false, count: 0, error: e.message } }
  }
  if (cfg.github?.repo) {
    const label = `${cfg.github.user}/${cfg.github.repo}`
    try { const r = await fetchGithub(cfg.github); posts.push(...r.posts); bodies = r.bodies; sources.github = { repo: label, ok: true, count: r.posts.length, note: r.note || null } }
    catch (e) { failed = true; console.warn(`[posts] GitHub failed: ${e.message}`); sources.github = { repo: label, ok: false, count: 0, error: e.message } }
  }

  // A source was unreachable (offline, rate limit): keep the last good snapshot instead of publishing a half-empty blog.
  if (failed && previous) { console.warn('[posts] keeping previous snapshot'); return }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  // `generatedAt` is the time the content last CHANGED, so a run that finds nothing new leaves every file byte-identical
  // (lets CI skip the commit and avoids pointless redeploys).
  const same = previous && JSON.stringify({ sources: previous.sources, posts: previous.posts }) === JSON.stringify({ sources, posts })
  await mkdir(OUT, { recursive: true })
  if (bodies) {
    const dir = path.join(OUT, 'posts')
    await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true })
    for (const [slug, body] of Object.entries(bodies)) await writeFile(path.join(dir, `${slug}.md`), body)
  }
  await writeFile(file, JSON.stringify({ generatedAt: same ? previous.generatedAt : new Date().toISOString(), sources, posts }, null, 2))
  console.log(`[posts] ${posts.length} post(s) ${same ? '(unchanged)' : '(updated)'} — ` + Object.entries(sources).map(([k, v]) => `${k}: ${v.ok ? v.count : 'FAILED'}${v.note ? ` (${v.note})` : ''}`).join(', '))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.warn('[posts] skipped:', e.message); process.exit(0) })
