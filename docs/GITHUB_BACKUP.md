# GitHub source backup

This is a source-only backup of the existing Campaign application. It does not
configure deployment, GitHub Actions, cloud accounts, external hosting or a
hackathon submission. Application behavior is unchanged by this task.

## Included source

- React Native / Expo / TypeScript application, routes, components and design tokens.
- Expo configuration and the native configuration plugin used by Continuous Native Generation.
- FastAPI source, numbered SQLite migrations, fictional seed definitions and API tests.
- Dependency manifests and locks, frontend tests, Windows launch and Android build scripts.
- Bundled fonts with their full licenses, app artwork and attributed seed photographs.
- Project instructions, requirements traceability, architecture, design and setup documentation.

## Files retained only in the original workspace

The root `.gitignore` excludes dependencies, Python environments, generated native
projects, build output, SDK/JDK/Gradle and emulator tooling, runtime logs, private
environment files, reviewer credentials, signing material, SQLite databases and
their sidecars, uploaded media under the API data directory, temporary helpers and
all generated evidence under `artifacts/`.

The original organizer PDF and video material are not redistributed: permission
has not been established. Keep the original `Hackathon_Requirements.pdf` locally
for requirements work; it remains authoritative. APKs and recorded demonstrations
are local deliverables rather than Git source. Existing documentation links into
`artifacts/`, `tmp/`, `tools/` or the PDF intentionally refer to local files that
are absent from a source-only clone.

Ignoring files does not delete them. A fresh checkout recreates its own database,
fictional seed data and random reviewer credentials on initial API startup; it
does not restore the original workspace's accounts, payments, uploads or receipts.
See [the root README](../README.md) for real setup and verification commands and
[the API guide](../services/api/README.md) for process environment configuration.
The optional [mobile example](../apps/mobile/.env.example) contains no active
assignments or secrets. No backend `.env` loader is implemented.

## Verified destination and preserved history

Existing Git Credential Manager authentication identifies `tejassambhus17` as
the account owner. The existing repository is
<https://github.com/tejassambhus17/Campaign>, verified **private** before upload.
Its initial branch/reference inspection was empty, so no remote history needs
reconciliation. No new repository was created. A redundant device-code login was
cancelled after the existing credential was verified; no password or token was
printed or included in Git.

The root branch is `main`. Its history retains the original mobile scaffold
commit `ae7271ee5da01adf0bafdfd2f13f706638aaa644`, also referenced locally by
`mobile-scaffold-history`. The original nested Git metadata is preserved under
ignored `tmp/github-backup/mobile-original.git`; application files stay in place.
The final tree stores ordinary files under `apps/mobile`, not an embedded Git
repository or a submodule. The original commit's author email is retained.

The precommit source audit reviews 102 current files and the original 13 history
blobs. No live secrets were found; exact staged-file coverage and byte comparisons
pass. Existing upstream license whitespace and API trailing blank lines were left
unchanged. Auditing source disclosure does not establish production security.

## Git safety

The pre-existing mobile scaffold history must be preserved when consolidating the
root repository. Do not reset, amend or force-push that history. Remote ownership,
private visibility and branch history must be verified against the authenticated
GitHub account before configuring `origin` or pushing. Unrelated or conflicting
local/remote histories require the user's reconciliation decision.

Passwords, bearer tokens, receipt capabilities and generated reviewer credentials
must never enter commits. Existing test-only fixture passwords and example.test
addresses are synthetic test inputs, not usable application credentials. Normal
Git author identity remains part of the preserved original commit history.

Use ordinary reviewed commits for future changes. Do not add generated artifacts
with `git add -f`, and do not enable automated builds or deployments as part of
this backup.
