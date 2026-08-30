/**
 * Eleventy config.
 *
 * The site is deliberately plain: Nunjucks templates in, semantic HTML out,
 * no client-side JavaScript and no CSS build step. Content lives in
 * `src/_data/*.js` so copy can be edited without touching markup.
 */
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addWatchTarget("src/assets/css/");

  // Absolute URL for canonical links, OG tags and the sitemap.
  eleventyConfig.addFilter("absoluteUrl", (path, base) =>
    new URL(path, base).toString()
  );

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());

  return {
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
