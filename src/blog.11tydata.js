/**
 * The blog is switched on and off from src/_data/blog.js → enabled. When off,
 * the page is not written and does not join collections, so it also leaves
 * the sitemap. (A computed permalink has to live in a data file to return a
 * real `false`; front-matter renders it to the string "false".)
 */
export default {
  eleventyComputed: {
    permalink: (data) => (data.blog.enabled ? "/blog/" : false),
    eleventyExcludeFromCollections: (data) => !data.blog.enabled,
  },
};
