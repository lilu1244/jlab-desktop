# Linux builds (.deb, .rpm, AppImage)

**Priority:** Medium
**Category:** Other
**Effort:** M

## Goal
Ship Linux desktop bundles alongside macOS and Windows. Cover the most common GUI distros: Debian/Ubuntu (`.deb`), Fedora/RHEL/openSUSE (`.rpm`), and a universal `AppImage` for everyone else. Tauri 2 already supports all three; the work is mostly CI plus config.

## Tasks
- [ ] Add `linux` target to `tauri.conf.json` `bundle.targets` (`deb`, `rpm`, `appimage`)
- [ ] Verify Linux prereqs build locally in a container (webkit2gtk, libayatana-appindicator, librsvg, etc.)
- [ ] Extend `.github/workflows/ci.yml` `lint` matrix with `ubuntu-latest` (this is the job that already carries the `if: matrix.os == 'ubuntu-latest'` apt step; until Ubuntu is in this matrix, the step is dead config)
- [ ] Extend `.github/workflows/ci.yml` `build-smoke` matrix with `ubuntu-latest` for `tauri build --debug`
- [ ] Pin the Ubuntu image. Tauri 2 needs `libwebkit2gtk-4.1-dev` on Ubuntu 22.04 / 24.04, and 25.04+ may have moved to 6.0. Anchor on a specific runner (e.g. `ubuntu-24.04`) and document the apt list next to it so the package names do not silently rot when GitHub bumps `ubuntu-latest`.
- [ ] Extend `.github/workflows/release.yml` to build on `ubuntu-latest` and attach `.deb`, `.rpm`, `.AppImage` to the GitHub Release
- [ ] Confirm signed updater manifest covers Linux targets too (or document that it doesn't)
- [ ] Test install + launch on Ubuntu, Fedora, and via AppImage on a third distro
- [ ] Update README install section with Linux instructions

## Notes
- A repo scan flagged the existing `if: matrix.os == 'ubuntu-latest'` step in the `lint` job as dead config (the matrix is `[macos-14, windows-latest]`). Resolving this TODO activates the step instead of removing it, which is the cleaner outcome. Mention this in the PR description so the next reviewer does not also try to delete it.
