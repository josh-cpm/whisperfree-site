import { getStore } from "@netlify/blobs";

// Reads the active-install counts recorded by the appcast edge function.
//
// Protected by a shared token: GET /stats?token=<STATS_TOKEN>
// Returns monthly-unique install counts ("active installs" per calendar month).
//
//   curl "https://whisperfree.com/stats?token=YOUR_TOKEN"
//
// Each blob key is `${YYYY-MM}/${hash}`, one per monthly-unique install, so
// counting keys per month prefix gives active installs for that month.

export const config = { path: "/stats" };

export default async (request) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const expected = Netlify.env.get("STATS_TOKEN");

  if (!expected || token !== expected) {
    return new Response("Unauthorized\n", { status: 401 });
  }

  const store = getStore("install-pings");
  const counts = {};

  for await (const page of store.list({ paginate: true })) {
    for (const blob of page.blobs) {
      const period = blob.key.split("/")[0];
      counts[period] = (counts[period] || 0) + 1;
    }
  }

  const months = Object.keys(counts).sort();
  const current = months[months.length - 1];

  const body = {
    metric: "monthly-unique active installs",
    currentMonth: current ?? null,
    currentMonthActiveInstalls: current ? counts[current] : 0,
    byMonth: Object.fromEntries(months.map((m) => [m, counts[m]])),
  };

  return new Response(JSON.stringify(body, null, 2) + "\n", {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};
