# Pinned tweet kit — @chanmeng666

Copy-paste-ready pinned intro thread plus reusable tweet templates for Chan
Meng (@chanmeng666). All copy is English. Voice: flat, editorial, confident;
0–1 emoji per tweet, at most one hashtag and only when it genuinely helps.

Budget rule used throughout: **280 chars per tweet, and every URL counts as
exactly 23 chars** (t.co wraps every link to 23 regardless of real length).
Verified counts are at the bottom of this file.

Note on ArchCanvas: link **only** https://archcanvas.uk — the repo is private
and must never be linked or mentioned.

---

## The pinned thread (3 tweets)

A pin shows only the first tweet, so Tweet 1 stands fully on its own: who Chan
is, the human-stakes value, and the compressed proof (480+ GitHub stars across
shipped AI tools). Tweets 2 and 3 continue for anyone who expands the thread.

**Tweet 1** — standalone intro + proof

```
I'm Chan Meng — I architect AI agents and ship full-stack products, then teach others to do the same.

480+ GitHub stars across AI tools I've shipped solo: MCP servers, coding-agent plugins, a floor-plan language, an AI career agent.

Auckland, NZ → https://chanmeng.org/
```

**Tweet 2** — flagship rollcall with links

```
Five I build:

Google News MCP (PulseMCP Top Pick) https://github.com/ChanMeng666/server-google-news

echook for coding agents https://github.com/ChanMeng666/echook

ArchLang, a floor-plan language https://playground.archlang.uk

ArchCanvas AI architect https://archcanvas.uk

Vitex AI career agent https://vitex.org.nz
```

**Tweet 3** — what this feed does + CTA

```
What this feed is: building in public — AI agent architecture, full-stack shipping, and notes from the teaching cohorts I run.

Follow for the work as it ships. Everything in one place:

https://chanmeng.org/
```

---

## Alternates & templates

### (a) Single-tweet intro variant

Use this instead of the thread if you'd rather pin one tweet. Self-sufficient;
no follow-on required.

```
I'm Chan Meng — AI Agent Architect & full-stack engineer in Auckland, NZ. I architect AI agents, ship products end-to-end, and teach others to do the same. 480+ GitHub stars across tools I've built solo. Work + writing: https://chanmeng.org/
```

### (b) Product-launch template

Fill the `<slots>` and post when you ship something. Lead with what the user
gets, not the stack. One link only.

```
Shipped: <product name> — <what it does for the user, in one line>.

<one concrete proof point: a number, a capability, or who it's for>.

<url>
```

Budget note: fixed text above (labels, punctuation, newlines) is ~35 chars +
one URL at 23. That leaves roughly **220 chars** for the three `<slot>` lines
combined. Keep the "what it does" line under ~120 chars so it reads clean.

### (c) Milestone / metrics template

For a stars/adoption/usage milestone. Lead with the human meaning of the
number, not the number alone. Stars are fine to cite; never lead with commit
counts or solo-% and never mention pricing.

```
<product name> just crossed <metric + number> — <what that milestone means in plain terms>.

<optional one-line context: who's using it or what shipped to get here>.

<url>
```

Budget note: fixed scaffold is ~20 chars + one URL (23). About **235 chars**
for the slots. If you drop the optional context line, you gain ~40 chars and a
tighter tweet.

### (d) Teaching / thread-opener template

Opens a build-in-public or teaching thread. Tweet 1 must stand alone (a reader
may never open the thread). End with a soft "thread" cue, not a hard CTA. Reply
tweets carry the steps.

```
<the lesson or result, stated as a claim someone would want> — here's how I did it. 🧵

<one line of stakes: why it matters / what it unlocks>.

(<n>-part thread below.)
```

Budget note: no URL required in the opener (keeps all 280 for the hook). If you
add a link in the opener, subtract 23. Put links on the payoff reply, not the
hook.

---

## Character-count verification

Verification script replaces every URL with a 23-char token, then prints
`.length` for each tweet (Node):

```js
const urlRe = /https?:\/\/\S+/g;
const len = (s) => s.replace(urlRe, "x".repeat(23)).length;
// len(tweet) run for each of T1, T2, T3, and Alternate (a)
```

Actual output for the three thread tweets and alternate (a):

```
T1: 273 OK
T2: 277 OK
T3: 210 OK
ALT-a: 243 OK
```

All ≤ 280. Templates (b)/(c)/(d) contain `<slots>` and carry budget notes
above instead of a fixed count.
