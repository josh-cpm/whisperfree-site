import { getStore } from "@netlify/blobs";

// Counts active installs by observing Sparkle's daily appcast poll.
//
// Privacy design:
//   - The raw IP is NEVER stored. We store SHA-256(salt : period : ip).
//   - The salt is a server-side secret (INSTALL_SALT env var). Without it,
//     the stored hash cannot be reversed or tested against a known IP.
//   - `period` is the calendar month (YYYY-MM), so the same install hashes to
//     the same value within a month -> we can count monthly-unique installs
//     ("active installs") without ever identifying anyone. Across months the
//     hash changes, so installs cannot be correlated over time.
//   - Each unique install writes one tiny blob key `${period}/${hash}` = "1".
//     Writes are idempotent (repeat polls in the same month overwrite the same
//     key), so there is no read-modify-write race and storage stays bounded.
//
// The feed itself is served unchanged via context.next() — Sparkle receives the
// exact same static appcast.xml. Logging never blocks or alters the response.

export const config = { path: "/appcast.xml" };

export default async (request, context) => {
  try {
    const ip =
      context.ip ||
      request.headers.get("x-nf-client-connection-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "";

    if (ip) {
      const salt = Netlify.env.get("INSTALL_SALT") || "whisperfree-unsalted";
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM
      const data = new TextEncoder().encode(`${salt}:${period}:${ip}`);
      const digest = await crypto.subtle.digest("SHA-256", data);
      const hash = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const store = getStore("install-pings");
      await store.set(`${period}/${hash}`, "1");
    }
  } catch (_) {
    // Never let logging break the update feed.
  }

  return context.next();
};
