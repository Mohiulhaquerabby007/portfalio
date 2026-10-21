// Site content lives in /data.md (parsed at build time by vite-plugin-site-data.js).
// This file only re-exports it in the shapes the components use, plus a few things that are layout, not content.
import raw from 'virtual:site-data'

export const PROFILE = raw.profile
export const CONTACT_EMAIL = raw.profile.email
export const HERO = raw.hero
export const MEDALS = raw.medals
export const STATS = raw.stats
export const SKILLS = raw.skills
export const SKILL_GROUPS = raw.skillGroups
export const CONTESTS = raw.contests
export const CERTIFICATIONS = raw.certifications
export const COURSES = raw.courses
export const EDUCATION = raw.education
export const ORGANIZATIONS = raw.organizations
export const PROJECTS = raw.projects

// First row of the Education table = current degree; its score ("CGPA 3.65") feeds the ring in the Overview tile.
export const OVERVIEW = {
  ...raw.overview,
  cgpa: parseFloat(raw.education[0]?.score.match(/[\d.]+/)?.[0]) || 0,
  orgCount: new Set(raw.organizations.map((o) => o.org)).size,
}

// Colours for the skill groups (security / tools / languages / OS). Unknown groups get a neutral grey.
const COLORS = { sec: '#2563eb', tool: '#6366f1', dev: '#0f766e', os: '#b45309' }
export const GROUP_COLOR = new Proxy(COLORS, { get: (t, k) => t[k] || '#64748b' })

// Navigation (layout, not content).
export const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]
