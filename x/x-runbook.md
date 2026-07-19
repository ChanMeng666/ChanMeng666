# X profile update runbook

Precise, step-by-step operator instructions for updating Chan Meng's live X
(Twitter) profile **@chanmeng666** with `claude-in-chrome`. This is the
execution script the operator follows *once every input is finalized*.

**Scope.** Updates in one live session: header photo, display name, bio,
location, website, and one pinned 3-tweet thread. It does **not** cover writing
the copy (that lives in `x-profile.md`), the thread (`x-pinned-tweet.md`), or
rendering the header (`header/x-header.png`) — those are upstream deliverables
and must be finalized and accepted before this runbook begins.

**Inputs (sibling files, all paths relative to `x/`):**
- `x-profile.md` — display name, bio, location, website, and the
  **Previous-live-state** rollback table to fill during Step 1.
- `x-pinned-tweet.md` — the 3-tweet thread to post and pin.
- `header/x-header.png` — the 3000×1000 header image to upload.
- `screenshots/` — destination for every gate screenshot.

**Gate discipline.** One gate = one screenshot saved to `x/screenshots/` with
the exact filename listed below. A gate is a decision point: look at the
screenshot, confirm the stated condition, and only then proceed. Never skip a
gate to "save time" — the whole point is that the public profile is edited in a
near-atomic single Save, and the gates are what make that single Save safe.

**The backbone: single-Save atomicity.** X's *Edit profile* modal commits the
header photo, display name, bio, location, **and** website together in **one
Save click**. Do the entire profile edit inside one modal session and click
Save exactly once. This is what avoids a half-updated public window (e.g. new
name live but old header still showing). If any pre-Save gate fails, **Cancel
the whole modal** rather than saving a partial state.

**Tooling note.** All browser actions use `claude-in-chrome`. The **first**
browser call of the session is always `tabs_context_mcp` to establish the tab
context; every later call uses tab ids returned by that call. If the extension
ever loses the tab, re-run `tabs_context_mcp` and use the **fresh** ids — never
reuse a stale tab id. Text fields are edited with `form_input` (always clear the
field before typing). File pickers are driven with `file_upload` /
`upload_image` using an **absolute** path.

---

## Preconditions checklist

Do not open the browser until every item is checked:

- [ ] **Copy verified.** `x-profile.md` character counts pass: display name
      ≤50, bio ≤160. Re-run the `node -e` block at the bottom of `x-profile.md`
      and confirm all rows read `OK`.
- [ ] **Thread verified.** `x-pinned-tweet.md` finalized; each of the 3 tweets
      ≤280 chars; URLs spelled correctly (they will render as cards).
- [ ] **Header accepted.** `header/x-header.png` rendered and visually accepted
      at 3000×1000 (3:1). Confirm the file exists at the absolute path
      `D:\github_repository\ChanMeng666\x\header\x-header.png`.
- [ ] **Chrome logged in.** Chrome is running and logged into the
      **@chanmeng666** X account (not a different handle).
- [ ] **Extension connected.** `claude-in-chrome` extension is connected; the
      **first** call will be `tabs_context_mcp`.
- [ ] **Site permission.** x.com site permission is granted in the extension,
      so actions execute without per-call permission stalls.

If any box is unchecked, stop and resolve it before Step 1.

---

## Step 1 — Capture current state (GATE 1)

1. First browser call: `tabs_context_mcp` to get tab context.
2. Navigate to `https://x.com/chanmeng666`.
3. Wait for the profile to fully load (header image, avatar, name, bio, pinned
   tweet all visible).
4. Take a full-profile screenshot → **`screenshots/00-before-profile.png`**.
5. **Transcribe** the current live values into the **Previous live state**
   table in `x-profile.md` (replace each `_(filled during live execution)_`):
   display name, bio, location, website, header photo (describe it — X keeps no
   image history, so note this screenshot is the only visual record), and the
   current pinned tweet (text + URL, or "none").

**GATE 1 — right account.** In `00-before-profile.png`, confirm the handle
reads **@chanmeng666**. If it shows any other handle, STOP — you are logged into
the wrong account. Do not proceed until the correct account is confirmed.

---

## Step 2 — Edit profile in ONE modal session

Everything in this step happens inside a single *Edit profile* modal. Do not
navigate away, and do not click Save until all four gates below are satisfied.

1. Click **Edit profile**.
2. **Upload the header.** Click the header **camera icon** to open the file
   picker, then drive the file input with `file_upload` / `upload_image` using
   the absolute path
   `D:\github_repository\ChanMeng666\x\header\x-header.png`.
3. **Inspect the crop preview** X shows for the header.
   - Screenshot the crop preview → **`screenshots/01-header-crop-preview.png`**
     (**GATE 2**).
   - **GATE 2 — crop is correct.** Check that no essential header content is
     cut off by X's 3:1 crop frame. **If the crop looks wrong: CANCEL the modal
     without saving**, fix `header/header.html`, re-render `x-header.png`, and
     **restart Step 2 from the beginning**. Do not try to save a bad crop and
     fix it later — that publishes a broken header.
4. **Fill the text fields** (clear each field first, then type with
   `form_input`), taking values verbatim from `x-profile.md` "Fields to set":
   - Display name: `Chan Meng — AI Agent Architect`
   - Bio: the chosen primary bio (145 chars).
   - Location: `Auckland, New Zealand`
   - Website: `https://chanmeng.org/`
5. Screenshot the **completed modal, pre-Save** →
   **`screenshots/02-modal-pre-save.png`** (**GATE 3**).
   - **GATE 3 — modal is correct and Save is enabled.** Verify all four fields
     read exactly as above, the new header crop looks right, and the **Save**
     button is enabled (a disabled Save almost always means a field overflows —
     see failure modes). Only proceed when everything matches.
6. Click **Save exactly once.**
7. Screenshot the resulting profile → **`screenshots/03-after-save.png`**
   (**GATE 4**).
   - **GATE 4 — single Save committed everything.** Confirm the new header,
     name, bio, location, and website link are all live together. If any field
     did not take, re-open Edit profile and correct it in a fresh single-Save
     session (do not leave the profile half-updated).

---

## Step 3 — Responsive sanity check

X renders the header differently on narrow viewports, and the avatar overlaps
the header's lower-left.

1. Resize the window to ~**430px** width with `resize_window`.
2. Screenshot the header + avatar region →
   **`screenshots/04-mobile-check.png`**.
3. Verify no essential header content (wordmark, tagline, key graphic) is hidden
   behind the avatar circle or clipped at the narrow width. If it is, the header
   art needs a safe-zone fix — treat this like a failed GATE 2: fix
   `header/header.html`, re-render, and redo the header via a fresh Step 2
   modal.
4. Restore the window to desktop size.

---

## Step 4 — Post the pinned thread

1. Open the composer (the **Post** button / compose view).
2. Paste **tweet 1** text from `x-pinned-tweet.md`.
3. Use the **`+` ("Add another post")** control to append **tweet 2**, then
   again for **tweet 3**, so all three are staged as a single thread.
4. Screenshot the composer **before posting** →
   **`screenshots/05-composer-pre-post.png`** (**GATE 5**).
   - **GATE 5 — thread is clean.** Check all three tweets for typos, mangled or
     truncated URLs, and correct order. Fix in the composer before posting.
5. Click **Post all**.
6. Screenshot the posted thread → **`screenshots/06-thread-posted.png`**.

---

## Step 5 — Pin the thread (GATE 6)

1. On **tweet 1** of the just-posted thread, open the **⋯** (more) menu.
2. Choose **"Pin to your profile."**
3. Confirm X's in-app confirmation dialog.
   - **This is X's own modal confirm — clicking it is fine and expected.**
   - **Do not** trigger or accept any *browser-native* JavaScript dialog; only
     interact with X's in-page UI.
4. Navigate to `https://x.com/chanmeng666` and screenshot the profile showing
   the pinned tweet at the top → **`screenshots/07-pinned.png`** (**GATE 6**).
   - **GATE 6 — correct tweet pinned.** Confirm tweet 1 of the thread now shows
     the "Pinned" label at the top of the profile.

---

## Step 6 — Final verification

1. Restore desktop window size; take a full-profile desktop screenshot →
   **`screenshots/08-final-desktop.png`**.
2. **Field-by-field compare** against `x-profile.md`:
   - Display name matches exactly.
   - Bio matches exactly (watch the em dash and the macron in "Whā").
   - Location = `Auckland, New Zealand`.
   - Website link card renders and points to `chanmeng.org`.
   - Header is the new image, correctly cropped.
   - Pinned tweet is thread-tweet 1.
3. Confirm the **website link card** and any **thread URLs** render as link
   cards where expected (they may take a moment to unfurl).

When all match, the update is complete.

---

## Rollback

Use the **Previous live state** table in `x-profile.md` (filled in Step 1) as
the source of truth.

- **Profile fields (name / bio / location / website):** re-open *Edit profile*
  and restore each field via the same **single-Save** flow (clear, retype, Save
  once).
- **Header photo:** requires the *old* image file. **X keeps no image
  history** — if the previous header was never saved to disk,
  `screenshots/00-before-profile.png` is the only record of it, and it cannot be
  re-uploaded at original resolution. Note this limitation to Chan.
- **Unpin:** on the pinned tweet, ⋯ menu → **"Unpin from profile."**
- **Thread:** deleting the thread also deletes its replies, likes, and metrics.
  For a **typo caught early** (before engagement), delete-and-repost quickly is
  acceptable. For an established thread, prefer leaving it and posting a
  correction rather than losing the engagement.

---

## Failure modes

| Symptom | Cause | Action |
|---|---|---|
| Header upload rejected (size/format) | X's uploader limits or format quirk | Fall back to a **1× (1500×500)** export of the header and re-upload; keep the same crop check (GATE 2). |
| **Save** button disabled in the modal | A field exceeds its limit (name >50 or bio >160) | Re-run the char-count block in `x-profile.md`; trim the offending field; do not force it. |
| Extension lost the tab / stale-id errors | Tab context expired | Re-run `tabs_context_mcp`, get **fresh** tab ids, retry from the current step. **Never reuse stale tab ids.** |
| Header crop cuts off content | Art not inside the 3:1 safe zone | Treat as failed GATE 2: **Cancel the modal**, fix `header/header.html`, re-render, restart Step 2. |
| X shows a challenge / verification / login prompt | Account security check | **STOP and hand off to Chan.** Do not attempt to solve verification challenges. |
| Composer won't stage a 3rd tweet | Character overflow on an earlier tweet | Recheck each tweet ≤280 in `x-pinned-tweet.md`; fix before adding more. |

---

### Screenshot manifest (all in `x/screenshots/`)

| File | Gate | Captures |
|---|---|---|
| `00-before-profile.png` | GATE 1 | Current live profile + correct-account check |
| `01-header-crop-preview.png` | GATE 2 | Header crop preview inside the modal |
| `02-modal-pre-save.png` | GATE 3 | Completed Edit-profile modal before Save |
| `03-after-save.png` | GATE 4 | Profile immediately after the single Save |
| `04-mobile-check.png` | — | Header + avatar overlap at ~430px |
| `05-composer-pre-post.png` | GATE 5 | Full 3-tweet thread staged in composer |
| `06-thread-posted.png` | — | Thread live on timeline |
| `07-pinned.png` | GATE 6 | Profile with thread pinned at top |
| `08-final-desktop.png` | — | Final desktop profile for field-by-field compare |
