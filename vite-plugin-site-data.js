// Exposes data.md to the app as `import data from 'virtual:site-data'`.
// Parsed at build time; in dev, editing data.md reloads the page. A mistake in data.md shows as a Vite error overlay.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseData } from './scripts/parse-data.mjs'

const ID = 'virtual:site-data'
const RESOLVED = '\0' + ID

export default function siteData(file = 'data.md') {
  const abs = path.resolve(file)
  return {
    name: 'site-data',
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null
      this.addWatchFile(abs)
      try { return `export default ${JSON.stringify(parseData(readFileSync(abs, 'utf8'), file))}` }
      catch (e) { this.error(e.message) }
    },
    handleHotUpdate({ file: changed, server }) {
      if (path.resolve(changed) !== abs) return
      const mod = server.moduleGraph.getModuleById(RESOLVED)
      if (mod) server.moduleGraph.invalidateModule(mod)
      server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
