// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://whisperfree.com',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap({
    // /update is the destination for the in-app re-download notice, not a
    // public landing page — keep it out of the sitemap (and noindex'd).
    filter: (page) => !page.endsWith('/update/'),
  })]
});
