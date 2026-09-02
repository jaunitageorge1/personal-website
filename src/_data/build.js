/**
 * Identifies the build. CI sets GITHUB_SHA; the live verification polls
 * /build.txt until the served value matches the commit it just deployed, so it
 * can tell a fresh deploy from the previous one still sitting at the CDN edge.
 * Locally it is "local", and the check falls back to plain reachability.
 */
export default { sha: process.env.GITHUB_SHA || "local" };
