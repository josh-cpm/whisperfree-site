import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');

test('committed pricing fallback is fail-closed', () => {
  const manifest = JSON.parse(read('src/data/pricing.json'));
  assert.equal(manifest.enabled, false);
  assert.ok(manifest.models.length > 0, 'fallback still needs values for the paused page');
});

test('site pricing defaults to the production manifest and fails closed', () => {
  const source = read('src/lib/pricing.ts');
  assert.match(
    source,
    /https:\/\/whisperfree-backend\.joshcpm\.workers\.dev\/v1\/pricing/,
  );
  assert.match(source, /return fallback as PricingManifest/);
});

test('legacy cloud URLs redirect to pricing', () => {
  const redirects = read('public/_redirects');
  assert.match(redirects, /^\/cloud \/pricing 301$/m);
  assert.match(redirects, /^\/precision \/pricing 301$/m);
});

test('launch copy does not reintroduce disproven privacy or availability claims', () => {
  const files = [
    'src/components/CloudTeaser.astro',
    'src/components/FAQ.astro',
    'src/components/Features.astro',
    'src/pages/blog/why-we-price-at-cost.astro',
    'src/pages/pricing.astro',
  ];
  const copy = files.map(read).join('\n').toLowerCase();
  const banned = [
    'audio always leaves',
    'goes straight to the model provider',
    'published numbers can never drift',
    'retains api audio for up to 30 days',
  ];

  for (const phrase of banned) {
    assert.equal(copy.includes(phrase), false, `found banned claim: ${phrase}`);
  }
});
