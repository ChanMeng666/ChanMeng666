---
id: echook
title: echook
role: Creator and maintainer
period: "2025-11 – present"
status: active
kind: open-source-tool
repos:
  - ChanMeng666/echook
  - ChanMeng666/echook-promo-studio
  - ChanMeng666/echook-promo-video
live: https://github.com/ChanMeng666/echook
stack: [Python 3 standard library, Claude Code plugin hooks, Cursor hooks, Codex CLI hooks, PowerShell, afplay, mpg123/ffplay/paplay/aplay, ElevenLabs (sound generation), GitHub Actions]
stories: 8
publicEvidence: ["publications: Claude Code Audio Hooks: System Architecture"]
privateEvidence: 1
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/21-projects-oss-primary.yaml (echook entry)
  - data/profile/10-career.yaml (engram entry), data/profile/30-recognition.yaml (publications)
  - docs/ecosystem/lineage.yaml (echook rows)
  - data/profile/70-linkedin.yaml (echook project)
  - ChanMeng666/echook at v7.0.0 (README, AGENTS.md, CHANGELOG.md, docs/ARCHITECTURE.md, docs/PROJECT_STATUS.md, docs/RELEASING.md, docs/DIRECTORY_LISTING.md, hooks/, bin/, tests/, .github/workflows/smoke.yml)
  - ChanMeng666/echook v7.1.0 (CHANGELOG 7.1.0, docs/PROJECT_STATUS.md, docs/EVENT_BEHAVIOR_NOTES.md), released 2026-10-15
  - git log of ChanMeng666/echook, 2025-11-01 to 2026-10-13
  - GitHub issues #1-#14 and pull requests #2-#24 on ChanMeng666/echook, forks, code search
  - GitHub issue and code search for both names, web search (English, Chinese, Japanese), Hacker News, Reddit archive (2026-10-15)
  - audio-hooks manifest and the unit test suite, run locally on 2026-10-15
---

## In one breath

echook is a free, open-source add-on for three AI coding assistants (Claude Code, Cursor and
OpenAI's Codex). It plays a sound, shows a desktop notification, reads the agent's reply
aloud or posts to Slack when the agent finishes or needs permission, so a developer can look
away from the screen while it works. It also draws a status bar showing how much of the
agent's memory is used. You set it up by asking your AI assistant in plain English. I
designed and built it and still maintain it: it supports three editors from one codebase,
runs on Windows, macOS and Linux, and has 88 GitHub stars.

## The problem

AI coding agents work for minutes at a time and then stop, either finished or waiting for a
"may I run this command?" answer. The developer either watches the terminal or misses the
moment. The editors' own notifications are thin: a bell or a single chime, nothing per event,
and nothing that speaks, posts to a phone or warns before a usage limit.

The obvious answer is a one-line shell hook that plays a sound on "stop". That works on one
machine and then breaks on the next: Windows plays audio differently from macOS, WSL cannot
reach its own files from the Windows media player, and each editor registers hooks in its own
format, which changes between releases. And a tool configured through flags and config files
asks the developer to learn yet another surface, when the agent they already talk to could do
that for them.

## What I built

A Python program, standard library only, that each editor calls on every lifecycle event with
the event's JSON. It decides from the user's preferences whether to play a sound, show a
toast, speak or post a webhook, never blocks the agent, and logs each decision as structured
JSON lines. Around it, a command-line tool with a JSON-only interface that the user's AI agent
drives on their behalf, and a skill that maps a sentence ("snooze for an hour", "send alerts
to my Slack") to the right command.

- 39 hook events (3 on by default) plus 47 separately switchable matcher variants, mapped per
  editor: Claude Code, Cursor and Codex.
- Four output channels: audio (two themes, voice or chimes), desktop notification, speech
  that reads the agent's actual final message, and webhooks to Slack, Discord, Teams or ntfy.
- Warnings before the 5-hour and 7-day usage limits, each fired exactly once.
- A status line with 33 configurable segments, including context-window and quota bars.
- A CLI with 41 subcommands, stable error codes with a suggested recovery command, and a
  `manifest` command that describes the whole surface as JSON.
- One canonical source synced into the shipped plugin by a build script, with CI failing on
  any drift; tests on Ubuntu, Windows and macOS across Python 3.9, 3.12 and 3.13.
- A product film made in code from the product's own interface (echook-promo-studio).

**Who owns it.** I build general-purpose tools like echook in my own time, on my own
equipment, alongside full-time work, and I keep the IP. So I ask for a carve-out for that
work in employment agreements. When I joined Engram's architect cohort in May 2026, the
cohort agreement named claude-code-audio-hooks (echook's earlier name) and the rest of my
prior work as my own property (`10-career.yaml` › engram). If an interviewer asks about IP
clauses, that is the answer: I read the clause, and I ask for the carve-out up front.

## Stories

### S1. Designing the CLI for an agent, not for a person

- **Kind**: decision
- **Situation**: By early 2026 the tool had interactive installers and a configure script
  with menus. Users increasingly asked their AI agent to install and change it, and the agent
  stumbled on every prompt, spinner and "edit this file" instruction.
- **What I did**: In v5.0 (April 2026) I redesigned the contract around the agent as the
  operator. One CLI, `audio-hooks`, takes arguments and returns JSON only: no prompts, no
  menus. Every error has a fixed code (`AUDIO_FILE_MISSING`, `WEBHOOK_TIMEOUT`,
  `DUAL_INSTALL_DETECTED`, ...) and a `suggested_command`, so the agent recovers without
  scraping text. `audio-hooks manifest` emits every subcommand, hook, config key and error
  code as one JSON document so an agent can orient itself. A skill maps plain-English
  requests to commands. Anything an agent cannot do is returned as machine-readable
  `next_steps`. When a user tested v5.0.2 and found that my README claimed the agent could
  run `/reload-plugins` (it cannot: slash commands are REPL-only), I published v5.0.3 the
  same day correcting the claim and documenting the honest four-step install. In August I
  went further and replaced every claim in the README that a single search could refute
  with claims that can be checked, including an event count with its denominator.
- **Result**: The rule "the CLI is the only interface, JSON in, JSON out, no human-only
  path" is the first rule in the repo's agent guide and is enforced by tests for read-only
  commands and error-code coverage. 41 subcommands today.
- **Engineer's angle**: Designing for a non-human caller changes what "usability" means:
  determinism, stable codes and self-description matter more than friendly text. The
  `suggested_command` field turns an error into a plan. The cost is that the CLI has to be
  strict about input, which S8 shows the hard way.
- **Plain version**: I built the tool so that your AI assistant can operate it for you, so
  you never read the manual.
- **Follow-ups**:
  - *Why JSON and not plain text with good messages?* An agent parses JSON reliably; text
    changes between versions and breaks whatever scrapes it. Error codes stay stable.
  - *What could the agent still not do?* Reload plugins inside Claude Code. That is the one
    manual step, and the CLI says so in `next_steps` instead of pretending otherwise.
  - *How do you stop the docs overclaiming?* Counts come from `audio-hooks manifest`, not
    from memory, and claims are worded so they can be checked against the code.

### S2. Diagnosing silence and clipped sound from a user's report

- **Kind**: difficulty
- **Situation**: Two user reports, two platforms. On macOS 15 a user
  ([#4](https://github.com/ChanMeng666/echook/issues/4)) got "all is fine" from setup and
  then no sound at all. On Windows another user
  ([#14](https://github.com/ChanMeng666/echook/issues/14)) found that the last ~0.4 s of the
  permission-request sound was always cut off, and offered three possible fixes.
- **What I did**: For macOS I traced it to Sequoia's per-app notification permissions: the
  sound was being played through `osascript`, which runs via Script Editor, which has no
  notification permission by default, so the command exited 0 and did nothing. I moved
  sound to `afplay`, which needs no permission, and kept the popup as best effort. For
  Windows, the PowerShell player was torn down after a fixed `Start-Sleep -Seconds 3`
  while the clip was 3.4 s. Of the three options I chose to wait for the real clip length:
  poll the media player for its duration, sleep that plus 500 ms, with a bounded 10 s
  fallback. I rejected a bigger constant (it only moves the cliff) and detaching the player
  (the player lives inside the PowerShell process, so exiting early kills the sound), and
  wrote the reasoning back in the issue.
- **Result**: Both fixed the same day they were diagnosed (v4.1.0 for macOS, v5.1.2 for
  Windows); the macOS user confirmed "Now I have the sound." The fix covered all four
  PowerShell playback sites, including the WSL path, and two other clips that were also
  being clipped.
- **Engineer's angle**: "Exit 0 with no effect" is the hardest class of bug in a
  notification tool, because success and failure look identical from the caller. The
  Windows fix is about where the asynchrony really is: the Python layer was already
  fire-and-forget; the blocking wait was inside the child process, and that is where
  the clip length has to be known.
- **Plain version**: Users told me the sound was missing or cut short; I found the exact
  operating-system cause each time and fixed it the same day.
- **Follow-ups**:
  - *Why not just make the sleep 5 seconds?* Any future clip longer than 5 s would break
    silently again; reading the real duration removes the constant.
  - *How did you test a sound bug?* By the numbers: file size, bitrate and ID3 tag gave the
    3.4 s duration, and the fix was checked against the actual clips on Windows 11.
  - *What about the desktop popup on macOS?* It still needs the user to grant permission
    once; I documented that rather than hide it.

### S3. A crash on every command, and the CI matrix it produced

- **Kind**: incident
- **Situation**: Days after the v5.0 plugin release, a user reported
  ([#10](https://github.com/ChanMeng666/echook/issues/10)) that every `audio-hooks` command
  crashed at import with `NameError: name 'Tuple' is not defined`. A module-level type
  annotation used `Tuple` without importing it, and Python evaluates those at import time.
  The release had also been tagged with the code still reporting the previous version.
- **What I did**: I applied the one-line import fix the reporter proposed, and chose it
  over `from __future__ import annotations` so that no runtime annotation introspection
  elsewhere would change. Then I added the guard that should have existed: a GitHub
  Actions workflow that, on every push and pull request, imports the runner (both the
  source copy and the plugin copy), runs `version`, `status`, `diagnose` and `test all`,
  and runs the unit suite, on Ubuntu, Windows and macOS with Python 3.9, 3.12 and 3.13. I
  also aligned every in-tree version string.
- **Result**: Shipped as v5.1.1 the next day. That 3 x 3 matrix is still the project's CI;
  by v7.1.0 it ran 795 test cases, and it later gained a no-drift check of the plugin copy
  and Claude Code's own plugin validator.
- **Engineer's angle**: The bug was trivial; the lesson was that nothing had ever imported
  the shipped file on a clean interpreter. The smoke job tests the artefact users run, not
  just the functions, and across the OS and Python versions users actually have.
- **Plain version**: One missing line broke the tool for everyone; I fixed it the next day
  and added automatic checks on three operating systems so that kind of break cannot ship
  again.
- **Follow-ups**:
  - *Why three Python versions?* 3.9 is the oldest commonly installed; 3.12 and 3.13 are
    what new machines get, and annotation and typing behaviour differs across them.
  - *Why test the plugin copy separately?* Users run the plugin copy, which a build script
    produces; testing only the source would miss a stale or broken copy.

### S4. One source, three editors

- **Kind**: decision
- **Situation**: Cursor (from 3.2.16) and Codex CLI added hooks. Each has its own
  registration format, event names and payloads, and Cursor can also run Claude Code's
  plugin hooks by itself. Three copies of the logic would drift.
- **What I did**: I kept one canonical source (`hooks/`, `bin/`, `audio/`, `config/`,
  `cursor-hooks/`, `codex-hooks/`) and a build script that syncs it into the shipped
  plugin layout, with CI running `build-plugin.sh --check` to fail on any drift. Per editor,
  only the registration template differs; the runner detects which editor called it from
  arguments or environment. For Cursor I handled the double-fire risk: a native Cursor
  install aborts with `DUPLICATE_BRIDGE` when the Claude Code plugin is present, and if
  forced, the runner suppresses the duplicate at run time. For Codex, hooks needed a feature
  flag in the user's own TOML config. I chose never to rewrite an existing file, because a
  round trip would destroy the user's comments and formatting: the installer writes the file
  only when none exists and otherwise returns `next_steps` telling the agent exactly what to
  add. Events Codex lacks are clean no-ops.
- **Result**: Native Cursor support shipped in v5.1.6 and Codex in v5.2.0 (May 2026), each
  with its own bridge-contract tests. Today the manifest maps Claude Code to 30 of the 39
  canonical events plus all 47 variants, Cursor to 18 native events, Codex to 11. Codex
  support was not run against the real Codex binary until v7.1.0 (October 2026). That
  first live run, `codex exec` on Codex 0.143.0 and 0.162.1, found Codex refusing both of
  echook's hook files over extra top-level keys, so no Codex user had heard anything. v7.1.0
  fixed the files, made `Stop` synchronous so headless runs play it, and was verified
  against the real binary on both versions and both install routes.
- **Engineer's angle**: The interesting failure mode is silent: a misnamed matcher becomes
  a permanent no-op, not an error. A contract test pins the chain from registration to
  handler to sound file in both directions, which is what makes such a break loud.
- **Plain version**: I made one program serve three different AI editors without copying
  the code three times.
- **Follow-ups**:
  - *Why not edit the user's TOML with a parser?* The standard library cannot write TOML
    and a round trip loses comments; handing the edit to the agent is safer and keeps the
    tool dependency-free.
  - *How do you know which editor called?* An explicit `--invoker codex` argument for
    Codex, which sets no identifying variable, and environment variables for Cursor and
    Claude Code.
  - *What happens when an editor lacks an event?* The runner logs a debug line and exits 0;
    it never blocks the session.

### S5. Renaming a project without breaking a single install

- **Kind**: delivery
- **Situation**: The project was called claude-code-audio-hooks. Once native Cursor and
  Codex support shipped, the name told newcomers it only worked with Claude Code. But the
  name was also baked into install commands, a plugin marketplace, data directories and
  users' saved settings.
- **What I did**: In v5.2.1 (May 2026) I did a "door-only" rename to echook: the GitHub
  repository, display names, docs, logo and status-line brand changed; the CLI command
  `audio-hooks`, the plugin slug, the `chanmeng-audio-hooks` marketplace name and every
  data path stayed exactly as they were. I relied on GitHub's permanent redirect for clones,
  pulls and marketplace fetches, documented the one-line marketplace refresh in case a client
  did not follow it, and kept old changelog entries verbatim as history.
- **Result**: No data migration, no rewritten config, no reinstall. Existing installs kept
  updating; stars, forks and issues carried over.
- **Engineer's angle**: Separating the brand (what people see) from the identifiers
  (what machines key on) made the rename a zero-migration change. The price is a visible
  inconsistency between the product name and the command name, which I accepted.
- **Plain version**: I renamed the product so the name matched what it does, without making
  any existing user do anything.
- **Follow-ups**:
  - *Why not rename the command too?* It would break every script, alias and saved agent
    instruction that calls it, for a cosmetic gain.
  - *What if GitHub's redirect is ever broken?* Someone creating a new repository with the
    old name would break it; the changelog documents the manual marketplace refresh.

### S6. Following an upstream hook API that keeps moving

- **Kind**: difficulty
- **Situation**: The editors' hook systems change often. In November 2025 Claude Code
  v2.0.32 began rejecting the settings format my installer wrote; a user reported it with
  a patch ([#1](https://github.com/ChanMeng666/echook/issues/1),
  [PR #2](https://github.com/ChanMeng666/echook/pull/2)). In July 2026 a subtler one: I had
  registered a sound on Claude Code's `WorktreeCreate` event, which turned out to be a
  *provider* hook. With any command registered on it, Claude Code hands worktree creation to
  that command and expects a path back; my hook returned none, so every worktree-isolated
  subagent failed. I found this one in my own use, not from a user report.
- **What I did**: For the format change, I integrated the user's fix the same day with
  credit and added automatic conversion of old entries. For `WorktreeCreate`, I shipped
  v6.3.4 removing both worktree registrations and their sounds, since they could never fire
  safely on any supported editor. Then I changed the process: before trusting an event's
  name, register a capture shim, provoke it, and record what it does in a measured
  behaviour log (`docs/EVENT_BEHAVIOR_NOTES.md`). Each upstream sync now reads Claude Code's
  release changes and binary, records which matcher values exist, and keeps a list of what
  was looked at and deliberately not registered (blocking or provider hooks among them).
- **Result**: The project is synced against a named Claude Code version (2.1.292 at
  v6.8.0, the last sync), with a re-sync procedure, and I filed upstream issues where Claude Code itself
  misbehaved (for example
  [anthropics/claude-code#90997](https://github.com/anthropics/claude-code/issues/90997)).
- **Engineer's angle**: An event name describes when it fires, not what the host does with
  your handler. Some hooks are observational, some gate an action, some provide a result;
  registering on the wrong kind breaks the host, not your tool. Measuring before
  registering is the fix.
- **Plain version**: The AI editors keep changing how add-ons plug in; I learned to test
  each new plug-in point before using it, after one of them broke a feature of the editor.
- **Follow-ups**:
  - *How did you find the WorktreeCreate problem?* In my own sessions: the editor's error
    said the hook "returned no worktree path", which only makes sense for a hook expected to
    produce output; the documentation confirmed it is a provider hook.
  - *How do you keep up with releases?* A written re-sync procedure against each new
    version, and a table of upstream issues being watched.

### S7. "Upgrades killed the hooks": the bug was ours

- **Kind**: incident
- **Situation**: In late summer 2026 desktop notifications and spoken summaries went silent
  on Windows, and it looked as if recent Claude Code upgrades had broken hooks. I noticed it
  on my own machine; no user had filed it.
- **What I did**: I checked first whether upstream had changed: I compared the Claude Code
  binary across versions and found the payloads, event fields and hook discovery had not
  moved. The real cause was mine. The Windows toast and the speech path escaped text with an
  escaper written for macOS `osascript` and then placed it in a PowerShell string, where
  that escaping is wrong; any `"` (routine in a permission request that quotes a git command)
  made the script unparseable, so nothing appeared. The correct PowerShell escaper already
  existed in the same file. I verified the fix against PowerShell's own parser (three parse
  errors before, zero after), replaced the old tray-balloon API with a real Windows toast
  and an ordered fallback chain cached per OS release, and made the notification and speech
  functions report their real outcome, because they had returned success the instant a
  process started.
- **Result**: v6.5.1 (2026-09-01) repaired four failures, three of which had been invisible.
  Two error codes that had been defined since v5.0 and never emitted (`NOTIFICATION_FAILED`,
  `TTS_FAILED`) now fire with a reason.
- **Engineer's angle**: The deeper bug was observability: a fire-and-forget launch that
  reports `True` on spawn makes a dead channel look healthy. The fix was to make failure
  visible at the default log level, not only the escaping.
- **Plain version**: Notifications had gone silent on Windows; instead of blaming the editor
  update, I proved it had not changed and found a quoting bug in my own code.
- **Follow-ups**:
  - *How did you prove upstream had not changed?* By reading the binary of two Claude Code
    versions for the event payloads and fields, not the documentation.
  - *Why cache the toast backend?* Probing means launching PowerShell, which is slow; a
    hook should not pay that on every event. The cache expires weekly and per OS release.

### S8. An agent ran `install --help`, and the CLI installed

- **Kind**: incident
- **Situation**: On 2026-10-03 an AI agent exploring the CLI ran `audio-hooks install --help`
  on a machine that already had the plugin. The command ignored the flag, ran the legacy
  script installer, wrote 20 extra hook registrations into the user's Claude Code settings
  and reported success. Every event fired twice until the file was restored from the
  installer's own backup about three minutes later.
- **What I did**: I treated it as a contract failure, not a single bug. Following the thread
  found more: `upgrade --help` ran a real upgrade, several `set` commands wrote config when
  probed, `uninstall` did nothing on Windows while reporting success, and the test suite
  could write to the real data directory. In v6.6.0 `install` requires exactly one mode,
  `--help` in every spelling is side-effect-free for every subcommand, state-changing
  commands reject unknown arguments with `INVALID_USAGE` and change nothing, a script
  install on top of the plugin is refused, and uninstall became native on all three
  platforms: it backs up first and removes a file only if its content carries echook's
  marker, so a user's own same-named hook is left alone. In v7.0.0 I removed the script
  installer entirely, about 2,400 lines of shell and PowerShell with almost no CI coverage
  that no supported path needed, while keeping uninstall working for machines that still
  had it.
- **Result**: Tests now pin each rule (help is side-effect-free, install argument safety,
  read-only reporting commands). At v7.1.0 the suite has 795 tests passing; I also split the
  4,972-line CLI and 3,155-line runner into one module per concern and checked the split by
  replaying 431 invocations against the old code with no difference.
- **Engineer's angle**: A tool built for agents will be probed by agents, and `--help` is
  the first thing they try. "Help must never have side effects" and "unknown input changes
  nothing" are the agent-era version of input validation. Deleting the legacy path removed
  the class of bug rather than patching it.
- **Plain version**: An AI assistant asked my tool for help and it installed itself twice;
  I made every command safe to explore and deleted the old installer that caused it.
- **Follow-ups**:
  - *Why remove the installer instead of fixing it?* It duplicated what the plugin and the
    native Cursor and Codex installs already did, it was the source of the incident, and it
    had almost no test coverage.
  - *How do you uninstall safely from a user's settings?* Back up first, decide ownership by
    file content rather than file name, and report what was kept and why.
  - *How did you verify a big refactor changed nothing?* Ran the same invocations against
    the code before and after and compared exit codes, output, logs and files written; then
    planted defects to confirm the tests caught them.

## Numbers I can say

| Figure | Source |
|---|---|
| 88 GitHub stars (measured 2026-10-15) | `data/profile/21-projects-oss-primary.yaml` › echook › metrics |
| 3 editors (Claude Code, Cursor IDE, Codex CLI) from one canonical source, CI-enforced no drift | same, metrics "Harnesses" |
| 39 canonical hook events (3 on by default) plus 47 matcher variants; Claude Code 30 of 39 + all 47 variants, Cursor 18 native, Codex 11 | same, metrics "Hook events" |
| 41 JSON-in/JSON-out CLI subcommands | same, metrics "CLI" |
| 33 status-line segments | same, metrics "Status line" |
| 795 unit tests (v7.1.0) on Ubuntu, Windows and macOS × Python 3.9 / 3.12 / 3.13 | same, metrics "Tests / CI" |
| v7.1.0, released 2026-10-15, the first release run against the real Codex binary; 62 releases | same, metrics "Version" |
| Python 3.9+ standard library only, no third-party runtime dependencies | same, metrics "Runtime" |
| Four channels: audio, desktop toast, TTS, webhook (Slack/Discord/Teams/ntfy) | same, metrics "Channels" |

## In hindsight

- I would have put the import smoke test and the OS matrix in from the first release, not
  after a user found an import crash (S3).
- I would have measured each hook event's real behaviour before registering a sound on it;
  the `WorktreeCreate` rollback (S6) came from trusting a name.
- I would have made the CLI strict about arguments from the day I decided agents were its
  callers (S1). The `--help` incident (S8) was the predictable cost of a CLI that was
  agent-first in its output but still human-lenient in its input.
- Early releases flipped defaults with no migration and, once, three defaults at once
  (5.1.4), so users whose settings had been reset suddenly heard about three times more
  sound. I reverted them and
  added a committed baseline that fails CI on any flipped default; I should have had that
  rule earlier.
- Early READMEs overclaimed (a hands-free install, "complete" coverage). Wording claims so
  they can be checked against the code is a habit I wish I had started with.

## Evidence

Public items only, quoted briefly. Everything here is on a public page; the full set, with
captured copies, is in the private layer.

- **Users on the repository**:
  - Issue [#3](https://github.com/ChanMeng666/echook/issues/3) "Good job!", opened by
    jesseqin-kamiwaza only to say: "I am using it, thanks for creating this tool." Three more
    users added thanks in the thread: "very useful, great!", "very cool indeed!", "Amazing !"
  - Issue [#4](https://github.com/ChanMeng666/echook/issues/4), padixa after the macOS fix:
    "Thanks a lot. Now I have the sound." The same user's next two issues (#5, #6) became two
    releases within four days.
  - Issue [#7](https://github.com/ChanMeng666/echook/issues/7), roganhope: "this is an amazing
    repo thank you for sharing" (the request became the snooze feature in v4.4.0). On PR
    [#9](https://github.com/ChanMeng666/echook/pull/9): "I have never had the need to (try) to
    contribute to an open source project." (closed by its author, not merged)
  - External bug reports with root cause and patch: [#1](https://github.com/ChanMeng666/echook/issues/1)
    (fix integrated with credit in v3.3.3), [#10](https://github.com/ChanMeng666/echook/issues/10),
    [#14](https://github.com/ChanMeng666/echook/issues/14).
- **Recommended by strangers on Reddit**:
  - An early tester on Chan's launch post reported macOS bash bugs, saw them fixed within a
    day, then wrote: "Perfect! I can now annoy all my collegues as I work :-)"
    ([r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1oo1olq/enable_claude_code_to_automatically_play_sound/), 2025-11).
  - Answers to other people's requests for a notification sound, linking the repo:
    "Here you go." ([r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1s0j7hz/we_need_a_notification_sound_in_claude_code/), 2026-03)
    and "Something like this project maybe?" ([r/cursor](https://www.reddit.com/r/cursor/comments/1r4xm8i/claude_code_terminal_or_chat_not_giving_sound/), 2026-02).
- **Other developers' research and code**:
  - A TTS best-practices report in benbrastmckie/nvim reviewed several Claude Code TTS
    projects: "**echook** (ChanMeng666): Most sophisticated." It then adopted echook's pattern
    of a status-line monitor alongside speech
    ([report](https://github.com/benbrastmckie/nvim/blob/436600b348492d625993ce3205cf0d7bb7da8a61/specs/vault/01-vault/archive/679_research_tts_best_practices/reports/01_tts-best-practices.md)).
  - [claude-must-scream](https://github.com/Bobby-Gray/claude-must-scream): "the
    markdown-stripping logic in `claude-must-scream` borrows from its approach."
  - An RFC in [agenthive](https://github.com/shaiknoorullah/agenthive/blob/9583750185a64e7a1487932cc7fcf078ebae5559/docs/rfcs/feature-research.md):
    "The claude-code-audio-hooks project demonstrates significant demand for this".
  - A comparison of Claude Code hook READMEs in
    [jasonrundell/back-to-you#4](https://github.com/jasonrundell/back-to-you/issues/4#issuecomment-5098147711)
    described it as "Maximalist; 39 hook events, TTS, webhooks, statusline".
  - A code-to-video research project used the echook promo film as one of the reference films
    it replicated ([USTChandsomeboy/video-result](https://github.com/USTChandsomeboy/video-result)).
  - Not all of it is praise: a landscape review in [jlynshue/earshot](https://github.com/jlynshue/earshot)
    verified its Claude Code coverage but could not verify the Cursor and Codex reach, and
    [HalbonLabs/agent-voice](https://github.com/HalbonLabs/agent-voice) calls it
    "Notification-shaped, not comprehension-shaped."
- **Listings**: plugin and skill directories (awesomeclaudeplugins.com, claudepluginhub.com,
  tomevault.io, agent-skills.cc, agentskillshub.top with a "SAFE" grade) and about 20
  curated GitHub lists and catalogues, including Chinese, Japanese and Portuguese ones;
  [github-insight-radar](https://github.com/LeombE/github-insight-radar) rated it "Try
  today". One fork, [BenjaminKobjolke/claude-code-audio-hooks](https://github.com/BenjaminKobjolke/claude-code-audio-hooks),
  kept adapting it for five months with its own commits.
- Publication: "Claude Code Audio Hooks: System Architecture" (chanmeng.org, 2026-06-30),
  recorded in `30-recognition.yaml`; her own article, not third-party.
- Not found: any external article or video reviewing echook, and no LinkedIn recommendation
  or award in `50-references.yaml` / `30-recognition.yaml` about it.
- Private layer: 22 items in `_private/echook/evidence.md`, 21 of them already public (the
  items above, in full, with captured copies); 1 is not public and is not quoted here.

## Open questions

- **Anthropic plugin directory**: submitted 2026-10-04 and in review per the repo; not
  listed publicly as of 2026-10-15. When it is published, add it to Evidence.
- **Engram founder's post**: whether the founder's public LinkedIn post names the repository
  (Chan will check). If it does, it belongs in Evidence.
