/**
 * Eleventy config.
 *
 * The site is deliberately plain: Nunjucks templates in, semantic HTML out,
 * no client-side JavaScript and no CSS build step. Content lives in
 * `src/_data/*.js` so copy can be edited without touching markup.
 */
/**
 * GitHub Pages serves a project repository under a sub-path
 * (/<repo>/), so every root-relative URL the site emits needs that prefix.
 * The deploy workflow passes it in from actions/configure-pages, which
 * resolves to an empty path once a custom domain is attached — so the same
 * build works at a sub-path, at a domain root, and locally, unchanged.
 *
 * Every internal link and asset reference goes through Eleventy's `url`
 * filter, which applies this. A hard-coded "/assets/…" would 404 on Pages.
 */
const rawPrefix = (process.env.PATH_PREFIX || "/").trim().replace(/^\/+|\/+$/g, "");
const pathPrefix = rawPrefix ? `/${rawPrefix}/` : "/";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addWatchTarget("src/assets/css/");

  /* Absolute URL for canonical links, OG tags and the sitemap. Give it a path
     that has already been through the `url` filter: passing an unprefixed one
     would advertise a canonical URL that does not exist. */
  eleventyConfig.addFilter("absoluteUrl", (path, base) =>
    new URL(path, base).toString()
  );

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());

  // Used to encode the contact address at build time, so the literal string is
  // absent from every file the site serves.
  eleventyConfig.addFilter("base64", (s) => Buffer.from(String(s), "utf8").toString("base64"));
  eleventyConfig.addFilter("base64List", (list) =>
    list.map((s) => Buffer.from(String(s), "utf8").toString("base64"))
  );

  return {
    pathPrefix,
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "html"],
  };
}
