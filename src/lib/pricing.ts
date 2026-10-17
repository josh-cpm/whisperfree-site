// Pricing manifest — single source of truth for the cloud-models pricing page.
//
// The authoritative manifest is served by the backend at `GET /v1/pricing` (TECHNICAL_PLAN §2.5).
// The production endpoint is the source of truth. The committed snapshot is deliberately
// disabled: a build-time fetch failure must hide cloud availability, never advertise a
// contained or unreachable service as enabled.

import fallback from '../data/pricing.json';

const DEFAULT_PRICING_URL = 'https://whisperfree-backend.joshcpm.workers.dev/v1/pricing';

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
  if (
    !Number.isInteger(m.version)
    || typeof m.updated !== 'string'
    || typeof m.enabled !== 'boolean'
    || !Array.isArray(m.models)
    || m.models.length === 0
  ) return false;
  return m.models.every((model) => {
    if (typeof model !== 'object' || model === null) return false;
    const x = model as Record<string, unknown>;
    return typeof x.id === 'string'
      && typeof x.label === 'string'
      && typeof x.estimatedProviderCentsPerAudioHour === 'number'
      && Number.isFinite(x.estimatedProviderCentsPerAudioHour)
      && x.estimatedProviderCentsPerAudioHour >= 0
      && typeof x.estimatedTotalCentsPerAudioHour === 'number'
      && Number.isFinite(x.estimatedTotalCentsPerAudioHour)
      && x.estimatedTotalCentsPerAudioHour > 0
      && typeof x.marginCentsPerAudioHour === 'number'
      && Number.isFinite(x.marginCentsPerAudioHour)
      && x.marginCentsPerAudioHour >= 0;
  });
}

let cached: Promise<PricingManifest> | null = null;

/**
 * Returns the pricing manifest. Build-time: fetches `PRICING_URL` when supplied, otherwise the
 * production endpoint. Any fetch/validation failure falls back to a disabled snapshot. The result
 * is memoized so the manifest is fetched at most once per build no matter how many pages request it.
 */
export function getPricing(): Promise<PricingManifest> {
  if (!cached) {
    cached = (async () => {
      const url = import.meta.env.PRICING_URL || DEFAULT_PRICING_URL;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isManifest(data)) return data;
        }
        console.warn(`[pricing] ${url} returned an unexpected shape; using disabled snapshot.`);
      } catch (err) {
        console.warn(`[pricing] fetch from ${url} failed; using disabled snapshot.`, err);
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
}

/**
 * Concrete spend anchors (PMM §4b), derived from the model's per-hour total so the prose numbers
 * always match the manifest.
 */
export function pricingAnchors(model: PricingModel): PricingAnchors {
  const totalPerHour = model.estimatedTotalCentsPerAudioHour;
  const hoursPerFiveDollars = Math.round(500 / totalPerHour);
  return {
    perFifteenMinCents: Math.round(totalPerHour * 0.25),
    hoursPerFiveDollars,
    monthsPerFiveDollarsAtOneHourPerWeek: Math.round(hoursPerFiveDollars / 4.33),
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
  const model = launchModel(manifest);
  return {
    manifest,
    model,
    anchors: pricingAnchors(model),
    providerPrice: centsToDollars(model.estimatedProviderCentsPerAudioHour),
    ourPrice: centsToDollars(model.estimatedTotalCentsPerAudioHour),
    margin: centsToDollars(model.marginCentsPerAudioHour),
  };
}
