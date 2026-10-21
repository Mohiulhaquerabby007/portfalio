import { useEffect, useState } from 'react'

let cache // posts.json is generated at build time; load once per page view

export default function usePosts() {
  const [state, setState] = useState(cache ? { status: 'ready', data: cache } : { status: 'loading', data: null })
  useEffect(() => {
    if (cache) return
    let alive = true
    fetch(`${import.meta.env.BASE_URL}posts.json`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then((d) => { cache = d; if (alive) setState({ status: 'ready', data: d }) })
      .catch(() => alive && setState({ status: 'error', data: null }))
    return () => { alive = false }
  }, [])
  return state
}
