# Project hooks

Registered in `.claude/settings.json` for every session in this repo; plain Node.

## guard-generated.mjs (PreToolUse: Edit, Write, MultiEdit, NotebookEdit)

Refuses a write to a generated file and names the source to edit and the npm
script that rebuilds it. The list is the `RULES` table at the top of the script:
README.md, llms.txt, llms-full.txt, dist/**, linkedin/linkedin-*.md,
linkedin/linkedin-profile.json, public/cv-llms.txt, public/cv.jsonld,
cv/tokens.typ, cv/exports/*.{docx,txt,pdf}, docs/INDEX.md, scripts/README.md,
wiki/**, and the generated platform registers (linkedin and company post
registers, suno/songs.yaml, suno/words.yaml, distribution/status.yaml,
distribution/calendar.md). x/posts.yaml is not blocked: its curated keys are
hand-edited. cv/exports/README.md is hand-kept.

Deliberate exception: start the session with `KB_ALLOW_GENERATED=1` in the
environment. The hook then allows the write and says so.

**Caveat:** the hook sees only the file tools. A Bash `sed -i`, heredoc or `>`
redirect into a generated file is not caught. CI's stale-output check and
`npm run check` are the backstop.

## validate-after-shard-edit.mjs (PostToolUse: Edit, Write, MultiEdit)

After a write under data/profile/, to data/brand.yaml or under schema/, runs
`npm run validate` with a 120 s cap. On failure the output reaches Claude as a
`decision: "block"` reason beside the tool result; on success the user sees one
`validate OK` line. Other paths are ignored at no cost.

## Testing without a live session

```sh
echo '{"tool_name":"Edit","tool_input":{"file_path":"README.md"}}' | node .claude/hooks/guard-generated.mjs; echo "exit $?"   # 2
echo '{"tool_name":"Edit","tool_input":{"file_path":"data/profile/00-basics.yaml"}}' | node .claude/hooks/guard-generated.mjs; echo "exit $?"   # 0
echo '{"tool_name":"Edit","tool_input":{"file_path":"data/profile/00-basics.yaml"}}' | node .claude/hooks/validate-after-shard-edit.mjs   # validate OK
```

A session started before `.claude/settings.json` existed picks the hooks up
after `/hooks` is opened once or the session restarts.
