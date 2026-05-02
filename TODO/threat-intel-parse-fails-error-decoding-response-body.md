# Threat-intel parse fails with "error decoding response body"

**Priority:** Medium
**Category:** Backend
**Effort:** S

## Goal

`fetch_threat_intel_body` in `src-tauri/src/api.rs` swallows the threat-intel
result for the RatterScanner sample (and likely others) with:

```
[WARN] threat-intel parse failed: error decoding response body
```

The static scan itself returns 200 OK with a 1.09 MB body, so the user still
sees signature results, but the third-party threat-intel section is empty.
Find out why `reqwest::Response::json()` fails on this endpoint, fix the
parse path so legitimate JSON bodies are accepted, and log enough detail to
diagnose future regressions instead of throwing the body away.

## Context

- Reproducer: drop `RatterScanner.jar` (whatever the user just scanned) on
  the app. The static scan succeeds (`elapsed=45956ms`,
  `body=1096247 bytes`), threat-intel logs the warning above.
- The threat-intel call goes to
  `https://jlab.threat.rip/api/public/threat-intel/<sha256>` and is awaited
  in parallel with the static scan.
- `reqwest`'s `error decoding response body` is a transport-layer error
  (chunked-transfer / decompression / truncated stream), not a
  serde-shape mismatch. The current code can't tell the two apart because
  it only logs `{e}`.
- Server response noted in the log: `content-type: application/json`,
  `content-length: None` (chunked).

## Tasks

- [ ] Hash the failing jar and hit
      `GET https://jlab.threat.rip/api/public/threat-intel/<sha256>` from
      the terminal with the same `x-jlab-client: web` header. Save the raw
      body and confirm whether it is valid JSON, truncated, or a different
      content-type than advertised.
- [ ] In `fetch_threat_intel_body`, switch from `r.json()` to
      `r.bytes().await` then `serde_json::from_slice`, so a parse failure
      can log a short snippet (first 256 bytes) plus the byte length.
      Keep the `Null` fallback so a flaky intel call never breaks the
      scan.
- [ ] If the raw body turns out to be valid JSON but `reqwest` mis-decodes
      it (gzip / chunked), check `reqwest::ClientBuilder` flags
      (`gzip(true)` / `brotli(true)` are off by default). Add the feature
      flag in `src-tauri/Cargo.toml` and enable it on the shared client in
      `lib.rs` if needed.
- [ ] Re-run the scan in `npm run tauri dev`, confirm the threat-intel
      section is populated for RatterScanner, and that the warning is
      gone.
- [ ] `cargo fmt` + `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings`.
