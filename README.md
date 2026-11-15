# dsh-p3r-ui

English | [简体中文](README_ZH.md)

A **Persona 3 Reload (Makoto Yuki)** visual UI skin plugin for **DeepSeek Harness (DSH)** Desktop & Web UI — featuring a 60fps looping underwater video backdrop, adaptive frosted-glass panels, P3R-inspired typography & click FX, a draggable Makoto portrait settings dock, and a draggable `current wallet` balance HUD widget.

---

## Features

- **60fps Video Backdrop + Optional Splash Intro**: Renders `/p3r-skin/loop.mp4` (`assets/menu-loop-fv2-60fps-h264.mp4` with fallback to `assets/menu-loop-h264.mp4`) into a hardware-decoded canvas backdrop behind the DSH UI. If an optional intro clip (`menu-clean-4k60-h264.mp4` / `menu-clean-h264.mp4`) is present, it plays once per host startup and seamlessly transitions into the loop.
- **Adaptive Frosted Glass**: Independent toggles and sliders (`0%–92%` opacity, `0–24px` blur) for the chat session area and the left sidebar, plus dark-blue contrast scrims so conversation text, settings dialogs, and modals remain clearly readable.
- **Interactive P3R Portrait Dock (`#p3r-dsh-pill`)**: Transparent Makoto Yuki portrait cutout with `#7beeff` rim glow and tilted HP/SP bar. Click to toggle the settings panel (`P3R // RELOAD`), or hold and drag to reposition anywhere on screen (position saved locally).
- **Floating Wallet HUD (`#p3r-dsh-wallet`)**: Displays current account balance in `current wallet` P3R card styling; click to refresh, hold and drag to reposition.
- **P3R Click FX & Optional Web Audio SFX**: Angular blue/crimson click bursts and synthesized P3R UI tones (audio is **off by default**).
- **Zero External Network Dependencies**: No remote fonts, CDNs, or analytics calls — all visual effects run locally on the DSH host.

---

## Compatibility & Installation

- **Tested DSH Version**: `0.2.0-rc.1` – `0.2.x` (`engines.dsh: ">=0.2.0-rc.1 <0.3.0-0"`, Node.js `>= 20`).

### 1. Official DSH Desktop App
Open **Settings → Plugins** (`设置 → 插件`) in DeepSeek Harness Desktop and install via the Plugin Manager / Plugin Market (`dshmarket`), or import the Release `.tgz` tarball.

> **Important Note on Desktop vs `dsh web` Profiles**: Running `dsh plugin --profile web add ...` installs the plugin into `profiles/web`, **not** the `profiles/desktop` profile used by the DSH Desktop app. Install inside the Desktop Plugin Manager (or target `--profile desktop` when managing Desktop CLI profiles).

### 2. DSH Web (`dsh web` / CLI)

From npm / community catalog (once published):
```sh
dsh plugin --profile web add dsh-p3r-ui
```

Or from GitHub Release tarball (pre-built `dist/p3r-skin.js`, no build step required):
```sh
dsh plugin --profile <your-profile> add https://github.com/ytsu-ki/dsh-p3r-ui/releases/latest/download/dsh-p3r-ui-1.0.0.tgz
```

Restart DSH (`Cmd + Q` and reopen on macOS Desktop, or restart `dsh web`) to activate the new static routes and runtime script.

---

## Permissions & Security Boundaries

`dsh-p3r-ui` is designed strictly as a **UI skin layer** following **least-privilege, local-only, read-only** principles. Full technical details are documented in [SECURITY.md](SECURITY.md).

### What This Plugin Accesses

| Permission / Surface | Purpose | Exact Boundary |
|---|---|---|
| `webServer` (`ctx.inject(['webServer'])`, `webserver/index-inject`, `tapIndex`) | Injects `dist/p3r-skin.js` into DSH's web HTML shell and mounts `/p3r-skin/*` routes. | Only injects visual skin script (`id: 'p3r-dsh-skin-inline'`). Verifies non-empty bundle and rejects `</script` sequences at build time and load time. |
| Local HTTP endpoints (`/p3r-skin/makoto-avatar.png`, `loop.mp4`, `intro.mp4`, `boot-state`, `wallet.json`) | Serves local avatar PNG, video streams (`Range` supported), RAM-only intro state, and balance JSON. | Every request passes `rejectIfUntrusted(req, res, ctx)`: rejects `sec-fetch-site: cross-site` with `403`, enforces `connection.requestRejection(req)` if present, and falls back to strict loopback host checking (`localhost`, `127.0.0.1`, `::1`). Static paths are fixed candidates with zero query-derived filesystem paths. |
| `ctx.get('deepseekAccount')` *(optional)* | Populates the floating `current wallet` balance pill. | Calls read-only `acct.getBalance(...)` (8s timeout, 12s RAM cache) and outputs only numeric wallet summary (`currency`, `normalBalance`, `bonusBalance`, `totalBalance`). Never reads tokens, cookies, API keys, or billing history, and never triggers charges. |
| `$DSH_HOME/.dshw-usage.json` *(optional read-only fallback)* | Fallback numeric balance when `deepseekAccount` is unavailable. | Reads only numeric `lastBalance` and `todayUsage` fields from `$DSH_HOME/.dshw-usage.json` or `$DSH_HOME/profiles/desktop/.dshw-usage.json`. |
| Browser `localStorage` & `sessionStorage` | Persists skin switches, sliders, widget positions, and per-tab splash seen flags. | Keys used: `p3r_dsh_desktop_skin_v2` (legacy `v1`), `p3r_dsh_widget_pos_v1`, `p3r_dsh_boot_id`, `p3r_dsh_intro_seen`. |

### What This Plugin Explicitly Does NOT Do

- **No Agent Tools / No Prompt Injection**: Never registers LLM tools, commands, or subagents, and never alters system prompts.
- **No Chat / Workspace Data Access**: Never reads conversations, transcripts, attachments, or files in your workspace.
- **No Credential Access**: Never reads `.credentials.yaml`, auth tokens, or secrets.
- **No Disk Writes / No Shell Execution**: Zero `writeFile` calls and zero `child_process` imports; never writes to `~/.dsh` or `cordis.patch.yml`, and never executes commands or restarts DSH.
- **Zero Outbound Network Calls**: Makes zero requests to external servers (same-origin `/p3r-skin/*` only).

---

## Controls & Settings

Click the **Makoto Yuki avatar icon** in the top-right to toggle the **P3R // RELOAD** control panel:

- **启用动态视频背景**: Master toggle for the video backdrop & adaptive theme (disabling restores DSH's default UI immediately).
- **会话区毛玻璃** / **主区深蓝护眼衬底**: Controls frosted glass and contrast backdrop for the conversation area.
- **左侧菜单毛玻璃** / **侧栏深蓝护眼衬底**: Controls frosted glass and contrast backdrop for the left sidebar.
- **P3R 按键/菜单动效** / **P3R 按键音效**: Enables P3R click bursts and optional Web Audio UI sounds.
- **毛玻璃透明度** (`0%`–`92%`) & **模糊强度** (`0px`–`24px`): Live transparency and backdrop blur sliders.
- **全景预览**: Temporarily fades the DSH UI overlay so you can view the animated background clearly.
- **重播落水**: Replays the startup splash transition (when an intro clip is available) or resets backdrop playback.
- **重置位置**: Restores the avatar dock and `current wallet` widget to their default corners.

---

## Development & Build

No runtime dependencies are required (`index.js` uses Node.js built-ins only, and `src/skin-runtime.js` is self-contained vanilla JS).

```sh
npm run build   # Builds dist/p3r-skin.js from src/skin-runtime.js
npm run check   # Runs node --check on index.js, src/skin-runtime.js, dist/p3r-skin.js
```

Note: Do not edit `dist/p3r-skin.js` directly — modify [src/skin-runtime.js](src/skin-runtime.js) and run `npm run build`.

---

## License & Asset Provenance

- **Source Code**: [MIT License](LICENSE) (`Copyright (c) 2026 ytsu-ki`).
- **Media Assets (`assets/`)**: Persona 3 Reload visual assets are **excluded from the MIT License** and provided as-is strictly for personal UI theming. See [PROVENANCE.md](PROVENANCE.md) for details and takedown contact terms.
