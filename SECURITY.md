# Security Model & Permission Boundaries / 权限界定与安全边界

`dsh-p3r-ui` is a **pure visual presentation skin** for DeepSeek Harness (DSH) Desktop and Web UI. It follows a **least-privilege, local-only, read-only** design so reviewers, marketplace curators (`dshmarket`), and end users can verify exactly what the plugin can and cannot access.

---

## 1. Host (Cordis / Node.js) Permission Scope

### Granted / Used Capabilities

| Capability / API | Purpose | Exact Scope & Safeguards |
|---|---|---|
| `ctx.inject(['webServer'])` & `webserver/index-inject` (`tapIndex` fallback) | Injects prebuilt UI runtime (`dist/p3r-skin.js`) into DSH's HTML shell and serves local skin assets. | Injects only the `<script>` tag for visual UI skinning (`id: 'p3r-dsh-skin-inline'`). Validates that `dist/p3r-skin.js` is non-empty and contains no `</script` escape sequences before injection and at build time (`scripts/build.mjs`). |
| Local HTTP endpoints under `/p3r-skin/*` | Serves local video backdrop, transparent PNG portrait, in-memory splash flag, and read-only wallet summary. | Every route calls `rejectIfUntrusted(req, res, ctx)` first: rejects `sec-fetch-site: cross-site` with `403`, enforces `connection.requestRejection(req)` when DSH provides the `connection` service, and restricts fallback host headers strictly to loopback (`localhost`, `127.0.0.1`, `::1`). Only `GET`/`HEAD` (and `POST` on `/p3r-skin/boot-state` to mark intro played in RAM) are accepted. |
| `ctx.get('deepseekAccount')` *(optional)* | Displays the user's current account balance in the draggable `current wallet` HUD pill. | Read-only call to `acct.getBalance(...)` with an 8-second timeout and 12-second in-memory cache. Returns only `{ ok, source, currency, normalBalance, bonusBalance, totalBalance, updatedAt }`. **Never** reads or exposes auth tokens, cookies, API keys, or billing history, and never initiates charges or account changes. |
| Fallback filesystem read in `readDshwUsageFallback()` *(optional)* | Supplies numeric balance fallback (`lastBalance`, `todayUsage`) when `deepseekAccount` is unavailable (e.g., standalone web testing). | Read-only JSON read of `$DSH_HOME/.dshw-usage.json` or `$DSH_HOME/profiles/desktop/.dshw-usage.json`. Extracts only finite numbers (`lastBalance`, `todayUsage`); ignores all other fields. |
| Static asset path resolution (`resolveFirstExisting`) | Resolves bundled MP4/PNG paths at startup. | Uses fixed module-relative `URL` candidates only — **no** dynamic path construction from HTTP query/path parameters (immune to path traversal). Supports standard HTTP `Range` requests with strict integer bounds validation (`416` on out-of-range). |

### Explicitly NOT Accessed / Never Performed

- **No Agent Tools / No Prompt Hooks**: Does not register LLM tools, subagents, slash commands, or modify system prompts / conversation context.
- **No Chat / Session / Workspace Access**: Never reads `~/.dsh/sessions`, conversation transcripts, uploaded attachments, or files in user workspaces.
- **No Credential Access**: Never reads `.credentials.yaml`, tokens, or API secrets.
- **No Host Filesystem Writes**: Never writes, patches, or deletes files on disk (`~/.dsh`, `cordis.patch.yml`, user projects, etc.). Splash playback state (`Symbol.for('p3r.dsh.skin.bootState')`) and wallet cache live strictly in process memory.
- **No Process Spawning / No Package Self-Modification**: Zero imports of `node:child_process`; never executes shell commands, `pnpm`/`npm`, or host restarts.
- **No Outbound Network Requests**: Host plugin makes zero external HTTP/HTTPS requests.

---

## 2. Browser / Client Runtime (`dist/p3r-skin.js`) Scope

- **DOM & CSS Only**: Renders background `<canvas>`/`<video>`, adaptive frosted-glass styles, P3R-inspired header/button visual effects, Web Audio API synthesized UI tones (disabled by default, toggled via `P3R 按键音效`), the draggable avatar settings dock (`#p3r-dsh-dock`), and the draggable balance card (`#p3r-dsh-wallet`).
- **Functional Controls Preserved**: Does not intercept, modify, or block message submission, workspace/permission mode selectors, model selectors, or dialog confirmations.
- **Same-Origin Requests Only**: `fetch()` is used exclusively against same-origin `/p3r-skin/boot-state`, `/p3r-skin/wallet.json`, `/p3r-skin/loop.mp4`, optional `/p3r-skin/intro.mp4`, and `/p3r-skin/makoto-avatar.png`. Zero telemetry, zero CDNs, zero third-party fonts.
- **Local Browser Storage Keys Only**:
  - `localStorage`: `p3r_dsh_desktop_skin_v2` (UI switches/blur/opacity; legacy read-only `p3r_dsh_desktop_skin_v1`), `p3r_dsh_widget_pos_v1` (custom dragged coordinates for avatar dock and wallet pill).
  - `sessionStorage`: `p3r_dsh_boot_id`, `p3r_dsh_intro_seen`.

---

## 3. Reversibility & Clean Disable

- Disabling `"启用动态视频背景"` in the floating settings panel immediately restores DSH's default appearance without restarting.
- Uninstalling or disabling `dsh-p3r-ui` in DSH Plugin Manager (`cordis.patch.yml` -> `disabled: true`) removes all routes and runtime injection cleanly on reload/restart, leaving zero modified DSH config files behind.

---

## 4. Reporting Security Issues

If you discover any security concern, unintended data exposure, or cross-origin issue, please open an issue on GitHub or report privately before public disclosure if sensitive.
