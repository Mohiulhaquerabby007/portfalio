// Parses data.md (see the comment at the top of that file) into plain objects for the site.
// Pure function, no dependencies. Errors carry line numbers so a typo in data.md is easy to find.

const fail = (file, line, msg) => { throw new Error(`${file}${line ? `:${line}` : ''} — ${msg}`) }
const norm = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const TIERS = ['gold', 'silver', 'bronze', 'teal', 'indigo']
const GROUP_KEYS = { security: 'sec', tools: 'tool', languages: 'dev', 'operating systems': 'os' }
const CONTEST_KEYS = { 'national ctf': 'national', 'international ctf': 'international', programming: 'programming' }

// Blank out <!-- comments --> but keep the newlines so reported line numbers stay right.
const stripComments = (md) => md.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ''))

function splitSections(md, file) {
  const sections = {}
  let h2 = null, h3 = null
  md.split(/\r?\n/).forEach((text, i) => {
    const line = i + 1
    let m
    if ((m = text.match(/^##\s+(.+?)\s*$/))) { h2 = { name: norm(m[1]), title: m[1], line, body: [], subs: [] }; if (sections[h2.name]) fail(file, line, `duplicate section "## ${m[1]}"`); sections[h2.name] = h2; h3 = null }
    else if ((m = text.match(/^###\s+(.+?)\s*$/)) && h2) { h3 = { title: m[1], line, body: [] }; h2.subs.push(h3) }
    else if (h2) (h3 || h2).body.push({ text, line })
  })
  return sections
}

const need = (sections, name, file) => sections[name] || fail(file, 0, `missing section "## ${name[0].toUpperCase() + name.slice(1)}"`)
const nonEmpty = (body) => body.filter((l) => l.text.trim())

function parseKV(body, file) {
  const out = {}
  for (const { text, line } of nonEmpty(body)) {
    const m = text.match(/^\s*(?:[-*]\s+)?([A-Za-z0-9_ ]+?)\s*:\s*(.*)$/)
    if (!m) fail(file, line, `expected "- key: value", got "${text.trim()}"`)
    out[norm(m[1])] = m[2].trim()
  }
  return out
}

function parseParagraph(body) { return nonEmpty(body).map((l) => l.text.trim()).join(' ') }

function parseList(body) {
  return nonEmpty(body).flatMap((l) => (/^\s*[-*]\s+/.test(l.text) ? [l.text.replace(/^\s*[-*]\s+/, '').trim()] : l.text.split(',').map((x) => x.trim()))).filter(Boolean)
}

function parseTable(body, required, file, where) {
  const rows = nonEmpty(body).filter((l) => l.text.trim().startsWith('|'))
  if (rows.length < 2) fail(file, body[0]?.line, `${where}: expected a Markdown table (header row, |---| row, then data rows)`)
  const cells = (t) => t.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'))
  const head = cells(rows[0].text).map(norm)
  for (const col of required) if (!head.includes(norm(col))) fail(file, rows[0].line, `${where}: table needs a "${col}" column (found: ${head.join(', ')})`)
  if (!/^[\s|:-]+$/.test(rows[1].text)) fail(file, rows[1].line, `${where}: second table line must be the |---|---| separator`)
  return rows.slice(2).map(({ text, line }) => {
    const c = cells(text)
    if (c.length !== head.length) fail(file, line, `${where}: row has ${c.length} cell(s) but the header has ${head.length}. Is there an unescaped | in the text? Write \\| instead.`)
    return { ...Object.fromEntries(head.map((h, i) => [h, c[i]])), __line: line }
  })
}

export function parseData(raw, file = 'data.md') {
  const s = splitSections(stripComments(raw), file)

  const profile = parseKV(need(s, 'profile', file).body, file)
  for (const k of ['name', 'handle', 'subtitle', 'location', 'university', 'github', 'linkedin', 'email']) if (!profile[k]) fail(file, s.profile.line, `Profile is missing "${k}"`)
  const hero = parseKV(need(s, 'hero', file).body, file)
  const overview = parseKV(need(s, 'overview', file).body, file)
  for (const k of ['title', 'degree', 'cgpa_max', 'leadership_role', 'leadership_text', 'cp_title', 'cp_text']) if (!overview[k]) fail(file, s.overview.line, `Overview is missing "${k}"`)
  const summary = parseParagraph(need(s, 'summary', file).body)

  const contests = {}
  for (const sub of need(s, 'contests', file).subs) {
    const key = CONTEST_KEYS[sub.title.toLowerCase()] || norm(sub.title)
    contests[key] = parseTable(sub.body, ['Event', 'Result', 'Date'], file, `Contests > ${sub.title}`).map((r) => [r.event, r.result, r.date])
  }
  for (const k of Object.values(CONTEST_KEYS)) contests[k] ||= []
  const contestTotal = Object.values(contests).reduce((n, l) => n + l.length, 0)

  const stats = parseTable(need(s, 'stats', file).body, ['Value', 'Label'], file, 'Stats').map((r) => {
    if (r.value.toLowerCase() === 'auto') return { value: contestTotal, suffix: '', label: r.label }
    const m = r.value.match(/^(\d+)(\D*)$/)
    if (!m) fail(file, r.__line, `Stats: value "${r.value}" must be a number, a number with a suffix like 550+, or "auto"`)
    return { value: Number(m[1]), suffix: m[2], label: r.label }
  })

  const skillGroups = [], skills = []
  for (const sub of need(s, 'skills', file).subs) {
    const key = GROUP_KEYS[sub.title.toLowerCase()] || norm(sub.title)
    skillGroups.push({ key, title: sub.title })
    parseList(sub.body).forEach((name) => skills.push({ name, group: key }))
  }

  const medals = parseTable(need(s, 'medals', file).body, ['Tier', 'Rank', 'Title', 'Subtitle'], file, 'Medals').map((r) => {
    if (!TIERS.includes(r.tier.toLowerCase())) fail(file, r.__line, `Medals: tier "${r.tier}" must be one of ${TIERS.join(', ')}`)
    return { tier: r.tier.toLowerCase(), top: r.rank, title: r.title, sub: r.subtitle }
  })

  const HUES = [215, 170, 245, 320, 30, 270]
  const projects = parseTable(need(s, 'projects', file).body, ['Title', 'Description', 'Tags'], file, 'Projects').map((r, i) => ({
    title: r.title, desc: r.description, tags: r.tags.split(',').map((t) => t.trim()).filter(Boolean), github: r.link || profile.github, hue: HUES[i % HUES.length],
  }))

  return {
    profile: { ...profile, summary },
    hero: { display_name: hero.display_name || profile.name, tagline: hero.tagline || '' },
    overview: { ...overview, cgpa_max: Number(overview.cgpa_max) || 4 },
    stats, skillGroups, skills, medals, contests, projects,
    certifications: parseTable(need(s, 'certifications', file).body, ['Name', 'Issuer', 'Date', 'ID'], file, 'Certifications').map((r) => ({ name: r.name, issuer: r.issuer, date: r.date, id: r.id })),
    courses: parseList(need(s, 'courses', file).body),
    education: parseTable(need(s, 'education', file).body, ['Degree', 'School', 'Period', 'Score'], file, 'Education').map((r) => ({ degree: r.degree, school: r.school, period: r.period, score: r.score })),
    organizations: parseTable(need(s, 'leadership', file).body, ['Role', 'Organization', 'Period'], file, 'Leadership').map((r) => ({ role: r.role, org: r.organization, period: r.period })),
    icpc: s.icpc ? parseKV(s.icpc.body, file) : null,
  }
}
