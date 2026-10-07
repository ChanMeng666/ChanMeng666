// Read-only capture of @chanmeng666's own posts from the X web client.
//
// Run in the page context of https://x.com/chanmeng666 while signed in as the
// account (Claude in Chrome `javascript_tool`, or the DevTools console). It
// clicks the Posts and Replies tabs and scrolls each to the end so the client
// loads every post, then reads them out of the client's own in-memory store.
// It sends nothing anywhere and changes nothing on X.
//
// Result: `window.__xCapture` in the shape scripts/build-x-register.mjs reads
// (x/capture/latest.json). Getting it onto disk:
//   - DevTools console:  copy(JSON.stringify(window.__xCapture, null, 1))
//   - Claude in Chrome:  the tool truncates long strings, so read
//     `window.__xCapture.user` and then `window.__xChunk(0)`, `(1)`, … (twelve
//     posts per call, each a JSON string) and reassemble them.
//
// X renames its internals without notice. If the store is not found or the
// count does not match, fix this file rather than typing posts in by hand.

const HANDLE = "chanmeng666";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrollToEnd() {
  let last = -1;
  let same = 0;
  for (let i = 0; i < 200 && same < 5; i++) {
    window.scrollTo(0, document.documentElement.scrollHeight);
    await sleep(1200);
    const h = document.documentElement.scrollHeight;
    same = h === last ? same + 1 : 0;
    last = h;
  }
  window.scrollTo(0, 0);
}

for (const label of [/^Replies/, /^Posts/]) {
  const tab = [...document.querySelectorAll('[role="tab"]')].find((a) => label.test(a.innerText));
  if (tab) {
    tab.click();
    await sleep(2500);
    await scrollToEnd();
  }
}

// The Redux store hangs off a provider near the React root.
let store = null;
{
  const root = document.getElementById("react-root");
  const key =
    Object.keys(root).find((k) => k.startsWith("__reactContainer")) ||
    Object.keys(root.firstElementChild).find((k) => k.startsWith("__reactFiber"));
  const queue = [root[key] || root.firstElementChild[key]];
  for (let n = 0; queue.length && n < 5000 && !store; n++) {
    const f = queue.shift();
    if (!f) continue;
    if (f.memoizedProps?.store?.getState) store = f.memoizedProps.store;
    if (f.child) queue.push(f.child);
    if (f.sibling) queue.push(f.sibling);
  }
}
if (!store) throw new Error("X client store not found: update x/capture/snippet.js");

const { tweets, users } = store.getState().entities;
const me = Object.values(users.entities).find((u) => u.screen_name === HANDLE);
if (!me) throw new Error(`@${HANDLE} is not in the client store: open the profile page first`);

const unescape = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const prune = (o) =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v != null && !(Array.isArray(v) && v.length === 0)),
  );

const posts = Object.values(tweets.entities)
  .filter((t) => t.user === me.id_str)
  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at) || (BigInt(a.id_str) < BigInt(b.id_str) ? -1 : 1))
  .map((t) => {
    // display_text_range drops the leading @mentions of a reply and the
    // trailing media link; t.co links are swapped for what they point to.
    let text = t.full_text || t.text || "";
    const [from, to] = t.display_text_range || [0, text.length];
    text = [...text].slice(from, to).join("");
    for (const u of t.entities?.urls || []) text = text.split(u.url).join(u.expanded_url);
    const quoted = t.quoted_status || t.quoted_status_id_str || null;
    const reposted = t.retweeted_status || null;
    return prune({
      id: t.id_str,
      at: new Date(t.created_at).toISOString(),
      conv: t.conversation_id_str,
      replyTo: t.in_reply_to_status_id_str,
      replyToUser: t.in_reply_to_screen_name,
      lang: t.lang,
      text: unescape(text),
      urls: (t.entities?.urls || []).map((u) => u.expanded_url),
      mentions: (t.entities?.user_mentions || []).map((u) => u.screen_name),
      hashtags: (t.entities?.hashtags || []).map((h) => h.text),
      media: (t.extended_entities?.media || []).map((m) =>
        prune({
          type: m.type,
          url: m.media_url_https,
          alt: m.ext_alt_text,
          w: m.original_info?.width,
          h: m.original_info?.height,
          dur: m.video_info?.duration_millis,
        }),
      ),
      quoted,
      quotedUser: quoted ? users.entities[tweets.entities[quoted]?.user]?.screen_name : null,
      repostOf: reposted,
      repostOfUser: reposted ? users.entities[tweets.entities[reposted]?.user]?.screen_name : null,
      m: {
        views: Number(t.views?.count || 0),
        likes: t.favorite_count,
        replies: t.reply_count,
        reposts: t.retweet_count,
        quotes: t.quote_count,
        bookmarks: t.bookmark_count,
      },
    });
  });

let bio = me.description || "";
for (const u of me.entities?.description?.urls || []) bio = bio.split(u.url).join(u.display_url);

window.__xCapture = {
  capturedAt: new Date().toISOString().slice(0, 10),
  source: `x.com web client, signed in as @${HANDLE}; read with x/capture/snippet.js`,
  user: {
    id: me.id_str,
    handle: me.screen_name,
    name: me.name,
    bio: unescape(bio),
    bioLinks: (me.entities?.description?.urls || []).map((u) => u.expanded_url),
    location: me.location,
    website: me.entities?.url?.urls?.[0]?.expanded_url || null,
    joined: new Date(me.created_at).toISOString(),
    verified: !!me.is_blue_verified,
    followers: me.followers_count,
    following: me.friends_count,
    posts: me.statuses_count,
    media: me.media_count,
    likesGiven: me.favourites_count,
    pinned: me.pinned_tweet_ids_str || [],
    avatar: me.profile_image_url_https,
    banner: me.profile_banner_url,
  },
  posts,
};
window.__xChunk = (i) => posts.slice(i * 12, i * 12 + 12).map((p) => JSON.stringify(p));

// The profile's own post count is the completeness check.
({
  captured: posts.length,
  profileSays: me.statuses_count,
  complete: posts.length === me.statuses_count,
  chunks: Math.ceil(posts.length / 12),
});
