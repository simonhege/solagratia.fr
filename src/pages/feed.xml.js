import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog');

  return rss({
    // `<title>` field in output xml
    title: 'Blog de SolaGratia.fr',
    // `<description>` field in output xml
    description: 'Explorez la Bible avec une perspective nouvelle',
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site,
    // Astro’s RSS feed produces links with a trailing slash by default, no matter what value 
    // you have configured for trailingSlash. This means that your RSS links may not match your 
    // post URLs exactly.
    // https://docs.astro.build/en/guides/rss/#removing-trailing-slashes
    trailingSlash: false,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      categories: post.data.categories,
      link: `/blog/${post.slug}/`,
    })),
    // (optional) inject custom xml
    customData: `<language>fr-fr</language>`,
  });
}