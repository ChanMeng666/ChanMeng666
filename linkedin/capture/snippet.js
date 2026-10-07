// Read-only capture of the posts on a LinkedIn page Chan runs: her own profile
// or a company page she administers. The page the tab is on decides which:
//
//   https://www.linkedin.com/in/chanmeng666/recent-activity/all/   her own posts
//   https://www.linkedin.com/company/archcanvas/posts/?feedView=all&viewAsMember=true
//                                                the ArchCanvas page (without viewAsMember an admin is
//                                                redirected to a numeric admin address)
//
// Run it in the page context while signed in as her (Claude in Chrome
// `javascript_tool`, or the DevTools console). It asks LinkedIn's own web API
// for the feed, twenty updates at a time with a pause between pages, exactly as
// the page does when a reader scrolls. It sends nothing anywhere and changes
// nothing on LinkedIn.
//
// A long feed takes about a minute, longer than a tool call may wait, so the
// work runs in the background: the snippet returns "started" at once. Ask for
// `window.__liStatus` until it reads { complete: true, … } (or shows `error`).
//
// Result, in the shapes scripts/build-linkedin-register.mjs reads:
//   window.__liCapture   → <register>/capture/latest.json          (tracked)
//   window.__liPrivate   → <register>/capture/latest.private.json  (gitignored)
// where <register> is linkedin/ for the profile and linkedin/company/<name>/
// for a company page. The private half is the impression counts, which only the
// author can see; LinkedIn's feed carries them for a member's posts and not
// for a page's, so a page capture has none and its private file is not written.
//
// Getting them onto disk:
//   - DevTools console:  copy(JSON.stringify(window.__liCapture, null, 1))
//   - Claude in Chrome:  the tool cuts strings at about 1,000 characters, so
//     click once on the page to focus it, run `await window.__liCopy("public")`
//     (then "private"), and write each file from the clipboard
//     (`Get-Clipboard -Raw` in PowerShell).
//
// LinkedIn renames its internals without notice. If a request stops returning
// 200 or the shapes change, fix this file rather than typing posts in by hand.

// The whole capture is one function, kept in the tab's sessionStorage, so the
// second page of a sync does not need the source again. After navigating to
// the other page in the SAME tab, run:
//   new Function("return " + sessionStorage.getItem("__liStart"))()
window.__liStart = () => {
  const MEMBER = "chanmeng666";
  const PAGE = 20;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  window.__liStatus = { running: true };
  window.__liRun = (async () => {
    const company = (location.pathname.match(/^\/company\/([^/]+)/) || [])[1];
    if (!company && !location.pathname.startsWith(`/in/${MEMBER}/`)) {
      throw new Error("open the profile's activity page or a company page's posts first");
    }
    // An admin who opens a page without ?viewAsMember=true is redirected to its
    // numeric admin address, which does not carry the page's name.
    if (company && /^\d+$/.test(company)) {
      throw new Error("this is the page's admin address: open /company/<name>/posts/?feedView=all&viewAsMember=true");
    }

    const csrf = (document.cookie.match(/JSESSIONID="?([^";]+)/) || [])[1];
    if (!csrf) throw new Error("not signed in to LinkedIn in this tab");
    const api = async (path) => {
      const res = await fetch(`/voyager/api${path}`, {
        headers: {
          "csrf-token": csrf,
          accept: "application/vnd.linkedin.normalized+json+2.1",
          "x-restli-protocol-version": "2.0.0",
        },
        credentials: "include",
      });
      if (res.status !== 200) throw new Error(`LinkedIn answered ${res.status} for ${path.split("?")[0]}`);
      return res.json();
    };

    const meRes = await api("/me");
    const me = meRes.included.find((x) => x.publicIdentifier);
    if (me?.publicIdentifier !== MEMBER) throw new Error(`signed in as ${me?.publicIdentifier}, not ${MEMBER}`);

    // Who the register is about, and where its feed is.
    let user;
    let feedPath;
    if (company) {
      const res = await api(
        "/organization/companies?decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-12" +
          `&q=universalName&universalName=${encodeURIComponent(company)}`,
      );
      const org = res.included.find((x) => x.universalName === company);
      if (!org) throw new Error(`no company page named ${company}`);
      user = {
        kind: "company",
        handle: company,
        name: org.name,
        headline: org.tagline,
        followers: res.included.find((x) => x.followerCount != null)?.followerCount ?? null,
        website: org.callToAction?.url || null,
      };
      feedPath = (start) =>
        `/organization/updatesV2?companyIdOrUniversalName=${encodeURIComponent(company)}&count=${PAGE}` +
        `&moduleKey=ORGANIZATION_MEMBER_FEED_DESKTOP&numComments=0&numLikes=0&q=companyRelevanceFeed&start=${start}`;
    } else {
      const profileUrn = (me.dashEntityUrn || me.entityUrn).replace("fs_miniProfile", "fsd_profile");
      user = {
        kind: "member",
        handle: MEMBER,
        name: `${me.firstName} ${me.lastName}`,
        headline: me.occupation,
        followers:
          Number((document.body.innerText.match(/Followers\s*([\d,]+)/) || [])[1]?.replace(/,/g, "")) || null,
      };
      feedPath = (start, token) =>
        `/identity/profileUpdatesV2?q=memberShareFeed&moduleKey=member-shares%3Aphone&count=${PAGE}&start=${start}` +
        `&profileUrn=${encodeURIComponent(profileUrn)}&includeLongTermHistory=true` +
        (token ? `&paginationToken=${encodeURIComponent(token)}` : "");
    }

    // Every page of the feed. An empty page is the end.
    const pages = [];
    let complete = false;
    for (let start = 0, token = null; pages.length < 200; ) {
      const page = await api(feedPath(start, token));
      const elements = page.data["*elements"] || [];
      if (!elements.length) {
        complete = true;
        break;
      }
      pages.push(page);
      token = page.data.metadata?.paginationToken || token;
      start += elements.length;
      await sleep(1500 + Math.random() * 1000);
    }

    const byUrn = new Map(pages.flatMap((p) => p.included).map((x) => [x.entityUrn, x]));
    const updates = pages
      .flatMap((p) => p.data["*elements"])
      .map((urn) => byUrn.get(urn))
      // A page's feed also carries LinkedIn's own promotion cards.
      .filter((u) => /^urn:li:activity:/.test(u?.updateMetadata?.urn || ""));

    const prune = (o) =>
      Object.fromEntries(
        Object.entries(o).filter(([, v]) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0)),
      );
    const idOf = (u) => u.updateMetadata.urn.split(":").pop();
    // An activity id carries its creation time in the bits above the low 22.
    const timeOf = (id) => new Date(Number(BigInt(id) >> 22n)).toISOString();
    const cleanUrl = (url) => (url || "").split("?")[0] || null;
    const firstLine = (text) => {
      const line = (text || "").trim().split("\n")[0];
      return line.length > 140 ? `${line.slice(0, 139)}…` : line;
    };

    function mediaOf(u) {
      const c = u.content;
      if (!c) return [];
      const type = (c.$type || "").split(".").pop();
      if (type === "ImageComponent") {
        return (c.images || []).map((img) => {
          const best = (img.attributes?.[0]?.vectorImage?.artifacts || []).reduce(
            (a, b) => (!a || b.width > a.width ? b : a),
            null,
          );
          return prune({ type: "image", w: best?.width, h: best?.height, alt: img.accessibilityText });
        });
      }
      if (type === "LinkedInVideoComponent") {
        const play = byUrn.get(c["*videoPlayMetadata"]);
        return [prune({ type: "video", ms: play?.duration, ratio: play?.aspectRatio })];
      }
      if (type === "ArticleComponent") {
        return [
          prune({
            type: "article",
            title: c.title?.text,
            source: c.subtitle?.text,
            url: c.navigationContext?.actionTarget,
          }),
        ];
      }
      if (type === "DocumentComponent") {
        return [prune({ type: "document", title: c.document?.title, pages: c.document?.totalPageCount })];
      }
      if (type === "CelebrationComponent") return [prune({ type: "celebration", title: c.headline?.text })];
      if (type === "EntityComponent") {
        return [prune({ type: "entity", title: c.title?.text, url: cleanUrl(c.navigationContext?.actionTarget) })];
      }
      return [{ type: type.replace(/Component$/, "").toLowerCase() || "other" }];
    }

    function countsOf(u) {
      const detail = byUrn.get(u["*socialDetail"]);
      return byUrn.get(detail?.["*totalSocialActivityCounts"]) || {};
    }

    // Someone else's post, as far as the register needs it: who, where, how it opens.
    const refOf = (u) =>
      prune({
        author: u.actor?.name?.text,
        url: cleanUrl(u.socialContent?.shareUrl),
        at: timeOf(idOf(u)),
        opens: firstLine(u.commentary?.text?.text),
      });

    const impressions = {};
    const posts = updates.map((u, order) => {
      const id = idOf(u);
      // A plain repost is the original update under a "reposted this" header: its
      // id, time and counts are the original author's.
      if (u.header) return { order, kind: "repost", original: { id, ...refOf(u) } };

      const text = u.commentary?.text?.text || "";
      const named = (u.commentary?.text?.attributes || [])
        .filter((a) => a.type === "PROFILE_MENTION" || a.type === "COMPANY_NAME")
        // LinkedIn counts these offsets in code points; an emoji is two UTF-16 units.
        .map((a) => [...text].slice(a.start, a.start + a.length).join(""));
      const counts = countsOf(u);
      if (counts.numImpressions != null) impressions[id] = counts.numImpressions;
      const original = byUrn.get(u["*resharedUpdate"]);
      return prune({
        order,
        id,
        kind: original ? "reshare" : "post",
        at: timeOf(id),
        url: cleanUrl(u.socialContent?.shareUrl),
        edited: /Edited/.test(u.actor?.subDescription?.text || "") || null,
        lang: u.commentary?.originalLanguage,
        text,
        mentions: [...new Set(named)],
        hashtags: [...new Set(text.match(/#[\p{L}\p{N}_]+/gu) || [])],
        links: [...new Set(text.match(/https?:\/\/[^\s)\]]+/g) || [])],
        media: mediaOf(u),
        original: original ? { id: idOf(original), ...refOf(original) } : null,
        m: {
          reactions: counts.numLikes || 0,
          comments: counts.numComments || 0,
          reposts: counts.numShares || 0,
          types: Object.fromEntries((counts.reactionTypeCounts || []).map((r) => [r.reactionType, r.count])),
        },
      });
    });

    const capturedAt = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());
    const where = company ? `the ${user.name} page` : "her activity feed";

    window.__liCapture = {
      capturedAt,
      source: `linkedin.com web client, signed in as ${MEMBER}; ${where} read with linkedin/capture/snippet.js`,
      complete,
      // A member's feed comes newest first; a page's comes in LinkedIn's own order.
      newestFirst: !company,
      user,
      posts,
    };
    window.__liPrivate = Object.keys(impressions).length ? { capturedAt, impressions } : null;
    window.__liCopy = async (which) => {
      const data = which === "private" ? window.__liPrivate : window.__liCapture;
      if (!data) return { copied: null, note: "this capture has no private half" };
      const json = JSON.stringify(data, null, 1);
      await navigator.clipboard.writeText(json);
      return { copied: which === "private" ? "private" : "public", characters: json.length };
    };

    window.__liStatus = {
      complete,
      register: company ? `linkedin/company/${company}/` : "linkedin/",
      updates: posts.length,
      own: posts.filter((p) => p.kind !== "repost").length,
      reposts: posts.filter((p) => p.kind === "repost").length,
      followers: user.followers,
      private: !!window.__liPrivate,
    };
  })().catch((error) => {
    window.__liStatus = { error: String(error) };
  });
  return "started";
};
try {
  sessionStorage.setItem("__liStart", `(${window.__liStart})()`);
} catch {}
window.__liStart();
