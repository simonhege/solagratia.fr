// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import tailwind from '@astrojs/tailwind';

import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.solagratia.fr',
  output: 'static',
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: true,
  },
  integrations: [sitemap(), tailwind()],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds, 
      [rehypeAutolinkHeadings, { behavior: 'append' }]
    ],
  }
});