// Pricing manifest — single source of truth for the cloud-models pricing page.
//
// The authoritative manifest is served by the backend at `GET /v1/pricing` (TECHNICAL_PLAN §2.5).
// The backend isn't deployed to a committed URL yet, so we ship a fallback snapshot
// (`src/data/pricing.json`) and render every number from the manifest *object* — never hardcoded
// in prose. When `PRICING_URL` is set in the build env, we fetch the live manifest and fall back
// silently on any error, so switching to live numbers later needs no code change.

import fallback from '../data/pricing.json';

export interface PricingModel {
  id: string;
  label: string;
  providerInputCentsPerMillionTokens: number;
  providerOutputCentsPerMillionTokens: number;
  /** Our flat margin per audio hour, in cents (10 = $0.10/hr). */
  marginCentsPerAudioHour: number;
  /** Estimated provider cost per audio hour, in cents. */
  estimatedProviderCentsPerAudioHour: number;
  /** Estimated total we charge per audio hour, in cents (provider + margin). */
  estimatedTotalCentsPerAudioHour: number;
}

export interface PricingManifest {
  version: number;
  updated: string;
  /** Kill-switch: when false, cloud models are paused (SPEC §12). */
  enabled: boolean;
  models: PricingModel[];
}

/** Minimal structural validation so a malformed live response falls back to the snapshot. */
function isManifest(value: unknown): value is PricingManifest {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  if (typeof m.enabled !== 'boolean' || !Array.isArray(m.models)) return false;
  return m.models.every((model) => {
    const x = model as Record<string, unknown>;
    return typeof x.id === 'string'
      && typeof x.label === 'string'
      && typeof x.estimatedProviderCentsPerAudioHour === 'number'
      && typeof x.estimatedTotalCentsPerAudioHour === 'number'
      && typeof x.marginCentsPerAudioHour === 'number';
  });
}

let cached: Promise<PricingManifest> | null = null;

/**
 * Returns the pricing manifest. Build-time: fetches `PRICING_URL` if set, else uses the committed
 * snapshot. Never throws — any fetch/validation failure falls back to the snapshot. The result is
 * memoized so the manifest is fetched at most once per build no matter how many pages request it.
 */
export function getPricing(): Promise<PricingManifest> {
  if (!cached) {
    cached = (async () => {
      const url = import.meta.env.PRICING_URL;
      if (url) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (isManifest(data)) return data;
          }
          console.warn(`[pricing] ${url} returned an unexpected shape; using snapshot fallback.`);
        } catch (err) {
          console.warn(`[pricing] fetch from ${url} failed; using snapshot fallback.`, err);
        }
      }
      return fallback as PricingManifest;
    })();
  }
  return cached;
}

/** Format whole cents-per-hour as dollars: 28 → "$0.28". */
export function centsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** The launch model is the first entry; the array shape keeps "add a model = add a row." */
export function launchModel(manifest: PricingManifest): PricingModel {
  return manifest.models[0];
}

export interface PricingAnchors {
  /** ≈ cost of a heavy day of dictation (~15 min of audio). */
  perFifteenMinCents: number;
  /** ≈ audio hours $5 of credit buys. */
  hoursPerFiveDollars: number;
  /** ≈ months $5 lasts at one hour of dictation per week. */
  monthsPerFiveDollarsAtOneHourPerWeek: number;
  /** Upper reference subscription (e.g. Wispr Flow Pro monthly at $15/mo). */
  subscriptionMonthly: number;
  subscriptionAnnual: number;
  /** Lower reference subscription (e.g. Aqua Voice Pro annual at ~$8/mo). */
  subscriptionMonthlyLow: number;
  subscriptionAnnualLow: number;
}

/**
 * Concrete spend anchors (PMM §4b). The audio-cost anchors are derived from the model's per-hour
 * total so the prose numbers always match the manifest. `subscriptionMonthly`/`subscriptionAnnual`
 * are fixed reference points for typical dictation subscriptions — not manifest outputs — used to
 * contrast per-second metering against a flat monthly fee. The low/high pair brackets the real
 * market (≈$8/mo annual to $15/mo monthly) so we never imply every competitor costs $180/year.
 */
export function pricingAnchors(model: PricingModel): PricingAnchors {
  const totalPerHour = model.estimatedTotalCentsPerAudioHour;
  const hoursPerFiveDollars = Math.round(500 / totalPerHour);
  return {
    perFifteenMinCents: Math.round(totalPerHour * 0.25),
    hoursPerFiveDollars,
    monthsPerFiveDollarsAtOneHourPerWeek: Math.round(hoursPerFiveDollars / 4.33),
    subscriptionMonthly: 15,
    subscriptionAnnual: 180,
    subscriptionMonthlyLow: 8,
    subscriptionAnnualLow: 96,
  };
}

export interface PricingView {
  manifest: PricingManifest;
  model: PricingModel;
  anchors: PricingAnchors;
  /** Formatted dollars for the launch model: provider price, our price, and our margin. */
  providerPrice: string;
  ourPrice: string;
  margin: string;
}

/**
 * One call that gives a page everything it needs to render pricing: the manifest, the launch model,
 * the spend anchors, and pre-formatted dollar strings. Collapses the repeated frontmatter block
 * across the pricing page, the homepage teaser, and the blog post.
 */
export async function getPricingView(): Promise<PricingView> {
  const manifest = await getPricing();
  // A live kill-switch response may legitimately carry no model rows (`enabled: false`, empty
  // `models`). Borrow the snapshot's model purely for display math so the build never dereferences
  // undefined — the live `enabled` flag still governs whether cloud surfaces actually render.
  const model = manifest.models[0] ?? (fallback as PricingManifest).models[0];
  return {
    manifest,
    model,
    anchors: pricingAnchors(model),
    providerPrice: centsToDollars(model.estimatedProviderCentsPerAudioHour),
    ourPrice: centsToDollars(model.estimatedTotalCentsPerAudioHour),
    margin: centsToDollars(model.marginCentsPerAudioHour),
  };
}
