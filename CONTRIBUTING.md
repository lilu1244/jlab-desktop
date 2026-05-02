# Contributing

Thanks for the interest. This project is small and pragmatic. Here is what helps a PR land quickly.

## Branch model

- `main` is the release branch. Every merge to `main` triggers a release build for macOS and Windows on the GitHub Releases page.
- `dev` is the working branch. New features and fixes go on `dev` first (or on a feature branch into `dev`).
- Pull requests target `main` only when the change is ready to ship. Direct pushes to `main` are not allowed; the branch is protected.

In short: **work on `dev`, ship from `main`**.

## Bug reports

Open an issue with:

- OS and version (macOS or Windows build).
- App version (from the title bar or `package.json`).
- Steps to reproduce.
- A redacted JAR or its signatures, if relevant.

For security issues, follow [SECURITY.md](SECURITY.md) instead. Do not file a public issue.

## Pull requests

- Keep changes focused. Smaller PRs review faster.
- Run the checks below before pushing.
- Match the existing style. No new dependencies without a short reason in the PR description.
- For UI changes, attach a screenshot or short clip.

### Required checks

The CI workflow runs these on every PR. Run them locally too:

```bash
npm run check                                                 # TypeScript
cargo fmt    --manifest-path src-tauri/Cargo.toml -- --check  # Rust format
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
cargo check  --manifest-path src-tauri/Cargo.toml             # Rust type-check
```

The CI also runs `gitleaks detect` to catch accidental secret commits, and a `tauri build --debug` smoke job on macOS and Windows so config breakage shows up before release.

## Local development

```bash
npm install
npm run tauri dev
```

The frontend lives in `src/`. The Rust shell lives in `src-tauri/src/`. The Tauri commands are defined in `src-tauri/src/api.rs` and registered in `src-tauri/src/lib.rs`.

## Releases

Releases are continuous. The version-gate runs on every push to `main`:

1. CI reads the version from `src-tauri/tauri.conf.json`.
2. If a tag `v<version>` already exists, the release job is skipped (no duplicates).
3. Otherwise, CI builds macOS (universal) and Windows (NSIS + MSI), creates the `v<version>` git tag, and publishes a GitHub Release with the bundles and the signed updater manifest attached.

To cut a new release:

1. On `dev`, bump the version in **all three files**:
   - `package.json` (`"version"`)
   - `src-tauri/Cargo.toml` (`[package] version`)
   - `src-tauri/tauri.conf.json` (`"version"`)
2. Update `CHANGELOG.md`. Move items from `Unreleased` into a new section for the new version with today's date.
3. Open a PR from `dev` to `main`.
4. Merge after CI is green. The release workflow tags and publishes automatically.

If the three versions disagree, the version-gate fails the build before doing any work. This is intentional.

## Commit style

Short, lowercase, present tense, no punctuation at the end. Examples:

```
add updater plugin and signing key wiring
fix off-by-one in scan progress elapsed counter
update tauri to 2.0.6
```

Reference an issue with `#123` if relevant.

## License

By contributing, you agree your work is dual-licensed under **MIT OR Apache-2.0**.
