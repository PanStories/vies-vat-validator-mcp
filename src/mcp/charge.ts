// Defensive Apify Actor.charge wrapper for Pay-Per-Event pricing.
// On Apify, calling Actor.charge(event) bills the matching pricingEvent.
// Locally (no apify package / no APIFY_TOKEN), this is a safe no-op so the
// server runs and tests pass without the heavy apify dependency.

const APIFY_MODULE = "apify";

/**
 * Only events present in the actor's Apify pricingInfos are billable.
 * `mcp-validate-vat` is the single paid event; the three discovery tools are
 * intentionally free and must NOT call Actor.charge (charging an undefined event
 * would error on the platform). Keep this set in sync with .actor/actor.json.
 */
const BILLABLE_EVENTS = new Set(["mcp-validate-vat"]);

export async function charge(event: string): Promise<void> {
  if (!BILLABLE_EVENTS.has(event)) return; // free tool — skip billing entirely
  // On Apify the run is flagged via APIFY_META_ORIGIN=STANDBY (or APIFY_TOKEN /
  // APIFY_ACTOR_EVENTS). Must match the home detection used by the server entry.
  const atHome = !!(
    process.env.APIFY_TOKEN ||
    process.env.APIFY_ACTOR_EVENTS ||
    process.env.APIFY_META_ORIGIN
  );
  if (!atHome) return;
  try {
    // Use a variable so TS does not statically resolve / require the module.
    const mod: any = await import(APIFY_MODULE);
    const Actor = mod?.Actor;
    if (Actor && typeof Actor.charge === "function") {
      // apify v3 SDK expects an options object with `eventName`.
      await Actor.charge({ eventName: event });
    }
  } catch {
    // apify package not installed locally — ignore.
  }
}
