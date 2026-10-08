# cv/cover-letter/ — the cover-letter kit

Hand-used, not built: there is deliberately no cover-letter PDF and no slot in
`cv/build.ps1`, because a letter is written per application.

- [`TEMPLATE.md`](./TEMPLATE.md): the five-move skeleton. Copy it, fill the
  slots, delete the guidance.
- [`EVIDENCE.md`](./EVIDENCE.md): source-attributed sentences by theme, and the
  red lines. Pick two sentences from different themes.

Rules:

- Every factual sentence must trace to [`../../data/profile/`](../../data/profile/).
  If it is in neither the bank nor the data, it does not go in; find the real
  fact and add it to the bank.
- The bank is a second copy, so it drifts: when a number in `data/profile/`
  changes, grep this directory for it. The red lines at the top of
  `EVIDENCE.md` come from the `CV COMPLIANCE` comments in the shards; breaking
  one is a misstatement a reference check would surface.
- Paste the letter into the portal's text field; attach it as a file only when
  there is no field.
- Which CV file goes with it: [`../exports/README.md`](../exports/README.md).
