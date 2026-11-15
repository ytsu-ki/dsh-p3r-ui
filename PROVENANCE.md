# Asset Provenance & License Scope / 素材来源与许可边界

The **source code** of `dsh-p3r-ui` (`index.js`, `src/`, `dist/`, `scripts/`, `cordis.patch.yml`, `package.json`, and documentation) is licensed under the [MIT License](LICENSE).

Visual and video assets under `assets/` are **excluded from the MIT License** and provided strictly **as-is** for personal, non-commercial DeepSeek Harness UI customization.

---

## 1. Scope Matrix / 许可范围划分

| Scope | License / Terms |
|---|---|
| `index.js`, `src/skin-runtime.js`, `dist/p3r-skin.js`, `scripts/`, `cordis.patch.yml`, `package.json`, `*.md` | **MIT License** (see [`LICENSE`](LICENSE)) |
| `assets/makoto-avatar.png` (`127×140` RGBA transparent cutout) | **Excluded from MIT**: fan-cut Persona 3 Reload (Makoto Yuki) UI portrait sprite used solely as the plugin control dock trigger icon. Original IP/character design belongs to ATLUS / SEGA. |
| `assets/menu-loop-fv2-60fps-h264.mp4`, `assets/menu-loop-h264.mp4`, optional `menu-loop-4k60-h264.mp4` | **Excluded from MIT**: Persona 3 Reload style underwater loop backdrop videos supplied for personal non-commercial theme rendering only; no sublicense or commercial redistribution rights are granted. |

---

## 2. Privacy & Metadata Sanitization / 元数据清理

- `assets/makoto-avatar.png` has been stripped of embedded EXIF/text metadata chunks (`eXIf` removed), retaining only required image rendering chunks (`IHDR`, `sRGB`, `IDAT`, `IEND`).

---

## 3. Copyright / Takedown Notice / 权利主张处理

This project is an unofficial fan-made UI skin with no affiliation to ATLUS, SEGA, or DeepSeek. If you are a rights holder and believe any bundled asset under `assets/` infringes your rights, please open an issue in this repository identifying the file name and basis of the claim; the file will be removed or replaced promptly without additional conditions.
