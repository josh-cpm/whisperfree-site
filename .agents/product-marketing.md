# Product Marketing Context

*Last updated: 2026-06-24*

> Source of truth for site copy. Distilled from `WhisperFree/docs/remote-models/PMM.md`
> (the cloud-models PMM brief) + the existing site. Every marketing/copy task should read this
> first. Drives the M7 "cloud models" launch: pricing page, explainer, FAQ, blog, homepage.

## Product Overview
**One-liner:** Fast, private Mac dictation that runs on-device by default — with optional cloud
models for the hard cases.
**What it does:** Hold a hotkey, talk, and your words land at the cursor in any app. Local
transcription (NVIDIA Parakeet) runs entirely on the Mac and is free. New: switch to an optional
**cloud model** (OpenAI at launch) for noisy rooms, accents, and jargon — billed by the second from
prepaid credits.
**Product category:** Mac dictation / voice-to-text (how people search: "dictation app for Mac",
"local voice to text", "Wispr Flow alternative").
**Product type:** Native macOS app (menu bar), one-time free download + optional metered cloud
credits (no subscription, no account).
**Business model:** Local is free forever. Cloud = **provider's cost + $0.10 / audio hour**,
prepaid credits from $5, manual top-up or auto-recharge, off by default. The full pricing math is
published. *(This replaces the retired "paid local model tiers" idea.)*

## Target Audience
**Who:** People who dictate into their Mac all day — writers, developers, founders, anyone who
talks faster than they type. Privacy-conscious (the brand was built on "stays on your Mac").
**Primary use case:** Fast, accurate dictation inserted directly into whatever app is focused.
**Jobs to be done:**
- Dictate quickly without latency or a cloud round-trip (local).
- Get an accuracy jump when local fails — noise, accents, jargon, long rambling dictation (cloud).
- Keep control over what leaves the Mac and when.
**Anti-persona:** People who want a $15/mo all-you-can-eat subscription, or who will only ever use
their own Groq/OpenAI key (BYO-key power users — not the target for managed cloud, fine to lose).

## Problems & Pain Points
**Core problem:** Local/small speech models break exactly where dictation matters most —
coffee shops, open offices, fans, kids in the background; accents and non-standard speech; jargon,
names, mixed-language; long rambling dictation where small-model drift compounds.
**Why alternatives fall short:** Cloud dictation apps (Wispr Flow, Aqua Voice) are accurate but
send all your audio off-device and charge a monthly subscription whether you use it or not.
**What it costs them:** Re-dictating, hand-fixing names/jargon, or paying $180/yr for a sub they
barely use.
**Emotional tension:** "I don't want to pay another subscription" + "I don't want my audio
harvested" + "but local keeps getting this wrong."

## Competitive Landscape
**Direct:** Wispr Flow, Aqua Voice — paid **cloud** services; fast/polished but audio leaves the
Mac and you pay every month. Superwhisper — on-device like us, but paid.
**Differentiation vs. them:** We're local-first and free for the common case, and when you do need
cloud we charge **at cost + 10¢/hr** with no subscription and no account — you pay cents for the
minutes you actually send, not a flat monthly fee.

## Differentiation
1. **Local stays free, private, and default-on.** Nothing leaves the Mac unless you flip the switch.
2. **Radically honest pricing.** We publish the provider's price and our flat 10¢/hr margin, rendered
   from the same manifest the app bills from — the published numbers can't drift from what we charge.
3. **Per-second metering, not a subscription.** Most people dictate minutes/day; an hour of audio
   costs cents. A median user spends well under $15/yr vs a $180/yr subscription.
4. **First of a family.** "Cloud models" (plural) — more models / smarter auto-switching later
   without a strategy change.

## Objections
| Objection | Response |
|-----------|----------|
| "You sold out / bait-and-switch on privacy" | Default-off, explicit per-use switch, precise disclosure; **local stays free** and keeps getting investment. |
| "Another subscription to pay for" | It's not a subscription — pay by the second for what you send; $5 lasts months; auto-recharge makes the balance invisible after one decision. |
| "I'll just use my own API key" | Fine — those users were never the target. The 10¢/hr buys zero-setup, metering, and one-click switching. |
| "Is my audio safe in cloud mode?" | Audio (and nothing else) goes to the provider only for the clips you choose to send. OpenAI's default retention is ≤30 days; we disclose it plainly and link the policy. |

## Switching Dynamics (JTBD Four Forces)
- **Push:** Local keeps mangling a noisy/accented/jargon-heavy transcript.
- **Pull:** A clear accuracy jump, for cents, with no subscription and no signup.
- **Habit:** "Local is free and good enough most of the time" (we *endorse* this — stay local when
  it's enough).
- **Anxiety:** "Is this private? Am I committing to a recurring charge?" → answered by default-off +
  prepaid + transparent disclosure.

## Customer Language
**Words to use:** local, on-device, private, free (for local), optional, by the second, at cost,
no subscription, no account, off by default, switch on when you need it, cents.
**Words to AVOID (claim scrub — these now contradict the product):** "free forever", "no in-app
purchases", "there is no server", "nothing/never leaves your Mac" (as an absolute), any
never-charge absolute. Reframe to: *stays on your Mac by default; cloud is optional and explicit.*
**Honest notes that must survive editing:** OpenAI default retention ≤30 days (no zero-retention
story at launch); prices are "estimated/current provider price," rendered from the manifest.

## Brand Voice
**Tone:** Plain, confident, honest. Anti-hype. Privacy-credible.
**Style:** Direct, specific, benefits-led; clarity over cleverness; no exclamation points, no
buzzwords. Don't lean on "WhisperFree" wordplay or "nothing ever leaves your Mac" absolutism in new
copy (repositioning constraint).
**Personality:** Trustworthy, technical-but-accessible, understated.

## Proof Points / Anchors (render from the pricing manifest, never hardcode in prose)
- Launch model: **OpenAI Mini — $0.28 / audio hour** ($0.18 provider + $0.10 us).
- A heavy day of dictation ≈ 15 min of audio ≈ **~7¢**.
- **$5 lasts ~18 hours** of audio ≈ ~4 months at an hour/week.
- A $15/mo sub is $180/yr; most dictation users spend **well under $15/yr** here.

## Goals
**Business goal:** Launch managed cloud transparently without damaging the privacy/trust brand.
**Primary conversion action:** Download the app (free). Secondary: understand/adopt cloud credits.
**Key constraint:** The claim scrub is mandatory and ships with the launch.
