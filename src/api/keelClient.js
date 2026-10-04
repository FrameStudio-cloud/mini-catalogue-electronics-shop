/**
 * keel-api client.
 *
 * Transport only: base URL, the site token, and a retry budget. It knows nothing
 * about what is being fetched, so the next thing that needs the API adds a function
 * here rather than growing this file.
 *
 * The retry budget is the number that matters:
 *
 *   "These were 3 attempts at a 10s timeout with 1s and 2s backoff, so a slow
 *   (not refused) API cost roughly 33 seconds of skeleton before the visitor saw
 *   anything. The API host is on a free Render plan, which sleeps and
 *   cold-starts in 10-30s... At 4s x 2 with 500ms backoff the worst case is
 *   about 8.5s."
 *
 * Do not raise the timeout. Someone opening a price list will not wait 33 seconds
 * for it, and this site has no server rendering to hide the wait behind.
 *
 * No token is not an error. Without one every call would 401, and the site must
 * still render from src/config/*.js — that is what keeps this deployable as a
 * plain static site with no secrets in it.
 */

import { reportFailure, reportOk } from '../lib/dataHealth.js'

const API_BASE = (import.meta.env.VITE_KEEL_API_BASE || 'https://keel-api-37rh.onrender.com').replace(/\/$/, '')

/**
 * The per-shop site token, injected by the build. Never log this value; the header
 * name is safe to print, the token is not.
 *
 * This replaces the Supabase anon key and the VITE_SHOP_SLUG the site used before.
 * The shop is no longer resolved in the browser at all: keel-api derives it from
 * the token and ignores anything the client claims, so there is no longer a
 * tenant to get wrong.
 */
const SITE_TOKEN = import.meta.env.VITE_KEEL_SITE_TOKEN || ''

const TIMEOUT_MS = 4000
const ATTEMPTS = 2
const BACKOFF_MS = 500

export const hasToken = Boolean(SITE_TOKEN)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function headers() {
  const h = { Accept: 'application/json' }
  if (SITE_TOKEN) h['x-keel-site-token'] = SITE_TOKEN
  return h
}

async function get(path, { signal, resource } = {}) {
  let lastError

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(BACKOFF_MS)
    const timer = new AbortController()
    const timeout = setTimeout(() => timer.abort(), TIMEOUT_MS)
    const onAbort = () => timer.abort()
    signal?.addEventListener('abort', onAbort, { once: true })

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: headers(),
        signal: timer.signal,
      })
      if (!res.ok) throw new Error(`${path} -> ${res.status}`)
      const data = await res.json()
      if (resource) reportOk(resource)
      return data
    } catch (err) {
      lastError = err
      // A caller-initiated abort is a decision, not a failure to retry.
      if (signal?.aborted) throw err
      // A 401 will not become a 200 on the second attempt, and retrying it burns
      // the budget to arrive at the same answer.
      if (err instanceof Error && /->\s*40[13]/.test(err.message)) {
        // Still reported: a rejected token is a real fault and the operator needs
        // to see it, not an absence of traffic.
        if (resource) reportFailure(resource, err)
        throw err
      }
    } finally {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', onAbort)
    }
  }

  // Reached only once the budget is spent, so a retry that recovers reports
  // nothing. Reporting per attempt would make one cold start emit a health_fail
  // and a health_ok, which is the noise this avoids.
  if (resource) reportFailure(resource, lastError)
  throw lastError
}

/**
 * Data-health lives HERE, not in the hooks that call these functions.
 *
 * Report success and failure in the layer that knows whether the call worked, so a
 * read cannot be added without reporting. An earlier version reported from the
 * React hooks one level up, which meant a new fetch in this file would have gone
 * silently unreported — the exact class of bug this module exists to catch.
 *
 * `resource` is required on every read below. It is this site's own health
 * vocabulary, and the collector refuses any name the site has not declared for
 * itself, so adding a signal means declaring it in site_health_resources too. It is
 * not defaulted on purpose: a default would let a new read join someone else's lamp
 * silently.
 */

/**
 * The product grid.
 *
 * `?available=true` is applied server-side, and the route returns every column,
 * which is what this site depends on: it renders `specs`, `includes`, `badge` and
 * `variants`, none of which exist on the `services` table. The response is ordered
 * newest-first by the route, matching what the old Supabase query asked for.
 *
 * `price_label` is mapped to `priceLabel` because that is the field the card and
 * the modal read. Doing it here rather than in three components keeps the wire
 * shape from leaking into the UI.
 *
 * Returns [] when there is no token so the caller can use its config fallback.
 */
export async function fetchCatalogue({ signal } = {}) {
  if (!hasToken) return null
  const rows = await get('/api/catalogue?available=true', { signal, resource: 'catalogue' })
  if (!Array.isArray(rows)) return []
  return rows.map((item) => ({ ...item, priceLabel: item.price_label }))
}

/**
 * Every active banner, newest-ordered by sort_order.
 *
 * The route filters `active = true` and orders by sort_order, so those two
 * conditions are not repeated here. It does NOT filter by type, because the hero,
 * the navbar and the announcement bar each want a different slice of the same
 * table — so they share one request and one health signal rather than racing three
 * queries against the same endpoint.
 *
 * Hero rows are picked out by type below rather than by a query parameter, since
 * the route has no such parameter.
 */
export async function fetchBanners({ signal } = {}) {
  if (!hasToken) return null
  const rows = await get('/api/banners', { signal, resource: 'banners' })
  return Array.isArray(rows) ? rows : []
}

/**
 * The contact details and hours the footer renders.
 *
 * Returns null when there is no token so the caller falls back to config/shop.js.
 */
export async function fetchSettings({ signal } = {}) {
  if (!hasToken) return null
  return get('/api/settings', { signal, resource: 'settings' })
}

/**
 * Gallery images.
 *
 * The same `catalogue` table as the product grid, and therefore the same
 * `catalogue` health signal — but deliberately NOT the same query. The grid asks
 * for `?available=true`, because an out-of-stock item should not be buyable; the
 * gallery has always shown anything with a picture, so filtering on availability
 * here would quietly shrink a section that used to render. Two reads of one
 * upstream, one honest lamp.
 *
 * `name` is mapped to `title` because the gallery's own markup reads `title`.
 */
export async function fetchGalleryImages({ signal } = {}) {
  if (!hasToken) return null
  const rows = await get('/api/catalogue', { signal, resource: 'catalogue' })
  if (!Array.isArray(rows)) return []
  return rows
    .filter((item) => item.image)
    .map((item) => ({ ...item, title: item.name }))
}

/**
 * Record one page view.
 *
 * A POST, so this needs a token with WRITE scope. There is one token, and keel-api
 * keys its budget off the token's scope rather than the method, so the write token
 * also serves every read this file does.
 *
 * Deliberately NOT the SDK's page_view — see src/lib/analytics.js.
 *
 * Analytics must never break the site or surface anything to a visitor, so
 * failures are swallowed. Page views are best-effort by nature.
 */
export async function trackPageView({ page, productName } = {}) {
  if (!hasToken) return null
  if (!page) return null

  const body = JSON.stringify({
    page,
    product_name: productName ?? null,
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
  })

  try {
    const res = await fetch(`${API_BASE}/api/page-views`, {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body,
      // Survives the visitor leaving mid-flight. keepalive rather than sendBeacon,
      // because sendBeacon cannot set the token header and would be silently
      // unauthenticated — which looks exactly like success.
      keepalive: true,
    })
    if (!res.ok) return null
    return res.json().catch(() => null)
  } catch {
    return null
  }
}