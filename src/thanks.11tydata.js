/**
 * The confirmation page only exists for providers that POST somewhere and
 * redirect here afterwards. The mailto provider hands the message to the
 * reader's own mail app without ever leaving the home page, so this page would
 * be an orphan — a real `false` permalink drops it from the build entirely.
 * (Front-matter `eleventyComputed` renders to a string, so this has to live in
 * a data file to return an actual boolean.)
 */
const POSTS_SOMEWHERE = new Set(["netlify", "formspree"]);

export default {
  eleventyComputed: {
    permalink: (data) => (POSTS_SOMEWHERE.has(data.site.form.provider) ? "/thanks/" : false),
  },
};
