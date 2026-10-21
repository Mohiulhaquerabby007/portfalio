import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import {
  Activity, ArrowUpRight, Award, Building2, ClipboardCheck, Database, Landmark, GraduationCap, Github, Linkedin, Mail, MapPin,
  Send, Smartphone, Shield, Wrench, Code2, Monitor, Terminal, Phone,
} from 'lucide-react'
import {
  CERTIFICATIONS, CONTACT_EMAIL, CONTESTS, COURSES, EDUCATION, GROUP_COLOR, HERO, MEDALS, ORGANIZATIONS, OVERVIEW, PROFILE, PROJECTS,
  SKILLS, SKILL_GROUPS, STATS,
} from '../data'

export const CodeforcesIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="9.5" width="4.5" height="11.5" rx="1.5" fill="#FFC107" />
    <rect x="9.75" y="3.5" width="4.5" height="17.5" rx="1.5" fill="#2196F3" />
    <rect x="17.5" y="14" width="4.5" height="7" rx="1.5" fill="#F44336" />
  </svg>
)

/* ───────── helpers ───────── */
export const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.55, delay }}>
    {children}
  </motion.div>
)

// Report-style section header: "§ 02 / ACHIEVEMENTS"
export const Wrap = ({ id, num, kicker, title, intro, children, className = '' }) => (
  <section id={id} className={`mx-auto max-w-6xl px-5 py-14 md:py-24 ${className}`}>
    <Reveal>
      <p className="kicker">§ {num} / {kicker}</p>
      <h2 className="h2 max-w-3xl">{title}</h2>
      {intro && <p className="mt-3 max-w-2xl text-stone-600">{intro}</p>}
    </Reveal>
    <div className="mt-8 md:mt-10">{children}</div>
  </section>
)

function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, to])
  return <span ref={ref}>{v}{suffix}</span>
}

/* ───────── Contest names flying out from behind the photo ───────── */
// Each name starts small and faint at the centre ("far away"), then grows and fades as it moves outward.
function ContestFlight() {
  const names = useMemo(() => {
    const clean = (n) => n.replace(/\s*\(.*\)/, '')
    return [...CONTESTS.international, ...CONTESTS.national, ...CONTESTS.programming].slice(0, 10).map((c) => clean(c[0]))
  }, [])
  const DURATION = 12
  const LANES = [-185, 95, -75, 175, -135, 35, -20, 140, -165, 60]
  return (
    <div className="flight pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {names.map((n, i) => {
        const side = i % 2 === 0 ? 1 : -1
        const tx = side * (240 + ((i * 53) % 160))
        return (
          <span key={n} className={`flight-item font-serif font-bold ${i % 3 === 0 ? 'text-accent-dark' : 'text-ink'}`}
            style={{ '--tx': `${tx}px`, '--ty': `${LANES[i % LANES.length]}px`, animationDuration: `${DURATION}s`, animationDelay: `${-(i * DURATION) / names.length}s` }}>
            {n}
          </span>
        )
      })}
    </div>
  )
}

/* ───────── Hero: giant name, photo overlapping the letters ───────── */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-28">
      <div className="bg-dots mask-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="relative min-h-[37rem] md:min-h-[40rem]">
          <h1 className="giant pointer-events-none absolute inset-x-0 top-[3%] z-0 select-none text-center" aria-label={PROFILE.name}>
            {(([first, ...rest]) => <><span className="block md:inline" aria-hidden>{first}</span>{' '}<span className="block md:inline" aria-hidden>{rest.join(' ')}</span></>)(HERO.display_name.split(' '))}
          </h1>
          <ContestFlight />
          <img src={`${import.meta.env.BASE_URL}me.png`} alt={PROFILE.name}
            className="photo-fade absolute bottom-0 left-1/2 z-10 h-[26rem] w-auto max-w-none -translate-x-1/2 object-contain object-bottom md:h-[37rem]" />
        </div>

        {/* intro row under the photo */}
        <div className="relative z-20 -mt-6 grid items-end gap-6 pb-14 md:grid-cols-[1.2fr_1fr] md:pb-20">
          <div>
            <p className="label mb-2">Role</p>
            <p className="font-serif text-2xl leading-snug md:text-3xl">{PROFILE.subtitle.split(' | ').join(' · ')}</p>
            <p className="mt-2 text-stone-600">@{PROFILE.handle} — {HERO.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <a href="#achievements" className="btn bg-ink text-paper hover:bg-teal-800">See achievements <ArrowUpRight size={16} /></a>
            <a href="#contact" className="btn border border-stone-300 bg-surface hover:border-ink">Get in touch</a>
            {[
              [Github, PROFILE.github, 'GitHub'],
              [Linkedin, PROFILE.linkedin, 'LinkedIn'],
              ...(PROFILE.codeforces ? [[CodeforcesIcon, PROFILE.codeforces, 'Codeforces']] : []),
              [Mail, `mailto:${PROFILE.email}`, 'Email'],
            ].map(([Icon, href, label]) => (
              <a key={label} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full border border-stone-200 bg-surface text-stone-600 transition hover:border-accent hover:text-accent"><Icon size={18} /></a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────── Marquee of events (kept) ───────── */
export function Marquee() {
  const names = [...CONTESTS.international, ...CONTESTS.national, ...CONTESTS.programming].map((c) => c[0].replace(/\s*\(.*\)/, ''))
  const row = (k) => names.map((n, i) => (
    <span key={k + i} className="flex shrink-0 items-center gap-6 text-sm font-medium text-stone-500">{n}<span className="h-1.5 w-1.5 rounded-full bg-accent/60" /></span>
  ))
  return (
    <div className="marquee overflow-hidden border-y border-stone-200 bg-surface py-4" aria-label="Events competed in">
      <div className="flex w-max animate-marquee gap-6">{row('a')}{row('b')}</div>
    </div>
  )
}

/* ───────── § 01 Overview — bento dashboard ───────── */
const Tile = ({ label, className = '', children, id }) => (
  <div id={id} className={`tile scroll-mt-24 ${className}`}>
    <p className="label mb-3">{label}</p>
    {children}
  </div>
)

function Ring({ value, max, label }) {
  const r = 34, c = 2 * Math.PI * r
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgb(var(--s200))" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgb(var(--accent))" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(value / max) * c} ${c}`} />
      </svg>
      <div className="text-center"><div className="font-serif text-xl font-semibold leading-none">{value}</div><div className="mt-0.5 text-[10px] text-stone-500">{label}</div></div>
    </div>
  )
}

const SKILL_ICON = { sec: Shield, tool: Wrench, dev: Code2, os: Monitor }

export const About = () => (
  <Wrap id="about" num="01" kicker="Overview" title={OVERVIEW.title}>
    <div className="grid gap-4 md:grid-cols-12">
      <Reveal className="md:col-span-8">
        <Tile label="Abstract" className="h-full !p-7">
          <p className="text-lg leading-relaxed text-stone-700 md:text-xl md:leading-relaxed">{PROFILE.summary}</p>
        </Tile>
      </Reveal>
      <Reveal delay={0.05} className="md:col-span-4">
        <Tile label="Education" className="h-full">
          <div className="flex items-center gap-4">
            <Ring value={OVERVIEW.cgpa} max={OVERVIEW.cgpa_max} label="CGPA" />
            <div><p className="font-serif text-lg font-semibold leading-tight">{OVERVIEW.degree}</p><p className="mt-1 text-sm text-stone-600">{EDUCATION[0]?.school}</p><p className="mt-1 text-xs text-stone-400">{EDUCATION[0]?.period}</p></div>
          </div>
          <ul className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
            {EDUCATION.slice(1).map((e) => (
              <li key={e.degree} className="flex items-baseline justify-between gap-3">
                <span className="text-stone-600">{e.degree.match(/\((.*)\)/)?.[1]} · {e.period}</span>
                <span className="font-mono text-xs font-semibold text-accent">{e.score}</span>
              </li>
            ))}
          </ul>
        </Tile>
      </Reveal>

      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={0.04 * i} className="md:col-span-3">
          <Tile label={`KPI-0${i + 1}`} className="h-full">
            <div className="font-serif text-4xl font-semibold text-accent md:text-5xl"><Counter to={s.value} suffix={s.suffix} /></div>
            <p className="mt-1 text-sm text-stone-600">{s.label}</p>
          </Tile>
        </Reveal>
      ))}

      <Reveal className="md:col-span-8">
        <Tile id="skills" label="Skills & tooling" className="h-full">
          <div className="grid gap-5 sm:grid-cols-2">
            {SKILL_GROUPS.map((g) => {
              const Icon = SKILL_ICON[g.key]
              return (
                <div key={g.key}>
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon size={15} style={{ color: GROUP_COLOR[g.key] }} />{g.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">{SKILLS.filter((s) => s.group === g.key).map((s) => <span key={s.name} className="chip !px-3 !py-1 !text-xs">{s.name}</span>)}</div>
                </div>
              )
            })}
          </div>
        </Tile>
      </Reveal>
      <Reveal delay={0.05} className="md:col-span-4">
        <div className="tile h-full !border-0 bg-gradient-to-br from-teal-700 to-teal-900 text-white">
          <p className="label mb-3 !text-teal-200">Leadership</p>
          <Shield className="text-teal-200" />
          <p className="mt-3 font-serif text-3xl font-semibold">{OVERVIEW.leadership_role}</p>
          <p className="mt-1 text-sm text-teal-100">{OVERVIEW.leadership_text}</p>
          <p className="mt-4 text-xs text-teal-200">{ORGANIZATIONS.length} roles · {OVERVIEW.orgCount} organizations</p>
        </div>
      </Reveal>

      <Reveal className="md:col-span-6">
        <Tile label="Location" className="h-full">
          <MapPin className="text-accent" />
          <p className="mt-2 font-serif text-xl font-semibold">{PROFILE.location}</p>
          <p className="mt-2 text-sm text-stone-600">{PROFILE.university}</p>
        </Tile>
      </Reveal>
      <Reveal delay={0.05} className="md:col-span-6">
        <Tile label="Competitive programming" className="h-full">
          <Terminal className="text-accent" />
          <p className="mt-2 font-serif text-xl font-semibold">{OVERVIEW.cp_title}</p>
          <p className="mt-2 text-sm text-stone-600">{OVERVIEW.cp_text}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PROFILE.codeforces && <a href={PROFILE.codeforces} target="_blank" rel="noreferrer" className="chip !px-2.5 !py-1 !text-xs hover:border-accent hover:text-accent font-medium">Codeforces ↗</a>}
            {PROFILE.leetcode && <a href={PROFILE.leetcode} target="_blank" rel="noreferrer" className="chip !px-2.5 !py-1 !text-xs hover:border-accent hover:text-accent font-medium">LeetCode ↗</a>}
            {PROFILE.codechef && <a href={PROFILE.codechef} target="_blank" rel="noreferrer" className="chip !px-2.5 !py-1 !text-xs hover:border-accent hover:text-accent font-medium">CodeChef ↗</a>}
            {PROFILE.tryhackme && <a href={PROFILE.tryhackme} target="_blank" rel="noreferrer" className="chip !px-2.5 !py-1 !text-xs hover:border-accent hover:text-accent font-medium">TryHackMe ↗</a>}
            {PROFILE.hackerrank && <a href={PROFILE.hackerrank} target="_blank" rel="noreferrer" className="chip !px-2.5 !py-1 !text-xs hover:border-accent hover:text-accent font-medium">HackerRank ↗</a>}
            {PROFILE.stopstalk && <a href={PROFILE.stopstalk} target="_blank" rel="noreferrer" className="chip !px-2.5 !py-1 !text-xs hover:border-accent hover:text-accent font-medium">StopStalk ↗</a>}
          </div>
        </Tile>
      </Reveal>
    </div>
  </Wrap>
)

/* ───────── § 02 Achievements — medal wall + findings report ───────── */
const TIERS = {
  gold: ['#fef3c7', '#f59e0b', '#92400e'],
  silver: ['#f5f5f4', '#a8a29e', '#44403c'],
  bronze: ['#fed7aa', '#ea580c', '#7c2d12'],
  teal: ['#99f6e4', '#14b8a6', '#115e59'],
  indigo: ['#c7d2fe', '#6366f1', '#312e81'],
}

function Medal({ tier, top, title, sub }) {
  const id = useId().replace(/:/g, '')
  const [l, m, d] = TIERS[tier]
  return (
    <div className="medal flex flex-col items-center text-center">
      <svg viewBox="0 0 100 126" className="h-32 w-auto drop-shadow-lg" role="img" aria-label={`${top} — ${title}`}>
        <defs>
          <radialGradient id={`g${id}`} cx="35%" cy="30%" r="80%"><stop offset="0" stopColor={l} /><stop offset=".55" stopColor={m} /><stop offset="1" stopColor={d} /></radialGradient>
          <linearGradient id={`r${id}`} x1="0" x2="1"><stop offset="0" stopColor={m} /><stop offset="1" stopColor={d} /></linearGradient>
        </defs>
        <path d="M30 0h16l10 38H36z" fill={`url(#r${id})`} /><path d="M70 0H54L44 38h20z" fill={`url(#r${id})`} opacity=".85" />
        <circle cx="50" cy="78" r="38" fill={`url(#g${id})`} />
        <circle cx="50" cy="78" r="31" fill="none" stroke={l} strokeOpacity=".7" strokeWidth="1.5" strokeDasharray="2 3" />
        <text x="50" y="86" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="800" fontSize={top.length > 4 ? 15 : 24} fill={d}>{top}</text>
      </svg>
      <p className="mt-2 text-sm font-semibold leading-tight">{title}</p>
      <p className="mt-0.5 text-xs text-stone-500">{sub}</p>
    </div>
  )
}

const yearOf = (d) => (d.match(/20\d\d/g) || ['—']).slice(-1)[0]
const IMPACT = {
  CRITICAL: 'bg-red-500/15 text-red-500',
  HIGH: 'bg-orange-500/15 text-orange-500',
  MEDIUM: 'bg-amber-500/15 text-amber-600',
  LOW: 'bg-sky-500/15 text-sky-500',
  INFO: 'bg-stone-500/15 text-stone-500',
}
const impactOf = (r) => {
  const n = parseInt(r, 10)
  if (/champion|runners|winner|1st/i.test(r)) return 'CRITICAL'
  if (/qualified|finalist|5-star|top|regionalist|ranked/i.test(r) || (!Number.isNaN(n) && n <= 12)) return 'HIGH'
  if (/active|contestant|competitor/i.test(r) || (!Number.isNaN(n) && n <= 30)) return 'MEDIUM'
  if (!Number.isNaN(n)) return 'LOW'
  return 'INFO'
}
const FILTERS = [['all', 'All'], ['national', 'National CTF'], ['international', 'International CTF'], ['programming', 'Programming']]

function Findings() {
  const [f, setF] = useState('all')
  const rows = useMemo(() => {
    const all = Object.entries(CONTESTS).flatMap(([track, list]) => list.map(([name, result, date]) => ({ track, name, result, date, year: yearOf(date), impact: impactOf(result) })))
    return all.sort((a, b) => b.year - a.year).map((r, i) => ({ ...r, id: `F-${String(i + 1).padStart(2, '0')}` }))
  }, [])
  const groups = useMemo(() => {
    const by = rows.filter((r) => f === 'all' || r.track === f).reduce((m, r) => ((m[r.year] ||= []).push(r), m), {})
    return Object.entries(by).sort((a, b) => b[0] - a[0])
  }, [rows, f])
  const cols = 'md:grid-cols-[4rem_1fr_9rem_11rem_6.5rem]'

  return (
    <div className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Findings log</p>
          <h3 className="font-serif text-2xl font-semibold md:text-3xl">Every contest, rated by impact</h3>
        </div>
        <div role="tablist" className="flex flex-wrap gap-2">
          {FILTERS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${f === k ? 'bg-ink text-paper' : 'border border-stone-200 bg-surface text-stone-600 hover:border-ink'}`}>{l}</button>
          ))}
        </div>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
        Impact = placement tier:
        {Object.keys(IMPACT).map((k) => <span key={k} className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${IMPACT[k]}`}>{k}</span>)}
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-surface">
        <div className={`label hidden border-b border-stone-200 bg-stone-50 px-5 py-3 md:grid ${cols} gap-4`}>
          <span>ID</span><span>Event</span><span>Date</span><span>Result</span><span>Impact</span>
        </div>
        {groups.map(([year, items]) => (
          <div key={year}>
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-2">
              <span className="font-serif text-xl font-semibold text-stone-500">{year}</span>
              <span className="label">{items.length} {items.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {items.map((r) => (
                <li key={r.id} className={`grid gap-x-4 gap-y-1 px-5 py-3 text-sm transition hover:bg-accent-soft/30 md:items-center ${cols}`}>
                  <span className="font-mono text-xs text-stone-400">{r.id}</span>
                  <span className="font-medium">{r.name}</span>
                  <span className="text-stone-500">{r.date}</span>
                  <span className="font-semibold text-accent-dark">{r.result}</span>
                  <span><span className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${IMPACT[r.impact]}`}>{r.impact}</span></span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Achievements = () => (
  <Wrap id="achievements" num="02" kicker="Achievements" title="Podiums, bounties and finals." intro="The highlights on the wall — and every contest in the findings log below.">
    <Reveal>
      <div className="rounded-3xl border border-stone-200 bg-surface px-4 pb-6 pt-8 md:px-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {MEDALS.map((m) => <Medal key={m.title} {...m} />)}
        </div>
        <div className="mt-6 h-1.5 rounded-full bg-gradient-to-r from-transparent via-stone-300 to-transparent" aria-hidden />
      </div>
    </Reveal>
    <Findings />
  </Wrap>
)

/* ───────── § 03 Credentials ───────── */
const orgGroups = () => Object.entries(ORGANIZATIONS.reduce((m, o) => ((m[o.org] ||= []).push(o), m), {}))

export const Credentials = () => (
  <div className="bg-stone-100/70">
    <Wrap id="credentials" num="03" kicker="Appendix" title="Certified, educated, and leading.">
      <h3 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold"><Award size={20} className="text-accent" /> Appendix A — Certifications</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {CERTIFICATIONS.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.06}>
            <div className="tile h-full">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft font-serif text-lg font-bold text-accent-dark">{c.issuer[0]}</span>
              <p className="mt-4 font-semibold leading-snug">{c.name}</p>
              <p className="mt-1 text-sm text-stone-500">{c.issuer} · {c.date}</p>
              <p className="mt-3 break-all rounded-lg bg-stone-50 px-2 py-1 font-mono text-[11px] text-stone-400">ID {c.id}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-sm text-stone-600"><span className="font-semibold">Course:</span> {COURSES[0]}</p>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="mb-5 flex items-center gap-2 font-serif text-xl font-semibold"><GraduationCap size={20} className="text-accent" /> Appendix B — Education</h3>
          <ol className="relative space-y-6 border-l-2 border-stone-200 pl-6">
            {EDUCATION.map((e) => (
              <li key={e.degree} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-accent" />
                <p className="font-mono text-xs font-medium text-accent">{e.period}</p>
                <p className="font-semibold">{e.degree}</p>
                <p className="text-sm text-stone-600">{e.school}</p>
                <p className="mt-1 inline-block rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium ring-1 ring-stone-200">{e.score}</p>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="mb-5 flex items-center gap-2 font-serif text-xl font-semibold"><Building2 size={20} className="text-accent" /> Appendix C — Leadership</h3>
          <div className="space-y-3">
            {orgGroups().map(([org, roles]) => (
              <div key={org} className="tile !p-5">
                <p className="font-semibold">{org}</p>
                <ul className="mt-2 space-y-1">
                  {roles.map((r) => (
                    <li key={r.role + r.period} className="flex justify-between gap-3 text-sm"><span className="text-stone-700">{r.role}</span><span className="shrink-0 text-stone-400">{r.period}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrap>
  </div>
)

/* ───────── § 04 Projects ───────── */
const PROJECT_ICON = [Database, Activity, Landmark, Terminal]

export const Projects = () => (
  <Wrap id="projects" num="04" kicker="Case studies" title="Things I've built.">
    <div className="grid gap-5 md:grid-cols-3">
      {PROJECTS.map((p, i) => {
        const Icon = PROJECT_ICON[i % PROJECT_ICON.length]
        return (
          <Reveal key={p.title} delay={i * 0.07} className="h-full">
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-900/10">
              <div className="relative grid h-44 place-items-center overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(${p.hue} 55% 20%), hsl(${p.hue} 60% 42%))` }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} aria-hidden />
                <span className="absolute left-4 top-3 font-mono text-[11px] tracking-widest text-white/70">P-{String(i + 1).padStart(2, '0')}</span>
                <Icon size={56} strokeWidth={1.2} className="relative text-white/90 transition duration-500 group-hover:scale-110" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-serif text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">{t}</span>)}</div>
                <a href={p.github} target="_blank" rel="noreferrer" className="mt-auto inline-flex w-fit pt-5 items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-dark"><Github size={15} /> View code <ArrowUpRight size={14} /></a>
              </div>
            </article>
          </Reveal>
        )
      })}
    </div>
  </Wrap>
)

/* ───────── § 05 Contact ───────── */
export function Contact() {
  const [f, setF] = useState({ name: '', email: '', msg: '' })
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  // No backend: opens the visitor's mail app with the message filled in.
  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    const body = encodeURIComponent(`From: ${f.name} <${f.email}>\n\n${f.msg}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Portfolio contact from ' + f.name)}&body=${body}`
  }
  const input = 'mt-1.5 w-full rounded-xl border border-stone-300 bg-surface px-4 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15'

  return (
    <section id="contact" className="px-4 pb-20 md:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-band p-6 text-white ring-1 ring-white/10 sm:p-8 md:rounded-[2.5rem] md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" aria-hidden />
        <div className="relative grid gap-10 md:grid-cols-2">
          <div>
            <p className="kicker !text-teal-200 before:!bg-teal-200">§ 06 / End of report</p>
            <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Let's talk software, algorithms or systems.</h2>
            <p className="mt-4 max-w-md text-stone-400">Open to software engineering opportunities, internships, problem solving collaborations, and open-source development.</p>
            <div className="mt-8 space-y-2">
              <a href={`mailto:${PROFILE.email}`} className="flex max-w-full items-center gap-2 text-[15px] font-semibold text-teal-200 underline-offset-4 hover:underline sm:text-lg"><Mail size={18} /> {PROFILE.email}</a>
              {PROFILE.phone && <a href={`tel:${PROFILE.phone}`} className="flex items-center gap-2 font-mono text-sm text-teal-100 hover:text-white"><Phone size={16} /> {PROFILE.phone} {PROFILE.phone_alt ? `· ${PROFILE.phone_alt}` : ''}</a>}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                [Github, PROFILE.github, 'GitHub'],
                [Linkedin, PROFILE.linkedin, 'LinkedIn'],
                ...(PROFILE.codeforces ? [[CodeforcesIcon, PROFILE.codeforces, 'Codeforces']] : []),
              ].map(([Icon, href, label]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="btn border border-white/20 !py-2.5 hover:bg-white hover:!text-[#0c0a09]"><Icon size={16} /> {label}</a>
              ))}
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4 rounded-3xl bg-surface p-6 text-ink">
            <label className="block text-sm font-medium text-stone-600">Name<input required className={input} value={f.name} onChange={set('name')} /></label>
            <label className="block text-sm font-medium text-stone-600">Email<input required type="email" className={input} value={f.email} onChange={set('email')} /></label>
            <label className="block text-sm font-medium text-stone-600">Message<textarea required rows={4} className={`${input} resize-none`} value={f.msg} onChange={set('msg')} /></label>
            <button className="btn w-full bg-teal-700 text-white hover:bg-teal-800"><Send size={15} /> Send message</button>
            {sent && <p className="text-center text-xs text-stone-500">Opening your email app with the message filled in…</p>}
          </form>
        </div>
      </div>
    </section>
  )
}
