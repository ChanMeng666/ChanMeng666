// Which basics.profiles URLs may go into a JSON-LD `sameAs`.
//
// schema.org `sameAs` says "this URL is the same entity", and search and AI
// engines use it to tell Chan apart from the many other people named Chan Meng.
// So it takes identity pages only. A mail link, a CV download, a chat invite, a
// booking page, a tip jar or a page anchor is a way to reach her, not her, and
// stays out. Used by scripts/build.mjs and cv/build-jsonld.mjs.

const NOT_IDENTITY_NETWORKS = new Set([
  "Email",
  "Resume",
  "Discord",
  "Newsletter",
  "Cal",
  "BuyMeACoffee",
]);

/**
 * @param {{ network?: string, url?: string }} profile
 * @returns {boolean}
 */
export function isSameAsProfile(profile) {
  const url = profile?.url ?? "";
  if (!/^https:\/\//.test(url)) return false; // drops mailto: and anything not a web page
  if (/\.pdf($|\?)/i.test(url)) return false;
  if (url.includes("#")) return false;
  return !NOT_IDENTITY_NETWORKS.has(profile.network ?? "");
}
