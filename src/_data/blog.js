/** Blog page. Posts are drafts: titles and blurbs are placeholders. */
export default {
  /* Off until there are posts to publish. While false the page is not built,
     it leaves the navigation and the sitemap, and the "Subscribe to the blog"
     topic drops out of the contact form. Everything below is kept as-is; set
     this to true to bring it all back. */
  enabled: false,

  intro:
    "Notes from the rest of my life: trails hiked, languages half-learned, meals " +
    "over-ambitious, kilometres logged and places that changed my mind. Occasionally " +
    "accessibility sneaks in anyway.",

  topics: [
    "Hiking", "Language learning", "Cooking", "Fitness",
    "Travel", "Photography", "Accessibility", "AI",
  ],

  beyond: [
    "I’ve been a reading tutor with the Washington Literacy Center since 2022 — adult literacy is where my belief in education as a way out of poverty gets practical, one learner at a time. It’s the volunteer work I protect on any calendar, on any continent.",
    "And there have been a few continents: Seattle to Washington, DC to Melbourne, with standards work carrying me through Nice, Seville, Osaka and Benin along the way. Moving around the world taught me the same lesson twice — in French to B2, in Spanish still happily conversational, and now from the very first letters of Farsi: being a beginner somewhere is the fastest way to learn how people actually experience your work.",
  ],

  /* Add `image: { src, alt }` to a post to give its card a real photograph.
     Without one the card shows a decorative panel and no image is announced. */
  posts: [
    {
      topic: "Hiking", date: "Draft",
      title: "What the Grampians taught me about pacing",
      blurb: "A long weekend on Gariwerd trails, the art of the sustainable climb, and why the summit is the least interesting part.",
      read: "6 min read",
    },
    {
      topic: "Language learning", date: "Draft",
      title: "B2 French, A1 humility",
      blurb: "Certifying at B2 taught me less about French than about being a beginner again — a skill every trainer should keep sharp.",
      read: "5 min read",
    },
    {
      topic: "Cooking", date: "Draft",
      title: "Recipes are just documentation",
      blurb: "What writing 60 training courses taught me about writing a curry that someone else can actually reproduce.",
      read: "4 min read",
    },
    {
      topic: "Fitness", date: "Draft",
      title: "Progressive overload, applied to everything",
      blurb: "The gym principle that quietly runs my whole life: consistency over intensity, small increments, deload weeks included.",
      read: "4 min read",
    },
    {
      topic: "Travel", date: "Draft",
      title: "Nice, Seville, Osaka, Benin: a standards passport",
      blurb: "Half my travel started as a W3C meeting or a conference talk. The other half is what happened after I missed the return flight window on purpose.",
      read: "7 min read",
    },
    {
      topic: "Accessibility", date: "Draft",
      title: "The trail is an interface too",
      blurb: "Grading, signage, rest points: what accessible hiking infrastructure has in common with accessible software — and where it does better.",
      read: "6 min read",
    },
  ],
};
