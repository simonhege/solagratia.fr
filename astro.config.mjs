// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import tailwind from '@astrojs/tailwind';

import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.solagratia.fr',
  output: 'static',
  trailingSlash: 'never',
  build : {
    format: 'preserve'
  },
  prefetch: {
    prefetchAll: true,
  },
  integrations: [sitemap({
    filter: (page) => page.indexOf('/admin/') < 0,
  }), tailwind(), svelte()],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds, 
      [rehypeAutolinkHeadings, { behavior: 'append' }]
    ],
  }
});