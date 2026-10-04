import { useEffect } from 'react'
import { fetchSettings, trackPageView as postPageView } from '../api/keelClient'
import { ensureAnalytics, pageTrackingEnabled } from '../lib/analytics'

/**
 * Page views, and arming the analytics SDK.
 *
 * Replaces a version that inserted straight into the `page_views` table with the
 * Supabase anon key. Two problems with that, both of which this fixes:
 *
 *  1. **The browser chose the tenant.** It looked the shop up by slug and wrote
 *     its own `shop_id`, so a client could write another shop's page views. The
 *     request now carries only a site token and keel-api derives the shop from it.
 *
 *  2. **Every failure was swallowed.** `.then(() => {})` with no catch, so a
 *     revoked token, a 403 from a read token, or a dead API all looked identical
 *     to "no traffic". That is the failure mode where a site can be broken for
 *     weeks and the analytics look reassuringly normal.
 *
 * The owner's `page_tracking` toggle is honoured, and it is opt-in: absent means
 * off. A shop that never opened the Keel website tab has no key stored, and
 * defaulting that to "tracked" would record traffic for an owner who never agreed.
 *
 * That gate is why the settings read happens here as well as in the Footer. The
 * toggle arrives *with* /api/settings, so the decision cannot be made before that
 * read completes. Two requests to one endpoint is cheaper than threading the
 * settings row through context, and the second read reports the same idempotent
 * health signal.
 */

// Resolved once and cached, so a product click does not re-fetch settings to
// decide whether it is allowed to record anything.
let toggleResolved = false
let trackingOn = false

async function resolveTracking() {
  if (toggleResolved) return trackingOn
  toggleResolved = true
  try {
    const settings = await fetchSettings()
    trackingOn = pageTrackingEnabled(settings?.feature_toggles)
  } catch {
    // If settings cannot be read, the toggle is unknown, and unknown means off.
    // Note this inverts the usual health rule deliberately: a settings outage must
    // not silently switch tracking ON for a shop that turned it off.
    trackingOn = false
  }
  return trackingOn
}

/**
 * Record one page view. Positional to keep CatalogueModal's existing call site
 * unchanged.
 *
 * @param {string} page
 * @param {string} [productName]
 */
export async function trackPageView(page, productName) {
  if (!(await resolveTracking())) return null
  return postPageView({ page, productName })
}

export function usePageTracking() {
  useEffect(() => {
    ensureAnalytics()
    trackPageView(window.location.pathname)
  }, [])
}