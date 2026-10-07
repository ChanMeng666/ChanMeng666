// Read-only capture of @chanmeng666's own posts from the X web client.
//
// Run in the page context of https://x.com/chanmeng666 while signed in as the
// account (Claude in Chrome `javascript_tool`, or the DevTools console). It
// clicks the Replies and Posts tabs and scrolls each to the end so the client
// loads every post, then reads them out of the client's own in-memory store.
// It makes no request of its own, sends nothing anywhere and changes nothing
// on X.
//
// The call returns "started" at once and the work goes on in the background
// (scrolling takes longer than one tool call may). Read `window.__xStatus`
// until it shows { complete: true, … } or { error }.
//
// Result: `window.__xCapture`, in the shape scripts/build-x-register.mjs reads
// (x/capture/latest.json). Getting it onto disk:
//   - Claude in Chrome: the tool cuts any string it returns at about 1,000
//     characters, so the data leaves through the clipboard. Click once on the
//     page to give it focus, run `await window.__xCopy()`, then
//     `pwsh .claude/skills/x-sync/scripts/save-capture.ps1`.
//   - DevTools console: `await window.__xCopy()` works there too.
//
// X renames its internals without notice. If the store is not found or the
// count does not match, fix this file rather than typing posts in by hand.
// The whole procedure is the `x-sync` skill (.claude/skills/x-sync/).

window.__xStart = () => {
  const HANDLE = "chanmeng666";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  window.__xStatus = { running: true };
  (async () => {
    if (location.hostname !== "x.com" || location.pathname.split("/")[1].toLowerCase() !== HANDLE) {
      throw new Error(`open https://x.com/${HANDLE} first`);
    }
    const account = document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]')?.innerText || "";
    if (!account.toLowerCase().includes(`@${HANDLE}`)) {
      throw new Error(`signed in as "${account.replace(/\s+/g, " ").trim() || "nobody"}", not @${HANDLE}`);
    }

    const scrollToEnd = async () => {
      let last = -1;
      let same = 0;
      for (let i = 0; i < 400 && same < 5; i++) {
        window.scrollTo(0, document.documentElement.scrollHeight);
        await sleep(1200);
        const h = document.documentElement.scrollHeight;
        same = h === last ? same + 1 : 0;
        last = h;
      }
      window.scrollTo(0, 0);
    };
    for (const label of [/^Replies/, /^Posts/]) {
      const tab = [...document.querySelectorAll('[role="tab"]')].find((a) => label.test(a.innerText));
      if (!tab) throw new Error(`the profile has no "${label.source.slice(1)}" tab: has X changed the page?`);
      window.__xStatus = { running: true, reading: label.source.slice(1) };
      tab.click();
      await sleep(2500);
      await scrollToEnd();
    }

    // The Redux store hangs off a provider near the React root.
    let store = null;
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
    if (!store) throw new Error("X client store not found: update x/capture/snippet.js");

    const { tweets, users } = store.getState().entities;
    const me = Object.values(users.entities).find((u) => u.screen_name?.toLowerCase() === HANDLE);
    if (!me) throw new Error(`@${HANDLE} is not in the client store`);

    const unescape = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    const prune = (o) =>
      Object.fromEntries(
        Object.entries(o).filter(([, v]) => v != null && !(Array.isArray(v) && v.length === 0)),
      );

    const posts = Object.values(tweets.entities)
      .filter((t) => t.user === me.id_str)
      .sort((a, b) => (BigInt(a.id_str) < BigInt(b.id_str) ? -1 : 1))
      .map((t) => {
        // display_text_range drops the leading @mentions of a reply and the
        // trailing media link; t.co links are swapped for what they point to.
        // Offsets are code points, so slice the spread string, never the raw one.
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

    // The profile's own post count is the completeness check.
    const complete = posts.length === me.statuses_count;
    const capture = {
      // The Auckland date, which is how the register dates everything.
      capturedAt: new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date()),
      source: `x.com web client, signed in as @${HANDLE}; read with x/capture/snippet.js`,
      complete,
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
    window.__xCapture = capture;

    // One post per line, so a later capture reads as a small diff.
    window.__xCopy = async () => {
      const { posts: rows, ...head } = capture;
      const json =
        "{\n" +
        Object.entries(head).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)},\n`).join("") +
        '"posts": [\n' +
        rows.map((p) => JSON.stringify(p)).join(",\n") +
        "\n]\n}\n";
      await navigator.clipboard.writeText(json);
      return { copied: rows.length, characters: json.length };
    };

    window.__xStatus = {
      complete,
      captured: posts.length,
      profileSays: me.statuses_count,
      followers: me.followers_count,
      following: me.friends_count,
      newest: posts.at(-1)?.at,
      note: complete ? undefined : "fewer posts loaded than the profile counts: reload the page and start again",
    };
  })().catch((error) => {
    window.__xStatus = { error: String(error) };
  });
  return "started";
};
window.__xStart();
