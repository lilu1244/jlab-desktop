# Polish Frontend Design with frontend-design Skill

**Priority:** Medium
**Category:** Frontend
**Effort:** M

## Goal
Use the `frontend-design` skill to lift the UI from "functional" to "distinctive and polished". Audit every state of the state machine (idle, scanning, result, error) and refine layout, hierarchy, micro-interactions, and typography while staying inside the existing token system and performance rules.

## Tasks
- [ ] Run `frontend-design` skill audit across all four `ScanState` variants (idle, scanning, result, error)
- [ ] Polish idle landing: hero copy, drop zone, three step cards (rhythm, contrast, hover affordances)
- [ ] Polish `ScanProgress` (elapsed counter, phase list, rotating tip) for a calmer feel
- [ ] Polish `SignatureList` + `SignatureCard` + `SeverityBadge` (severity grouping, density, scanability)
- [ ] Polish `ErrorBanner` so retry stays one click away and the tone matches the rest
- [ ] Stay inside `src/styles/app.css` tokens (no new ad-hoc durations, easings, or color literals)
- [ ] Animate only `transform` / `opacity`; verify `prefers-reduced-motion` is still honored
- [ ] Verify `npm run check` and `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` are clean
