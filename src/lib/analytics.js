import * as sdk from '@framestudio/keel-analytics'

/**
 * This site's binding to @framestudio/keel-analytics.
 *
 * The SDK is shop-agnostic; this file is the only place that knows about this
 * site's environment variables, so the wiring is auditable in one read.
 *
 * Three things are deliberately not done here:
 *
 * 1. **Page views.** They go to /api/page-views via reportPageView() in
 *    ../api/keelClient.js, and the SDK runs with autoPageView off. `page_views`
 *    answers "did people visit, and what did they look at?" for the owner;
 *    `site_events` answers "is anything broken, and since when?" for us. Two
 *    audiences, two tables, one closed vocabulary of event names.
 *
 * 2. **Contact details.** The SDK drops keys matching
 *    phone|email|address|message|note|body|contact in the browser and the
 *    collector drops them again. This site renders a WhatsApp number and an
 *    address in the footer, so the habit of never passing them to track() matters.
 *
 * 3. **Anything that can throw into the page.** Every call is wrapped. A failed
 *    analytics call must never break a shop's page.
 */

const API_BASE = import.meta.env.VITE_KEEL_API_BASE || 'https://keel-api-37rh.onrender.com'

/** The owner's on/off switch, read from store_settings.feature_toggles. */
export const TRACKING_TOGGLE = 'page_tracking'

/**
 * The health resources this site declares.
 *
 * Keel refuses any resource a site has not declared for itself, so adding a read
 * means adding it here AND in site_health_resources for this site. They are:
 *
 *   catalogue - the product/service grid
 *   banners   - the hero, navbar and announcement bar all read this one table
 *   settings  - the contact details and hours in the footer
 *
 * Note that three components report `banners` rather than three separate names.
 * They read the same upstream, so a single honest signal is better than three
 * lamps that can disagree with each other.
 */
export const HEALTH_RESOURCES = ['catalogue', 'banners', 'settings']

let armed = false

/**
 * Turn reporting on for this shop. Idempotent.
 *
 * Armed on the TOKEN alone, deliberately. Gating arming on the `page_tracking`
 * toggle deadlocks: that toggle arrives *with* /api/settings, so when settings is
 * down the toggle is never known, the SDK is never armed, and the settings failure
 * can never be reported. The one failure most worth knowing about would be the one
 * that cannot be reported. The gate therefore applies to page views only, which is
 * what the owner's toggle actually means.
 *
 * @returns {boolean} whether reporting is live
 */
export function ensureAnalytics() {
  if (armed) return true

  const token = import.meta.env.VITE_KEEL_SITE_TOKEN
  if (!token) return false

  try {
    sdk.init({
      token,
      apiBase: API_BASE,
      autoPageView: false,
      debug: import.meta.env.DEV,
    })
    armed = true
    return true
  } catch {
    // Never throw into the app. A shop with broken analytics still has a shop.
    return false
  }
}

/**
 * The owner's on/off switch for VISITOR page views. Opt-in: a missing toggle means
 * OFF, not on. Defaulting to "tracked" would record traffic for an owner who never
 * agreed to it.
 */
export function pageTrackingEnabled(toggles) {
  return toggles?.[TRACKING_TOGGLE]?.enabled === true
}

/**
 * Report a named event. The vocabulary is closed: anything outside the SDK's EVENTS
 * list is refused in the browser before a request is made, and the warning only
 * fires in dev, so a typo here is silent in production.
 */
export function track(name, properties = {}) {
  if (!armed) return
  try {
    sdk.track(name, properties)
  } catch {
    /* see above */
  }
}

/**
 * Report a data-health transition. Backs src/lib/dataHealth.js.
 *
 * @param {string} resource catalogue | banners | settings
 * @param {boolean} ok
 * @param {string} [detail]
 */
export function reportHealth(resource, ok, detail) {
  if (!armed) return
  try {
    sdk.health(resource, ok, detail)
  } catch {
    /* never let reporting break the shop */
  }
}

/** True once the SDK is live. Gates the page-view path. */
export const isArmed = () => armed