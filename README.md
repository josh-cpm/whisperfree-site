# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📊 Active-install counting

WhisperFree has no in-app telemetry. Active installs are counted server-side by
observing Sparkle's daily poll of `/appcast.xml`.

- `netlify/edge-functions/appcast.js` — intercepts `/appcast.xml`, records one
  anonymized ping, then serves the unchanged static feed via `context.next()`.
  The raw IP is never stored; we store `SHA-256(INSTALL_SALT : YYYY-MM : ip)`.
  Because the period is the calendar month, the same install hashes to the same
  value within a month (→ monthly-unique "active installs") but cannot be
  correlated across months. One tiny Netlify Blobs key per unique install.
- `netlify/functions/stats.mjs` — reads the counts. Token-protected:

  ```sh
  curl "https://whisperfree.com/stats?token=$STATS_TOKEN"
  ```

### Required Netlify environment variables

Set both under **Site settings → Environment variables**:

| Variable      | Purpose                                                        |
| :------------ | :------------------------------------------------------------ |
| `INSTALL_SALT` | Secret salt for hashing IPs. Without it the count still works, but the hash becomes guessable. |
| `STATS_TOKEN`  | Shared secret required to read `/stats`.                       |

Netlify Blobs needs no setup — it's provisioned automatically for the site.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
