// Defensive Apify Actor.charge wrapper for Pay-Per-Event pricing.
// On Apify, calling Actor.charge(event) bills the matching pricingEvent.
// Locally (no apify package / no APIFY_TOKEN), this is a safe no-op so the
// server runs and tests pass without the heavy apify dependency.

const APIFY_MODULE = "apify";

export async function charge(event: string): Promise<void> {
  const inApify = !!(process.env.APIFY_TOKEN || process.env.APIFY_ACTOR_EVENTS);
  if (!inApify) return;
  try {
    // Use a variable so TS does not statically resolve / require the module.
    const mod: any = await import(APIFY_MODULE);
    const Actor = mod?.Actor;
    if (Actor && typeof Actor.charge === "function") {
      await Actor.charge(event);
    }
  } catch {
    // apify package not installed locally — ignore.
  }
}
