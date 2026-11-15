/**
 * P3R Makoto Yuki Dynamic Video Skin Runtime for DeepSeek Harness (Desktop & Web)
 * - Plays splash-into-water intro once per fresh DSH startup, then loops seamlessly underwater.
 * - Independent frosted-glass controls for Chat Session Area & Left Menu, adjustable down to 0% transparent.
 */
(function () {
  if (window.__P3R_DSH_SKIN_INSTALLED__) return;
  window.__P3R_DSH_SKIN_INSTALLED__ = true;

  var STORAGE_KEY = "p3r_dsh_desktop_skin_v2";
  var LEGACY_KEY = "p3r_dsh_desktop_skin_v1";
  var POS_STORAGE_KEY = "p3r_dsh_widget_pos_v1";
  var INTRO_URL = "/p3r-skin/intro.mp4?v=4k60";
  var LOOP_URL = "/p3r-skin/loop.mp4?v=fv2_60fps_v1";
  var BOOT_URL = "/p3r-skin/boot-state";
  var INTRO_START_SEC = 0.92;

  var customPos = { dock: null, wallet: null };
  try {
    var savedPosRaw = localStorage.getItem(POS_STORAGE_KEY);
    if (savedPosRaw) {
      var parsedPos = JSON.parse(savedPosRaw);
      if (parsedPos && typeof parsedPos === "object") {
        if (parsedPos.dock && typeof parsedPos.dock.left === "number" && typeof parsedPos.dock.top === "number") {
          customPos.dock = { left: Math.round(parsedPos.dock.left), top: Math.round(parsedPos.dock.top) };
        }
        if (parsedPos.wallet && typeof parsedPos.wallet.left === "number" && typeof parsedPos.wallet.top === "number") {
          customPos.wallet = { left: Math.round(parsedPos.wallet.left), top: Math.round(parsedPos.wallet.top) };
        }
      }
    }
  } catch (e) {}

  function saveCustomPos() {
    try {
      localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(customPos));
    } catch (e) {}
  }

  var cfg = {
    enabled: true,
    chatGlass: true,
    chatScrim: true,
    sidebarGlass: true,
    sidebarScrim: true,
    panelAlpha: 0.48,
    blurPx: 14,
    btnFx: true,
    btnSfx: false,
    peek: false,
    dockExpanded: false,
  };

  try {
    var saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.enabled === "boolean") cfg.enabled = parsed.enabled;
        if (typeof parsed.chatGlass === "boolean") cfg.chatGlass = parsed.chatGlass;
        if (typeof parsed.chatScrim === "boolean") cfg.chatScrim = parsed.chatScrim;
        if (typeof parsed.sidebarGlass === "boolean") cfg.sidebarGlass = parsed.sidebarGlass;
        if (typeof parsed.sidebarScrim === "boolean") cfg.sidebarScrim = parsed.sidebarScrim;
        if (typeof parsed.btnFx === "boolean") cfg.btnFx = parsed.btnFx;
        if (typeof parsed.btnSfx === "boolean") cfg.btnSfx = parsed.btnSfx;
        if (typeof parsed.panelAlpha === "number" && isFinite(parsed.panelAlpha)) {
          cfg.panelAlpha = Math.max(0, Math.min(0.95, parsed.panelAlpha));
        }
        if (typeof parsed.blurPx === "number" && isFinite(parsed.blurPx)) {
          cfg.blurPx = Math.max(0, Math.min(28, parsed.blurPx));
        }
      }
    }
  } catch (e) {}

  function saveCfg() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          enabled: cfg.enabled,
          chatGlass: cfg.chatGlass,
          chatScrim: cfg.chatScrim,
          sidebarGlass: cfg.sidebarGlass,
          sidebarScrim: cfg.sidebarScrim,
          btnFx: cfg.btnFx,
          btnSfx: cfg.btnSfx,
          panelAlpha: cfg.panelAlpha,
          blurPx: cfg.blurPx,
        })
      );
    } catch (e) {}
  }

  /* ========================================================================
     STYLESHEET INJECTION
     ======================================================================== */
  var CSS_TEXT = [
    "#p3r-dsh-stage{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;",
    "background:linear-gradient(180deg,#42c9fd 0%,#029eeb 34%,#002ea8 75%,#00188c 100%);transition:opacity .32s ease}",
    "#p3r-dsh-stage.p3r-off{opacity:0;visibility:hidden}",
    ".p3r-dsh-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:left center;pointer-events:none;user-select:none}",
    "#p3r-vid-loop{z-index:1;opacity:1}",
    "#p3r-vid-intro{z-index:2;opacity:1;display:none;transition:opacity .26s ease}",
    "html.p3r-skin-on,html.p3r-skin-on body{background:transparent!important;background-color:transparent!important;background-image:none!important}",
    "html.p3r-skin-on body{--dsw-specific-sidebar-fill:transparent!important;--dsw-specific-sidebar-tint:transparent!important;--dsw-specific-sidebar-wash-top:transparent!important;--dsw-specific-sidebar-wash-bottom:transparent!important}",
    "html.p3r-skin-on #root [class*='_centerCol'] [data-phase],html.p3r-skin-on #root [class*='_centerCol'] [class*='_scrollBody'],html.p3r-skin-on #root [class*='_centerCol'] [class*='_viewArea']{background:transparent!important;background-color:transparent!important}",
    "html.p3r-skin-on [class*='_overlay']>[class*='_mask'],html.p3r-skin-on [class*='_backdrop']>[class*='_mask'],html.p3r-skin-on body>div>[class*='_mask']{background:rgba(2,8,30,0.74)!important;backdrop-filter:blur(18px) saturate(1.1)!important;-webkit-backdrop-filter:blur(18px) saturate(1.1)!important}",
    "html.p3r-skin-on [class*='_overlay']>[class*='_mask']::after,html.p3r-skin-on [class*='_backdrop']>[class*='_mask']::after{background:rgba(2,8,30,0.52)!important}",
    "html.p3r-skin-on body[data-ds-dark-theme] [role='dialog']:not(#p3r-dsh-card),html.p3r-skin-on body[data-ds-dark-theme] [role='alertdialog']{--dsw-alias-bg-base:#07123c;--dsw-alias-bg-layer-1:#0b1b56;--dsw-alias-bg-layer-2:#081544;--dsw-alias-bg-layer-3:#10246b;--dsw-alias-bg-layer-4:#163082;--dsw-alias-settings-card-fill:rgba(13,30,88,0.95);--dsw-alias-settings-card-stroke:rgba(102,182,255,0.28);--dsw-alias-card-fill:rgba(13,30,88,0.95);--dsw-alias-card-fill-hover:rgba(20,44,120,0.96);--dsw-alias-label-primary:#f2f7ff;--dsw-alias-label-secondary:#c8dcff;--dsw-alias-label-tertiary:#96b8ec;--dsw-alias-label-caption:#7fa7e2;--dsw-alias-border-l1:rgba(102,182,255,0.16);--dsw-alias-border-l2:rgba(102,182,255,0.24);--dsw-alias-border-l3:rgba(102,182,255,0.34);--dsw-alias-border-l4:rgba(120,200,255,0.44);--dsw-specific-sidebar-nav-item-active:rgba(26,86,232,0.38);--dsw-alias-interactive-bg-hover:rgba(92,168,255,0.16);--dsw-alias-interactive-bg-active:rgba(26,86,232,0.44);background:linear-gradient(162deg,rgba(8,21,66,0.98) 0%,rgba(4,12,40,0.99) 100%)!important;background-color:#081544!important;border:1.5px solid rgba(90,178,255,0.56)!important;box-shadow:0 24px 64px rgba(0,6,32,0.86),0 0 0 1px rgba(9,13,26,0.85)!important;color:#f2f7ff!important}",
    "html.p3r-skin-on body:not([data-ds-dark-theme]) [role='dialog']:not(#p3r-dsh-card),html.p3r-skin-on body:not([data-ds-dark-theme]) [role='alertdialog']{background:rgba(250,252,255,0.985)!important;background-color:#fafcff!important;border:1.5px solid rgba(8,42,136,0.34)!important;box-shadow:0 24px 64px rgba(0,12,56,0.38),0 0 0 1px rgba(9,13,26,0.18)!important}",
    "html.p3r-skin-on.p3r-modal-open #p3r-dsh-wallet{z-index:900!important;opacity:0.15!important;pointer-events:none!important}",
    "html.p3r-skin-on.p3r-modal-open #p3r-dsh-dock:not(:has(#p3r-dsh-card.open)){z-index:910!important;opacity:0.35!important}",
    "html.p3r-skin-on #root,html.p3r-skin-on #app{position:relative;z-index:1;background:transparent!important;background-color:transparent!important;background-image:none!important;transition:opacity .25s ease}",
    "html.p3r-skin-on.p3r-peek #root,html.p3r-skin-on.p3r-peek #app{opacity:0.06!important;pointer-events:none!important}",
    "html.p3r-skin-on [class$='_frame'],html.p3r-skin-on [class*='_frame '],html.p3r-skin-on [class*='_frame_'],html.p3r-skin-on [class$='_mainPanel'],html.p3r-skin-on [class*='_mainPanel '],html.p3r-skin-on [class*='_mainPanel_']{background:transparent!important;background-color:transparent!important}",
    "html.p3r-skin-on [class$='_frame']:before,html.p3r-skin-on [class*='_frame ']:before,html.p3r-skin-on [class*='_frame_']:before{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [class$='_sidebarCol'],html.p3r-skin-on [class*='_sidebarCol '],html.p3r-skin-on [class*='_sidebarCol_']{background-color:var(--p3r-sidebar-bg,transparent)!important;background-image:var(--p3r-sidebar-scrim,none)!important;backdrop-filter:var(--p3r-sidebar-blur,none)!important;-webkit-backdrop-filter:var(--p3r-sidebar-blur,none)!important;border-color:var(--p3r-sidebar-border,transparent)!important}",
    "html.p3r-skin-on [class$='_centerCol'],html.p3r-skin-on [class*='_centerCol '],html.p3r-skin-on [class*='_centerCol_'],html.p3r-skin-on [class$='_rightbarCol'],html.p3r-skin-on [class*='_rightbarCol '],html.p3r-skin-on [class*='_rightbarCol_'],html.p3r-skin-on [class$='_bottomRow'],html.p3r-skin-on [class*='_bottomRow '],html.p3r-skin-on [class*='_bottomRow_']{background:var(--p3r-session-bg,transparent)!important;background-color:var(--p3r-session-bg,transparent)!important;background-image:var(--p3r-session-scrim,none)!important;backdrop-filter:var(--p3r-session-blur,none)!important;-webkit-backdrop-filter:var(--p3r-session-blur,none)!important;border-color:var(--p3r-session-border,transparent)!important}",
    "html.p3r-skin-on [class*='_tabHost_']:not([class*='_float_']),html.p3r-skin-on [class*='_emptyTabHost_']{background:transparent!important;background-color:transparent!important}",
    "html.p3r-skin-on [data-p3r-region='outer']{background:transparent!important;background-color:transparent!important;background-image:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [data-p3r-region='sidebar-inner'],html.p3r-skin-on [data-p3r-region='session-inner']{background:transparent!important;background-color:transparent!important;background-image:none!important}",
    "html.p3r-skin-on [data-p3r-region='sidebar-surface']{background-color:var(--p3r-sidebar-bg,transparent)!important;background-image:none!important;backdrop-filter:var(--p3r-sidebar-blur,none)!important;-webkit-backdrop-filter:var(--p3r-sidebar-blur,none)!important;border-color:var(--p3r-sidebar-border,transparent)!important}",
    "html.p3r-skin-on [class*='_sidebarCol'] [data-p3r-region='sidebar-surface']{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [data-p3r-region='session-surface']{background-color:var(--p3r-session-bg,transparent)!important;background-image:none!important;backdrop-filter:var(--p3r-session-blur,none)!important;-webkit-backdrop-filter:var(--p3r-session-blur,none)!important;border-color:var(--p3r-session-border,transparent)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [data-p3r-region='session-surface']{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [class*='_frame'][data-animating] [class*='_sidebarCol'],html.p3r-skin-on [class*='_frame'][data-animating] [data-p3r-region='sidebar-surface'],html.p3r-skin-on [class*='_frame'][data-animating] [class*='_centerCol'],html.p3r-skin-on [class*='_frame'][data-animating] [class*='_rightbarCol'],html.p3r-skin-on [class*='_frame'][data-animating] [class*='_bottomRow'],html.p3r-skin-on [class*='_frame'][data-animating] [data-p3r-region='session-surface'],html.p3r-skin-on [class*='_frame'][data-animating] [data-p3r-region='session-card'],html.p3r-skin-on [class*='_frame'][data-animating] [data-p3r-bubble],html.p3r-skin-on [class*='_frame'][data-animating] [data-disclosure-header],html.p3r-skin-on [class*='_frame'][data-animating] [class*='_composerStack']>div[class*='_card'],html.p3r-skin-on [class*='_frame'][data-animating] [class*='_composerSeat'] div[class*='_card']{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important}",
    "html.p3r-skin-on [data-p3r-region='session-card']{background:var(--p3r-card-bg,rgba(5,20,76,0.72))!important;background-color:var(--p3r-card-bg,rgba(5,20,76,0.72))!important;backdrop-filter:var(--p3r-session-blur,blur(14px))!important;-webkit-backdrop-filter:var(--p3r-session-blur,blur(14px))!important;border-color:var(--p3r-session-border,rgba(94,186,255,0.42))!important}",
    "html.p3r-skin-on body[data-ds-dark-theme] [class*='_rightbarCol'] [data-dockkit-host='dock'],html.p3r-skin-on body[data-ds-dark-theme] [class*='_rightbarCol'] [class*='_tabHost_']:not([class*='_float_']),html.p3r-skin-on body[data-ds-dark-theme] [class*='_centerCol']>[class*='_page']:has([class*='_pageBody'],[class*='_pageScroll']),html.p3r-skin-on body[data-ds-dark-theme] [class*='_centerCol'] [class*='_page'][class*='_page']:has([class*='_pageBody'],[class*='_pageScroll']){--dsw-alias-bg-base:rgba(4,16,66,0.82);--dsw-alias-bg-layer-1:rgba(8,24,84,0.88);--dsw-alias-bg-layer-2:rgba(8,22,76,0.92);--dsw-alias-card-fill:rgba(10,28,92,0.86);background:rgba(4,16,66,0.80)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important}",
    "html.p3r-skin-on body:not([data-ds-dark-theme]) [class*='_rightbarCol'] [data-dockkit-host='dock'],html.p3r-skin-on body:not([data-ds-dark-theme]) [class*='_rightbarCol'] [class*='_tabHost_']:not([class*='_float_']),html.p3r-skin-on body:not([data-ds-dark-theme]) [class*='_centerCol']>[class*='_page']:has([class*='_pageBody'],[class*='_pageScroll']),html.p3r-skin-on body:not([data-ds-dark-theme]) [class*='_centerCol'] [class*='_page'][class*='_page']:has([class*='_pageBody'],[class*='_pageScroll']){background:rgba(248,252,255,0.90)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important}",
    "html.p3r-skin-on body[data-ds-dark-theme] [class*='_float_']{--dsw-alias-bg-base:#07123c;--dsw-alias-bg-layer-1:#0b1b56;--dsw-alias-bg-layer-2:#081544;--dsw-alias-card-fill:rgba(13,30,88,0.94);background:rgba(8,21,66,0.97)!important;border:1.5px solid rgba(90,178,255,0.52)!important;color:#f2f7ff!important}",
    "html.p3r-skin-on body:not([data-ds-dark-theme]) [class*='_float_']{background:rgba(250,252,255,0.98)!important;border:1.5px solid rgba(8,42,136,0.32)!important}",
    "html.p3r-skin-on.p3r-chat-scrim body{--dsw-specific-bubble:rgba(6,32,128,0.74)!important;--dsw-specific-bubble-highlight:rgba(12,50,168,0.84)!important;--dsw-alias-bg-document-preview:rgba(3,16,68,0.84)!important;--dsw-alias-turn-trigger-bg:rgba(6,28,118,0.54)!important;--dsw-alias-turn-trigger-bg-hover:rgba(10,42,152,0.74)!important;--dsw-alias-brand-text:#f8fbff!important;--dsw-alias-hovercard-label-secondary:#e4efff!important;--dsw-alias-hovercard-label-tertiary:#c8dcff!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol']{color:#f4f8ff!important}",
    "html.p3r-skin-on header[class*='_header']{border-bottom-color:rgba(120,214,255,0.22)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_titleCluster'],html.p3r-skin-on [class*='_root'] [class*='_titleCluster']{padding:8px 12px!important;margin:-8px -12px!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_crumbs'],html.p3r-skin-on [class*='_centerCol'] [class*='_crumbSeg'],html.p3r-skin-on [class*='_root'] [class*='_crumbs'],html.p3r-skin-on [class*='_root'] [class*='_crumbSeg']{overflow:visible!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_headline'],html.p3r-skin-on [class*='_centerCol'] [class*='_titleGroup'],html.p3r-skin-on [class*='_centerCol'] [class*='_titleRow'],html.p3r-skin-on [class*='_centerCol'] [class*='_crumb'],html.p3r-skin-on [class*='_centerCol'] [class*='_crumbCurrent'],html.p3r-skin-on [class*='_centerCol'] [class*='_crumbSep'],html.p3r-skin-on [class*='_centerCol'] header [class*='_titleRow'] :is(span,a,div,button,h1,h2,h3):not([class*='_previewBadge']),html.p3r-skin-on [class*='_root'] header [class*='_titleRow'] :is(span,a,div,button,h1,h2,h3):not([class*='_previewBadge']),html.p3r-skin-on [class*='_root'] [class*='_crumb'],html.p3r-skin-on [class*='_root'] [class*='_crumbCurrent']{color:#ffffff!important;font-family:'Futura','Impact','Arial Black','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;font-weight:900!important;font-style:italic!important;letter-spacing:.02em!important;text-shadow:-0.5px -0.5px 0 rgba(4,19,110,0.48),0.5px -0.5px 0 rgba(4,19,110,0.36),-0.5px 0.5px 0 rgba(4,19,110,0.48),1.5px 2px 0 #04136e,2.2px 2.8px 0 #04136e,0 0 8px rgba(4,19,110,0.58)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_fish'],html.p3r-skin-on [class*='_root'] [class*='_fish']{color:#ffffff!important;filter:drop-shadow(1.5px 2px 0 #04136e) drop-shadow(0 0 6px rgba(4,19,110,0.55))!important}",
    "html.p3r-skin-on [class*='_centerCol'] header [class*='_titleRow'] svg,html.p3r-skin-on [class*='_centerCol'] [class*='_crumb'] svg,html.p3r-skin-on [class*='_root'] header [class*='_titleRow'] svg,html.p3r-skin-on [class*='_root'] [class*='_crumb'] svg{color:#ffffff!important;overflow:visible!important;filter:drop-shadow(1.5px 2px 0 #04136e) drop-shadow(0 0 6px rgba(4,19,110,0.55))!important}",
    "html.p3r-skin-on [class*='_centerCol'] header [class*='_titleRow'] button,html.p3r-skin-on [class*='_root'] header [class*='_titleRow'] button{background:transparent!important;border:none!important;box-shadow:none!important;padding:6px 10px!important;margin:-6px -10px!important}",
    "html.p3r-skin-on [class*='_centerCol'] header [class*='_titleRow'] button:hover,html.p3r-skin-on [class*='_root'] header [class*='_titleRow'] button:hover{color:#ffe600!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_previewBadge']{background:#090d1a!important;border:1.5px solid #ffe600!important;color:#ffffff!important;border-radius:0!important;font-style:italic;font-weight:800;text-shadow:none!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_heroWorkspaceRow'] button,html.p3r-skin-on [class*='_centerCol'] header [class*='_headerUtilities'] button:not([class*='_primary']){background:rgba(9,13,26,0.86)!important;border:1.5px solid #3c568c!important;color:#f4f8ff!important;border-radius:0;box-shadow:3px 3px 0 rgba(9,13,26,0.58);font-weight:800;font-style:italic}",
    "html.p3r-skin-on [class*='_scrollBody'] [class*='_viewArea']{padding-bottom:22px!important}",
    "html.p3r-skin-on [class*='_composerSeat']{--dsw-alias-label-primary:#f4f8ff;--dsw-alias-label-secondary:#e2eeff;--dsw-alias-label-tertiary:#b8d4ff;--dsw-alias-label-caption:#9ee8ff;z-index:28!important;padding-top:10px!important;background:linear-gradient(180deg,rgba(4,16,70,0) 0%,rgba(4,16,70,0.22) 55%,rgba(3,12,56,0.38) 100%)!important;background-color:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [class*='_composerHero']{--dsw-alias-label-primary:#f4f8ff;--dsw-alias-label-secondary:#e2eeff;--dsw-alias-label-tertiary:#b8d4ff;--dsw-alias-label-caption:#9ee8ff}",
    "html.p3r-skin-on [class*='_composerStack']{background:transparent!important;background-color:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [class*='_composerStack']>div[class*='_card'],html.p3r-skin-on [class*='_composerHero'] div[class*='_card'],html.p3r-skin-on [class*='_composerSeat'] div[class*='_card']:not([class*='_overlayAnchor'] *){position:relative;z-index:2;background:linear-gradient(155deg,rgba(4,16,68,0.86) 0%,rgba(7,26,102,0.82) 100%)!important;background-color:rgba(4,16,68,0.84)!important;border:1px solid rgba(94,186,255,0.56)!important;box-shadow:0 8px 26px rgba(0,10,56,0.38),inset 0 1px 0 rgba(164,226,255,0.24)!important;backdrop-filter:blur(18px) saturate(1.14)!important;-webkit-backdrop-filter:blur(18px) saturate(1.14)!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_overlayAnchor']>*,html.p3r-skin-on [class*='_composerHero'] [class*='_overlayAnchor']>*{--dsw-alias-bg-layer-1:rgba(8,22,68,0.97);--dsw-alias-bg-layer-2:rgba(8,22,68,0.97);--dsw-alias-label-primary:#f0f6ff;--dsw-alias-label-secondary:#cbe0ff;--dsw-alias-label-tertiary:#9dc2f5;--dsw-alias-interactive-bg-hover:rgba(92,168,255,0.22);background:linear-gradient(162deg,rgba(8,22,68,0.97) 0%,rgba(5,13,44,0.98) 100%)!important;background-color:#081544!important;border:2px solid #090d1a!important;border-left:4px solid #0044b8!important;border-top:2px solid #d80018!important;color:#f0f6ff!important;box-shadow:5px 5px 0 rgba(9,13,26,0.86),0 18px 40px rgba(0,10,48,0.58)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_card'] :is(textarea,[contenteditable='true'],.cm-editor,.cm-content,.cm-line,.cm-line *,.cm-placeholder,[class*='_placeholder']),html.p3r-skin-on [class*='_composerHero'] [class*='_card'] :is(textarea,[contenteditable='true'],.cm-editor,.cm-content,.cm-line,.cm-line *,.cm-placeholder,[class*='_placeholder']){font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;font-weight:800!important;font-style:italic!important;letter-spacing:.02em!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_card'] :is(textarea,[contenteditable='true'],.cm-editor,.cm-content,.cm-line),html.p3r-skin-on [class*='_composerHero'] [class*='_card'] :is(textarea,[contenteditable='true'],.cm-editor,.cm-content,.cm-line){color:#ffffff!important;caret-color:#ffe600!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_card'] :is(.cm-placeholder,[class*='_placeholder']),html.p3r-skin-on [class*='_composerSeat'] [class*='_card'] textarea::placeholder,html.p3r-skin-on [class*='_composerHero'] [class*='_card'] :is(.cm-placeholder,[class*='_placeholder']),html.p3r-skin-on [class*='_composerHero'] [class*='_card'] textarea::placeholder{color:rgba(218,236,255,0.88)!important;text-shadow:0 1px 2px rgba(0,8,40,0.65)!important}",
    "html.p3r-skin-on [class*='_composerSeat'] button,html.p3r-skin-on [class*='_composerSeat'] button *,html.p3r-skin-on [class*='_composerHero'] button,html.p3r-skin-on [class*='_composerHero'] button *,html.p3r-skin-on [class*='_composerSeat'] [class*='_dock'],html.p3r-skin-on [class*='_composerSeat'] [class*='_dock'] *,html.p3r-skin-on [class*='_composerHero'] [class*='_dock'],html.p3r-skin-on [class*='_composerHero'] [class*='_dock'] *{font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;font-weight:800!important;font-style:italic!important;letter-spacing:.02em!important;color:#eef5ff!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort'],html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort']{color:#8ce8ff!important;text-shadow:1px 1.5px 0 #04136e!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_dock'],html.p3r-skin-on [class*='_composerSeat'] [class*='_dock'] *,html.p3r-skin-on [class*='_composerHero'] [class*='_dock'],html.p3r-skin-on [class*='_composerHero'] [class*='_dock'] *{color:#e6f2ff!important;text-shadow:0 1px 3px rgba(0,8,38,0.75)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [data-p3r-region='session-card'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_changedFiles'] [class*='_card'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_ApprovalPanel'] [class*='_card'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_fileCard']{--dsw-alias-label-primary:#f4f8ff;--dsw-alias-label-secondary:#d4e6ff;--dsw-alias-label-tertiary:#a6c4f0;background:linear-gradient(155deg,rgba(4,16,68,0.82) 0%,rgba(7,26,102,0.76) 100%)!important;border:1px solid rgba(94,186,255,0.48)!important;color:#f4f8ff!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_modes'] button,html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_trailing'] button[class*='_trigger']{background:#090d1a!important;border:1.5px solid #3c568c!important;color:#f0f6ff!important;border-radius:0}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] button[class*='_add']{background:#0044b8!important;border:1.5px solid #090d1a!important;color:#ffffff!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] button[class*='_primary']{background:#d80018!important;border:1.5px solid #090d1a!important;color:#ffffff!important;box-shadow:3px 3px 0 #090d1a}",
    "html.p3r-skin-on [data-p3r-bubble='assistant'] :is(p,li,h1,h2,h3,h4,h5,h6,strong,em,blockquote,td,th),html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_scrollBody'] :is(p,li,h1,h2,h3,h4,blockquote,td,th){color:#f4f8ff!important;text-shadow:0 1px 3px rgba(0,10,56,0.42)}",
    "html.p3r-skin-on [data-p3r-bubble='user'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userStack'] [class*='_bubble']:not([data-portal]):not([role='tooltip']),html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userRow'] [class*='_bubble']:not([data-portal]):not([role='tooltip']){--dsw-alias-label-primary:#f8fbff;--dsw-alias-label-secondary:#dcebff;position:relative!important;z-index:1;overflow:visible!important;isolation:isolate;margin:10px 10px 14px 12px!important;padding:11px 18px!important;border-radius:2px!important;background:linear-gradient(155deg,rgba(3,11,52,0.86) 0%,rgba(6,20,86,0.78) 100%)!important;background-color:rgba(3,12,56,0.82)!important;border:1px solid rgba(72,152,255,0.76)!important;color:#f8fbff!important;font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;font-weight:800!important;font-style:italic!important;letter-spacing:.02em!important;box-shadow:0 10px 26px rgba(0,8,52,0.5),inset 0 1px 0 rgba(164,226,255,0.22)!important;backdrop-filter:var(--p3r-session-blur,blur(14px))!important;-webkit-backdrop-filter:var(--p3r-session-blur,blur(14px))!important;text-shadow:0 1px 2px rgba(0,8,44,0.55);filter:drop-shadow(0 0 1px rgba(56,132,255,0.25))}",
    "html.p3r-skin-on [data-p3r-bubble='user']::before,html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userStack'] [class*='_bubble']:not([data-portal]):not([role='tooltip'])::before,html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userRow'] [class*='_bubble']:not([data-portal]):not([role='tooltip'])::before{content:'';position:absolute;top:-6px;left:-10px;right:10px;bottom:6px;padding:6px 0 0 10px;background:linear-gradient(135deg,#0066ff 0%,#1482ff 60%,#0048e6 100%);clip-path:polygon(0 4%,99% 0,100% 98%,2% 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;z-index:-1;pointer-events:none}",
    "html.p3r-skin-on [data-p3r-bubble='user']::after,html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userStack'] [class*='_bubble']:not([data-portal]):not([role='tooltip'])::after,html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userRow'] [class*='_bubble']:not([data-portal]):not([role='tooltip'])::after{content:'';position:absolute;right:12px;bottom:-11px;width:22px;height:12px;background:linear-gradient(180deg,rgba(6,20,86,0.92) 0%,rgba(12,66,214,0.94) 100%);clip-path:polygon(0 0,100% 0,84% 100%);pointer-events:none;z-index:1}",
    "html.p3r-skin-on [data-p3r-bubble='user'] *:not(code):not(pre):not(kbd){color:#f8fbff!important;font-weight:800!important;font-style:italic!important}",
    "html.p3r-skin-on [data-p3r-bubble='assistant']{--dsw-alias-label-primary:#f4f8ff;--dsw-alias-label-secondary:#d8e9ff;--dsw-alias-label-tertiary:#a8c7f5;--dsw-alias-label-caption:#90b4e8;position:relative!important;z-index:1;overflow:visible!important;isolation:isolate;margin:20px 8px 14px 12px!important;padding:20px 22px 18px!important;border-radius:2px!important;background:linear-gradient(155deg,rgba(3,11,52,0.84) 0%,rgba(6,20,84,0.78) 100%)!important;background-color:rgba(3,12,56,0.80)!important;border:1px solid rgba(72,152,255,0.68)!important;color:#f4f8ff!important;box-shadow:0 12px 30px rgba(0,8,52,0.48),inset 0 1px 0 rgba(164,226,255,0.18)!important;backdrop-filter:var(--p3r-session-blur,blur(14px))!important;-webkit-backdrop-filter:var(--p3r-session-blur,blur(14px))!important}",
    "html.p3r-skin-on [data-p3r-bubble='assistant']::before{content:'';position:absolute;top:-5px;left:-10px;right:12px;bottom:6px;padding:5px 0 0 10px;background:linear-gradient(135deg,#0066ff 0%,#1482ff 65%,#0046e0 100%);clip-path:polygon(0 1%,99% 0,100% 99%,1% 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;z-index:-1;pointer-events:none}",
    "html.p3r-skin-on [data-p3r-bubble='assistant']::after{content:'DEEPSEEK  //  TALK';position:absolute;top:-14px;left:-6px;padding:3px 18px 3px 20px;background:linear-gradient(95deg,#0052ff 0%,#1678ff 100%);color:#f2fbff;font-family:'Arial Black','Avenir Next Condensed','Helvetica Neue',sans-serif;font-size:10.5px;font-weight:900;font-style:italic;letter-spacing:.10em;line-height:1.25;clip-path:polygon(10px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);box-shadow:0 3px 12px rgba(0,44,200,0.52);border-bottom:1.5px solid #78eeff;pointer-events:none;z-index:2}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [data-chat-flow-kind='turn-process'] [data-disclosure-header]{background:rgba(4,16,68,0.72)!important;border:1px solid rgba(72,152,255,0.34)!important;border-radius:4px!important;padding:2px 10px!important;color:#e6f1ff!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [data-open] [data-disclosure-header]{background:rgba(4,16,68,0.92)!important;color:#eef6ff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_thinkBody']{margin:6px 0 8px 0!important;padding:8px 14px!important;border-left:2px solid #029eeb!important;background:rgba(2,10,52,0.74)!important;border-radius:2px!important;color:#dceaff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_sourceCard'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_instructionsCard'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] div[class*='_message']{background:rgba(3,14,62,0.76)!important;border:1px solid rgba(56,132,255,0.46)!important;border-radius:2px!important;color:#e8f2ff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] pre{background:rgba(2,9,44,0.88)!important;border:1px solid rgba(72,160,255,0.38)!important;border-radius:3px!important;overflow-x:auto!important;color:#eaf3ff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_bannerWrap']{background:rgba(3,14,58,0.96)!important;color:#dceeff!important;border-bottom:1px solid rgba(72,160,255,0.28)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] code:not(pre code){background:rgba(8,36,152,0.55)!important;border:1px solid rgba(104,178,255,0.35);border-radius:3px;color:#9cf2ff!important;padding:1px 5px}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] a{color:#66efff!important}",
    "html.p3r-skin-on.p3r-btn-fx [class*='_centerCol'] [data-chat-flow-kind='turn-tail'] button:hover,html.p3r-skin-on.p3r-btn-fx [class*='_centerCol'] [class*='_heroWorkspaceRow'] button:hover{background:#ffffff!important;background-color:#ffffff!important;color:#0824e8!important;font-style:italic!important;font-weight:700!important;border-color:rgba(82,100,255,0.85)!important;box-shadow:inset 0 3px 0 0 #5264ff,0 4px 14px rgba(0,14,88,0.36)!important}",
    "html.p3r-skin-on ::-webkit-scrollbar-thumb{background:#ffffff!important;border:1.5px solid #090d1a!important;border-radius:0!important}",
    "html.p3r-skin-on ::-webkit-scrollbar-thumb:hover{background:#ffe600!important;border-color:#d80018!important}",
    "html.p3r-skin-on ::selection{background:rgba(216,0,24,0.28);color:#ffffff}",
    "#p3r-dsh-wallet{position:fixed;z-index:2147482990;right:20px;bottom:86px;min-width:136px;padding:0;background:transparent;border:none;color:#0b0d14;font-family:'Avenir Next Condensed','Futura','Helvetica Neue',sans-serif;cursor:grab;touch-action:none;user-select:none;-webkit-app-region:no-drag;pointer-events:auto;transition:transform .16s cubic-bezier(0.16,1,0.3,1),opacity .18s ease}",
    "#p3r-dsh-wallet.p3r-dragging,#p3r-dsh-dock.p3r-dragging,#p3r-dsh-dock.p3r-dragging #p3r-dsh-pill{transition:none!important;cursor:grabbing!important}",
    "#p3r-dsh-wallet.p3r-dragging{transform:none!important}",
    "#p3r-dsh-wallet.p3r-hidden{opacity:0;pointer-events:none;transform:translateY(4px)}",
    "#p3r-dsh-wallet::before{content:'';position:absolute;left:-7px;top:-4px;width:48%;height:calc(100% + 10px);background:#687082;clip-path:polygon(0 0,72% 0,100% 100%,14% 100%);z-index:0;pointer-events:none}",
    "#p3r-dsh-wallet::after{content:'';position:absolute;right:-5px;bottom:-5px;width:48%;height:68%;background:#0b0d14;clip-path:polygon(24% 0,100% 0,100% 100%,0 100%);z-index:0;pointer-events:none}",
    ".p3r-wallet-card{position:relative;z-index:1;padding:6px 14px 7px 12px;background:#ffffff;border:2px solid #0b0d14;border-radius:0;box-shadow:0 8px 20px rgba(4,10,32,0.22);transition:border-color .16s ease}",
    "#p3r-dsh-wallet:hover{transform:translateY(-1px)}",
    "#p3r-dsh-wallet:hover .p3r-wallet-card{border-color:#d80018}",
    "#p3r-dsh-wallet:active{transform:scale(0.97)}",
    ".p3r-wallet-top{display:flex;align-items:baseline;gap:3px;line-height:1;color:#0b0d14}",
    ".p3r-wallet-cur{font-size:19px;font-weight:800;letter-spacing:-0.02em}",
    ".p3r-wallet-amt{font-size:21px;font-weight:500;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}",
    ".p3r-wallet-sub{margin-top:2px;font-size:10px;font-weight:900;font-style:italic;letter-spacing:.01em;line-height:1.1;color:#0b0d14}",
    "#p3r-dsh-wallet.p3r-wallet-loading .p3r-wallet-amt{opacity:.55}",
    "#p3r-dsh-dock{position:fixed;top:62px;right:20px;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;user-select:none;-webkit-app-region:no-drag;pointer-events:auto}",
    "#p3r-dsh-dock *{-webkit-app-region:no-drag;box-sizing:border-box}",
    "#p3r-dsh-pill{position:relative;display:inline-flex;align-items:center;justify-content:center;width:74px;height:78px;padding:0;border:none;background:transparent;cursor:grab;touch-action:none;filter:drop-shadow(0 5px 14px rgba(0,18,86,0.52));transition:transform .18s cubic-bezier(0.16,1,0.3,1),filter .18s ease}",
    "#p3r-dsh-pill svg{width:74px;height:78px;display:block;overflow:visible;pointer-events:none;user-select:none;-webkit-user-drag:none}",
    "#p3r-dsh-pill:hover{transform:translateY(-2px) scale(1.06);filter:drop-shadow(0 8px 18px rgba(0,36,158,0.68))}",
    "#p3r-dsh-pill.p3r-open{transform:translateY(-1px) scale(1.04);filter:drop-shadow(0 8px 16px rgba(216,0,24,0.45))}",
    "#p3r-dsh-pill:active{transform:scale(0.95)}",
    "#p3r-dsh-card{position:absolute;right:0;top:84px;bottom:auto;width:282px;padding:12px 14px 13px;border-radius:0;border:2px solid #090d1a;border-left:5px solid #d80018;background:linear-gradient(162deg,rgba(8,22,68,0.97) 0%,rgba(5,13,44,0.98) 100%);color:#e8f6ff;box-shadow:6px 6px 0 rgba(9,13,26,0.92),0 18px 40px rgba(0,10,48,0.62);display:none;flex-direction:column;gap:8px;transform-origin:top right;animation:p3rCardInDown .16s cubic-bezier(0.16,1,0.3,1)}",
    "#p3r-dsh-dock.p3r-dock-bottom #p3r-dsh-card{top:auto;bottom:84px;transform-origin:bottom right;animation:p3rCardIn .16s cubic-bezier(0.16,1,0.3,1)}",
    "#p3r-dsh-dock.p3r-dock-left #p3r-dsh-card{left:0;right:auto;transform-origin:top left}",
    "#p3r-dsh-dock.p3r-dock-bottom.p3r-dock-left #p3r-dsh-card{transform-origin:bottom left}",
    "#p3r-dsh-card.open{display:flex}",
    "@keyframes p3rCardIn{from{opacity:0;transform:translateY(6px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}",
    "@keyframes p3rCardInDown{from{opacity:0;transform:translateY(-6px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}",
    ".p3r-card-head{display:flex;align-items:center;justify-content:space-between;margin:-12px -14px 2px -14px;padding:8px 14px;background:#0044b8;border-bottom:2px solid #d80018;font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif;font-size:15px;font-weight:900;font-style:italic;letter-spacing:.05em;color:#ffffff}",
    ".p3r-card-tag{font-family:'Futura','Impact','Arial Black',sans-serif;font-size:10px;font-weight:900;padding:2px 9px;border-radius:0;background:#d80018;color:#ffffff;border:1.5px solid #090d1a;transform:skewX(-14deg);box-shadow:2px 2px 0 #090d1a}",
    ".p3r-card-tag span{display:inline-block;transform:skewX(2deg)}",
    ".p3r-row{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:#dbeafe;gap:8px;padding:4px 8px;margin:0 -4px;border-radius:0;border:1.5px solid transparent;cursor:pointer;transition:background .12s ease,color .12s ease,border-color .12s ease,transform .14s cubic-bezier(0.16,1,0.3,1)}",
    ".p3r-row:hover{background:#ffffff;color:#0b1020;border-color:#d90429;box-shadow:-3px 2px 0 #d90429;transform:translateX(3px);font-style:italic}",
    ".p3r-switch{position:relative;display:inline-flex;align-items:center;width:36px;height:18px;flex-shrink:0}",
    ".p3r-switch input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer;z-index:2}",
    ".p3r-switch-track{position:relative;width:100%;height:100%;background:#090d1a;border:1.5px solid #526890;border-radius:0;transform:skewX(-14deg);transition:background .15s ease,border-color .15s ease}",
    ".p3r-switch-track::after{content:'';position:absolute;top:2px;left:2px;width:11px;height:11px;background:#cbd5e1;border-radius:0;transition:transform .16s cubic-bezier(0.16,1,0.3,1),background .15s ease}",
    ".p3r-switch input:checked+.p3r-switch-track{background:#d80018;border-color:#ffe600}",
    ".p3r-switch input:checked+.p3r-switch-track::after{transform:translateX(17px);background:#ffe600}",
    ".p3r-slider-wrap{display:flex;flex-direction:column;gap:4px;font-size:11.5px;padding-top:2px}",
    ".p3r-slider-head{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:#dbeafe}",
    ".p3r-slider-wrap input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:0;background:#090d1a;border:1px solid #3c568c;outline:none;cursor:pointer}",
    ".p3r-slider-wrap input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:13px;height:13px;background:#ffe600;border:2px solid #090d1a;border-radius:0;transform:rotate(45deg);cursor:pointer;transition:transform .12s ease,background .12s ease}",
    ".p3r-slider-wrap input[type=range]::-webkit-slider-thumb:hover{background:#d80018;border-color:#ffffff;transform:rotate(45deg) scale(1.16)}",
    ".p3r-btn-row{display:flex;flex-wrap:wrap;gap:6px;padding-top:3px}",
    ".p3r-mini-btn{position:relative;flex:1 1 calc(50% - 4px);padding:6px 6px;border-radius:0;border:1.5px solid #090d1a;border-left:3.5px solid #0044b8;background:#090d1a;color:#e8f6ff;font-size:11px;font-weight:800;letter-spacing:.04em;cursor:pointer;text-align:center;white-space:nowrap;transform:skewX(-12deg);overflow:hidden;transition:transform .14s cubic-bezier(0.16,1,0.3,1),background .14s ease,border-color .14s ease,color .14s ease}",
    ".p3r-mini-btn>span{display:inline-block;transform:skewX(12deg)}",
    ".p3r-mini-btn:hover{transform:skewX(-12deg) translateY(-1px);background:#ffffff;color:#d90429;border-color:#d90429;box-shadow:2px 2px 0 #090d1a}",
    ".p3r-mini-btn:active{transform:skewX(-12deg) scale(0.95)}",
    ".p3r-mini-btn.primary{background:#d80018;border-color:#090d1a;border-left-color:#ffe600;color:#ffffff}",
    ".p3r-mini-btn.primary:hover{background:#ffffff;color:#d80018;border-color:#d80018}",
    "html.p3r-btn-fx #root button:not(:disabled),html.p3r-btn-fx #root [role='button']:not([aria-disabled='true']),html.p3r-btn-fx #root [role='tab'],html.p3r-btn-fx #root [role='menuitem'],html.p3r-btn-fx [role='dialog'] button:not(:disabled),html.p3r-btn-fx [role='menu'] [role='menuitem'],html.p3r-btn-fx [role='menu'] [role='menuitemradio'],html.p3r-btn-fx [role='menu'] [role='menuitemcheckbox'],html.p3r-btn-fx [role='listbox'] [role='option']{transition:transform .15s cubic-bezier(0.16,1,0.3,1),box-shadow .18s ease,border-color .18s ease,background .18s ease,background-color .18s ease,color .15s ease,filter .15s ease}",
    "html.p3r-btn-fx #root button:not(:disabled):not([class$='_panelRow']):not([class*='_panelRow ']):not([class$='_newSession']):not([class*='_newSession ']):not([class$='_trigger']):not([class*='_trigger ']):not([class$='_toggle']):not([class*='_toggle ']):not([class$='_searchButton']):not([class*='_searchButton ']):not([class$='_panelUnpin']):not([class*='_panelUnpin ']):not([class$='_iconButton']):not([class*='_iconButton ']):not([aria-current='page']):hover,html.p3r-btn-fx #root [role='button']:not([aria-disabled='true']):not([class*='_sidebarCol'] *):hover,html.p3r-btn-fx #root [role='tab']:hover,html.p3r-btn-fx [role='dialog'] button:not(:disabled):hover{border-color:#d90429!important;box-shadow:inset 3px 0 0 #d90429,3px 3px 0 rgba(9,13,26,0.72)!important}",
    "html.p3r-btn-fx #root [role='tab'][aria-selected='true'],html.p3r-btn-fx #root button[aria-pressed='true']:not([class*='_sidebarCol'] *){background:#d80018!important;color:#ffffff!important;border-color:#090d1a!important;box-shadow:3px 2px 0 #090d1a!important}",
    "html.p3r-btn-fx #root button:not(:disabled):active,html.p3r-btn-fx #root [role='button']:not([aria-disabled='true']):active,html.p3r-btn-fx #root [role='tab']:active,html.p3r-btn-fx [role='dialog'] button:not(:disabled):active{transform:scale(0.97)!important}",
    "html.p3r-btn-fx #root button:focus-visible,html.p3r-btn-fx #root [role='button']:focus-visible,html.p3r-btn-fx #p3r-dsh-dock button:focus-visible{outline:2px solid #d90429!important;outline-offset:2px!important}",
    "html.p3r-btn-fx [class*='_panelEntryActive']{background:transparent!important;background-color:transparent!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button[class$='_newSession'],html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession '],html.p3r-btn-fx [class*='_sidebarCol'] button[class$='_panelRow'],html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow '],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class$='_trigger'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger '],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_projectRow'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow '],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_sessionRow'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow ']{background:transparent!important;background-color:transparent!important;background-image:none!important;border:none!important;border-radius:6px!important;color:var(--p3r-sb-idle-color,#ffffff)!important;font-style:italic!important;font-weight:700!important;letter-spacing:.01em;text-shadow:var(--p3r-sb-idle-shadow,0 1px 4px rgba(0,12,72,0.56))!important;transition:transform .14s cubic-bezier(0.16,1,0.3,1),background .14s ease,background-color .14s ease,color .12s ease,box-shadow .16s ease!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button[class$='_newSession'] *,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession '] *,html.p3r-btn-fx [class*='_sidebarCol'] button[class$='_panelRow'] *,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow '] *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class$='_trigger'] *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger '] *,html.p3r-btn-fx [class*='_sidebarCol'] [class$='_projectRow'] *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow '] *,html.p3r-btn-fx [class*='_sidebarCol'] [class$='_sessionRow'] *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow '] *{color:inherit!important;font-style:italic!important;text-shadow:inherit!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class$='_sessionRow'] [class*='_time'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow '] [class*='_time'],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_sessionRow'] [class*='_meta'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow '] [class*='_meta'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_newSessionShortcut']{color:var(--p3r-sb-idle-sub,rgba(232,244,255,0.88))!important;font-style:italic!important;font-weight:600!important;background:transparent!important;border:none!important;box-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession'] kbd{background:rgba(255,255,255,0.14)!important;border:1px solid rgba(255,255,255,0.28)!important;color:var(--p3r-sb-idle-color,#ffffff)!important;text-shadow:none!important;box-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class$='_toggle'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_toggle '],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_searchButton'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_searchButton '],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_iconButton'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_iconButton '],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_panelUnpin'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_panelUnpin '],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_brand'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_brand ']{color:var(--p3r-sb-idle-color,#ffffff)!important;font-style:italic!important;border-radius:6px!important}",
    "html.p3r-skin-on.p3r-btn-fx kbd{font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif!important;font-weight:900!important;text-transform:uppercase}",
    "html.p3r-skin-on.p3r-btn-fx [data-p3r-en='1']{font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif!important;font-weight:900!important;text-transform:uppercase!important;letter-spacing:.02em!important;font-style:normal!important;display:inline-block;transform:skewX(-14deg)}",
    "html.p3r-skin-on.p3r-btn-fx body[data-ds-dark-theme] [data-p3r-en='1'],html.p3r-skin-on.p3r-btn-fx [class*='_centerCol'] [data-p3r-en='1'],html.p3r-skin-on.p3r-btn-fx [class*='_sidebarCol'] [data-p3r-en='1']{text-shadow:1.5px 2px 0 #04136e,2px 2.5px 0 #04136e,0 0 8px rgba(0,14,88,0.48)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button[class$='_newSession']:hover,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession ']:hover,html.p3r-btn-fx [class*='_sidebarCol'] button[class$='_newSession']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession ']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] button[class$='_panelRow']:hover,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow ']:hover,html.p3r-btn-fx [class*='_sidebarCol'] button[class$='_panelRow']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow ']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_panelEntryActive'] button[class*='_panelRow'],html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow'][aria-current='page'],html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow'][aria-expanded='true'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger'][aria-expanded='true'],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_projectRow']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow ']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class$='_projectRow']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow ']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow'][aria-selected='true'],html.p3r-btn-fx [class*='_sidebarCol'] [class$='_sessionRow']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow ']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class$='_sessionRow']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow ']:focus-visible,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow'][class*='_selected']{background:#ffffff!important;background-color:#ffffff!important;background-image:none!important;color:#0824e8!important;font-style:italic!important;font-weight:700!important;text-shadow:none!important;border-radius:6px!important;box-shadow:inset 0 3.5px 0 0 #5264ff,0 6px 18px rgba(0,14,88,0.36)!important;transform:translateX(3px)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession']:hover *,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession']:focus-visible *,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow']:hover *,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow']:focus-visible *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_panelEntryActive'] button[class*='_panelRow'] *,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow'][aria-current='page'] *,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow'][aria-expanded='true'] *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger']:hover *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger']:focus-visible *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger'][aria-expanded='true'] *,html.p3r-btn-fx [class*='_sidebarCol'] [class$='_projectRow']:hover *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow ']:hover *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow'][aria-selected='true'] *,html.p3r-btn-fx [class*='_sidebarCol'] [class$='_sessionRow']:hover *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow ']:hover *,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow'][class*='_selected'] *{color:#0824e8!important;font-style:italic!important;text-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession']:active,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_panelRow']:active,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_footArea'] button[class*='_trigger']:active,html.p3r-btn-fx [class*='_sidebarCol'] [class$='_projectRow']:active,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow ']:active,html.p3r-btn-fx [class*='_sidebarCol'] [class$='_sessionRow']:active,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow ']:active{transform:translateX(3px) scale(0.975)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession']:hover [class*='_newSessionShortcut'],html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession']:focus-visible [class*='_newSessionShortcut']{background:transparent!important;border:none!important;color:#0824e8!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession']:hover kbd,html.p3r-btn-fx [class*='_sidebarCol'] button[class*='_newSession']:focus-visible kbd{background:rgba(8,36,232,0.09)!important;color:#0824e8!important;border:1px solid rgba(8,36,232,0.28)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_panelRow'] [class*='_panelUnpin'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow'] [class*='_iconButton'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow'] [class*='_iconButton']{background:transparent!important;box-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_panelRow'] [class*='_panelUnpin']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow'] [class*='_iconButton']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow'] [class*='_iconButton']:hover{background:rgba(8,36,232,0.12)!important;color:#0824e8!important;box-shadow:none!important}",
    "html.p3r-btn-fx [class*='_collapsed'] [class*='_newSession']{width:36px!important;height:36px!important;justify-content:center!important;padding:0!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_toggle']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_searchButton']:hover,html.p3r-btn-fx [class*='_sidebarCol']>[class*='_iconButton']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_controls'] [class*='_iconButton']:hover{background:#ffffff!important;color:#0824e8!important;box-shadow:inset 0 3px 0 0 #5264ff,0 4px 12px rgba(0,14,88,0.34)!important;transform:scale(1.06)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_brand']{overflow:visible!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_brand']:hover{transform:translateX(2px) scale(1.02)!important;color:#ffffff!important;filter:drop-shadow(0 0 8px rgba(82,100,255,0.65))}",
    "html.p3r-skin-on [class*='_sidebarCol'] [class*='_brandMark'] svg{color:#ffffff!important;transform:skewX(-10deg) scale(1.05);filter:drop-shadow(2px 2px 0 #04136e) drop-shadow(0 0 8px rgba(0,240,255,0.38));transition:transform .16s ease,filter .16s ease}",
    "html.p3r-skin-on [class*='_sidebarCol'] [class*='_brandName']{overflow:visible!important;display:inline-flex!important;align-items:center!important}",
    "html.p3r-skin-on [class*='_sidebarCol'] [class*='_brandName'] [data-slot='sidebar.brand.name']{display:none!important}",
    "html:not(.p3r-skin-on) .p3r-brand-wordmark{display:none!important}",
    "html.p3r-skin-on .p3r-brand-wordmark{display:inline-flex;align-items:center;gap:6px;margin-left:2px;overflow:visible;line-height:1;user-select:none}",
    "html.p3r-skin-on .p3r-brand-ds{font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif!important;font-weight:900!important;font-size:17px;letter-spacing:.015em;color:#ffffff!important;text-transform:uppercase;font-style:normal!important;display:inline-block;transform:skewX(-16deg) rotate(-2.5deg);text-shadow:2.5px 2.5px 0 #04136e,-0.5px -0.5px 0 rgba(0,240,255,0.42),0 3px 10px rgba(0,14,88,0.62)!important}",
    "html.p3r-skin-on .p3r-brand-har{position:relative;display:inline-flex;align-items:center;padding:1px 4px;margin-left:1px;overflow:visible}",
    "html.p3r-skin-on .p3r-brand-orb{position:absolute;left:10px;top:50%;width:24px;height:24px;margin-top:-12px;border-radius:50%;background:#0a7cff;box-shadow:0 0 10px rgba(10,124,255,0.52);z-index:0;pointer-events:none;transition:transform .16s ease,box-shadow .16s ease}",
    "html.p3r-skin-on [class*='_sidebarCol'] [class*='_brand']:hover .p3r-brand-orb{transform:scale(1.14);box-shadow:0 0 16px rgba(0,240,255,0.85)}",
    "html.p3r-skin-on .p3r-brand-har-txt{position:relative;z-index:1;font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif!important;font-weight:900!important;font-size:12px;letter-spacing:.025em;color:#ffffff!important;text-transform:uppercase;font-style:normal!important;display:inline-block;transform:skewX(-16deg) rotate(-2.5deg) translateY(1px);text-shadow:2px 2px 0 #04136e,-0.5px -0.5px 0 rgba(0,14,88,0.65),0 2px 8px rgba(0,12,72,0.65)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sectionHeader'] [class*='_sectionLabel']{letter-spacing:.08em;font-style:italic!important;font-weight:700!important;color:var(--p3r-sb-idle-sub,rgba(232,244,255,0.88))!important;text-shadow:var(--p3r-sb-idle-shadow,0 1px 4px rgba(0,12,72,0.52))!important;text-transform:uppercase}",
    "html.p3r-btn-fx [class*='_folderActive']{color:#0824e8!important}",
    "html.p3r-btn-fx [role='menu'],html.p3r-btn-fx [role='listbox']{border:2px solid #090d1a!important;border-left:4px solid #0044b8!important;border-top:2px solid #d80018!important;border-radius:0!important;background:linear-gradient(162deg,rgba(8,22,68,0.96) 0%,rgba(5,13,44,0.97) 100%)!important;color:#e8f6ff!important;box-shadow:5px 5px 0 rgba(9,13,26,0.86),0 18px 40px rgba(0,10,48,0.58)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;animation:p3rMenuPopIn .14s cubic-bezier(0.16,1,0.3,1)}",
    "html.p3r-btn-fx body[data-ds-dark-theme] [role='menu'],html.p3r-btn-fx body[data-ds-dark-theme] [role='listbox']{background:linear-gradient(162deg,rgba(8,22,68,0.97) 0%,rgba(4,12,40,0.98) 100%)!important;color:#e8f6ff!important;box-shadow:5px 5px 0 rgba(9,13,26,0.9),0 20px 44px rgba(0,10,48,0.64)!important}",
    "html.p3r-btn-fx [role='menu'][data-menu-material]>[aria-hidden='true']{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "@keyframes p3rMenuPopIn{from{opacity:0;clip-path:inset(0 0 18% 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem'],html.p3r-btn-fx [role='listbox'] [role='option']{position:relative;overflow:hidden;border-radius:0!important;color:#dbeafe!important;font-weight:700;border:1.5px solid transparent!important}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem']:not([data-danger='true']):hover,html.p3r-btn-fx [role='menu'] [role^='menuitem']:not([data-danger='true']):focus-visible,html.p3r-btn-fx [role='menu'] [role^='menuitem'][data-highlighted]:not([data-danger='true']),html.p3r-btn-fx [role='listbox'] [role='option']:hover,html.p3r-btn-fx [role='listbox'] [role='option'][aria-selected='true']{background:#ffffff!important;color:#d90429!important;border-color:#d90429!important;box-shadow:-3px 2px 0 #d90429!important;font-style:italic!important;transform:translateX(3px)}",
    "html.p3r-btn-fx [role='menu'] [role='menuitemradio'][aria-checked='true'],html.p3r-btn-fx [role='menu'] [role='menuitemcheckbox'][aria-checked='true']{background:#d80018!important;color:#ffffff!important;border-color:#090d1a!important;box-shadow:3px 2px 0 #090d1a!important}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem'][data-danger='true']:hover,html.p3r-btn-fx [role='menu'] [role^='menuitem'][data-danger='true']:focus-visible{background:#d80018!important;color:#ffffff!important;border-color:#090d1a!important;box-shadow:3px 2px 0 #090d1a!important;transform:translateX(3px)}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem']:active,html.p3r-btn-fx [role='listbox'] [role='option']:active{transform:translateX(2px) scale(0.97)!important}",
    "html.p3r-btn-fx [role='menu'] [role='separator']{background:#3c568c!important}",
    "#p3r-fx-layer{position:fixed;inset:0;z-index:2147483400;pointer-events:none;overflow:hidden}",
    ".p3r-burst{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none}",
    ".p3r-burst-ring{position:absolute;left:-12px;top:-12px;width:24px;height:24px;border:2px solid #d80018;transform:skewX(-12deg) rotate(45deg) scale(0.35);animation:p3rRingOut .3s cubic-bezier(0.16,1,0.3,1) forwards}",
    ".p3r-burst-slash{position:absolute;left:-24px;top:-1.5px;width:48px;height:3px;background:linear-gradient(90deg,transparent 0%,#ffe600 28%,#ffffff 50%,#d80018 72%,transparent 100%);transform:rotate(-18deg) scaleX(0.25);animation:p3rSlashCut .22s cubic-bezier(0.16,1,0.3,1) forwards}",
    ".p3r-burst-shard{position:absolute;left:0;top:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;background:#d80018;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);animation:p3rShardFly .32s cubic-bezier(0.16,1,0.3,1) forwards}",
    ".p3r-burst-shard.alt{background:#ffe600;width:5px;height:9px;clip-path:polygon(50% 0%,100% 35%,45% 100%,0% 30%)}",
    "@keyframes p3rRingOut{0%{opacity:1;transform:skewX(-12deg) rotate(45deg) scale(0.35)}100%{opacity:0;transform:skewX(-12deg) rotate(45deg) scale(1.75)}}",
    "@keyframes p3rSlashCut{0%{opacity:1;transform:rotate(-18deg) scaleX(0.25)}55%{opacity:1;transform:rotate(-18deg) scaleX(1.15)}100%{opacity:0;transform:rotate(-18deg) scaleX(1.4)}}",
    "@keyframes p3rShardFly{0%{opacity:1;transform:translate(0,0) rotate(0deg) scale(1)}100%{opacity:0;transform:translate(var(--tx,22px),var(--ty,-18px)) rotate(var(--rot,90deg)) scale(0.15)}}",
    "@media (prefers-reduced-motion:reduce){.p3r-burst{display:none!important}}"
  ].join("");

  function ensureStyles() {
    if (document.getElementById("p3r-dsh-skin-css")) return;
    var style = document.createElement("style");
    style.id = "p3r-dsh-skin-css";
    style.textContent = CSS_TEXT;
    (document.head || document.documentElement).appendChild(style);
  }

  /* ========================================================================
     TWO-STAGE ALIGNED VIDEO BACKGROUND ENGINE
     ======================================================================== */
  var introVid = null;
  var loopVid = null;
  var handoffDone = false;
  var introWatchdog = 0;
  var blobPromises = {};
  var blobUrls = {};

  function resolveVideoSrc(url) {
    if (blobUrls[url]) return Promise.resolve(blobUrls[url]);
    if (!blobPromises[url]) {
      blobPromises[url] = fetch(url, { cache: "force-cache" })
        .then(function (res) {
          if (!res.ok) throw new Error("video status " + res.status);
          return res.blob();
        })
        .then(function (blob) {
          var objUrl = URL.createObjectURL(blob);
          blobUrls[url] = objUrl;
          return objUrl;
        })
        .catch(function () {
          return url;
        });
    }
    return blobPromises[url];
  }

  function assignVideoSrc(vid, url, onReady) {
    if (!vid) return;
    resolveVideoSrc(url).then(function (resolved) {
      if (!vid) return;
      if (vid.getAttribute("data-p3r-resolved-src") !== resolved) {
        vid.setAttribute("data-p3r-resolved-src", resolved);
        vid.src = resolved;
        try { vid.load(); } catch (e) {}
      }
      if (typeof onReady === "function") onReady(vid);
    });
  }

  function safePlay(vid) {
    if (!vid) return;
    try {
      var p = vid.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    } catch (e) {}
  }

  function switchToLoop(immediate) {
    if (handoffDone) return;
    handoffDone = true;
    if (introWatchdog) {
      clearTimeout(introWatchdog);
      introWatchdog = 0;
    }
    if (!loopVid) return;

    assignVideoSrc(loopVid, LOOP_URL, function () {
      if (!loopVid || !handoffDone) return;
      try {
        if (Math.abs((loopVid.currentTime || 0) - 0) > 0.12 && loopVid.paused) {
          loopVid.currentTime = 0;
        }
      } catch (e) {}
      if (cfg.enabled) safePlay(loopVid);
    });

    function hideIntro() {
      if (!introVid) return;
      if (immediate) {
        introVid.style.display = "none";
        try { introVid.pause(); } catch (e) {}
        return;
      }
      introVid.style.opacity = "0";
      setTimeout(function () {
        if (!introVid || !handoffDone) return;
        introVid.style.display = "none";
        try { introVid.pause(); } catch (e) {}
      }, 280);
    }

    if (immediate) {
      hideIntro();
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(hideIntro);
      });
    }
  }

  function playIntroSequence() {
    if (!introVid || !loopVid) return;
    handoffDone = false;
    if (introWatchdog) clearTimeout(introWatchdog);

    try { loopVid.pause(); } catch (e) {}
    try { loopVid.currentTime = 0; } catch (e) {}

    introVid.style.display = "block";
    introVid.style.opacity = "1";

    function startAtDive() {
      try {
        if (isFinite(introVid.duration) && introVid.duration > INTRO_START_SEC + 0.5) {
          introVid.currentTime = INTRO_START_SEC;
        } else {
          introVid.currentTime = 0;
        }
      } catch (e) {}
      if (cfg.enabled) safePlay(introVid);
    }

    assignVideoSrc(introVid, INTRO_URL, function () {
      if (introVid.readyState >= 1) {
        startAtDive();
      } else {
        introVid.addEventListener("loadedmetadata", startAtDive, { once: true });
      }
    });

    // Safety fallback if video stalls or fails on slow disks
    introWatchdog = setTimeout(function () {
      if (!handoffDone) switchToLoop(false);
    }, 8500);
  }

  function initVideoLifecycle() {
    if (!loopVid || !introVid) return;

    introVid.addEventListener("ended", function () {
      switchToLoop(false);
    });
    introVid.addEventListener("timeupdate", function () {
      if (handoffDone || !isFinite(introVid.duration) || introVid.duration <= 0) return;
      if (introVid.duration - introVid.currentTime <= 0.045) {
        switchToLoop(false);
      }
    });
    introVid.addEventListener("error", function () {
      switchToLoop(true);
    });

    assignVideoSrc(loopVid, LOOP_URL, function () {
      if (handoffDone && cfg.enabled && loopVid && loopVid.paused) {
        safePlay(loopVid);
      }
    });

    fetch(BOOT_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("boot-state failed");
        return res.json();
      })
      .then(function (data) {
        var played = Boolean(data && data.introPlayed);
        if (!played) {
          fetch(BOOT_URL, { method: "POST", cache: "no-store" }).catch(function () {});
          try {
            if (data && data.bootId) sessionStorage.setItem("p3r_dsh_boot_id", data.bootId);
          } catch (e) {}
          playIntroSequence();
        } else {
          switchToLoop(true);
        }
      })
      .catch(function () {
        // Fallback when opened without host route
        var seen = false;
        try { seen = sessionStorage.getItem("p3r_dsh_intro_seen") === "1"; } catch (e) {}
        if (!seen) {
          try { sessionStorage.setItem("p3r_dsh_intro_seen", "1"); } catch (e) {}
          playIntroSequence();
        } else {
          switchToLoop(true);
        }
      });
  }

  /* ========================================================================
     ADAPTIVE REGION GLASSIFIER (LEFT MENU + SESSION AREA, 0% TRANSPARENT)
     ======================================================================== */
  var glassScheduled = false;
  var glassTimer = 0;
  var lastGlassPassTs = 0;
  var applyingGlassPass = false;
  var detectedDark = false;

  function isFrameAnimating() {
    return Boolean(document.querySelector("[class*='_frame'][data-animating]"));
  }

  function parseAlphaToken(tok) {
    if (tok === undefined || tok === "") return 1;
    if (tok.endsWith("%")) return parseFloat(tok) / 100;
    return Number(tok);
  }

  function parseRgb(str) {
    if (!str) return null;
    var m = /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.%]+))?\s*\)/.exec(str);
    if (m) {
      return {
        r: Number(m[1]),
        g: Number(m[2]),
        b: Number(m[3]),
        a: parseAlphaToken(m[4]),
      };
    }
    var m4 = /^rgba?\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.%]+))?\s*\)/.exec(str);
    if (m4) {
      return {
        r: Number(m4[1]),
        g: Number(m4[2]),
        b: Number(m4[3]),
        a: parseAlphaToken(m4[4]),
      };
    }
    var msrgb = /^color\(\s*srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.%]+))?\s*\)/.exec(str);
    if (msrgb) {
      return {
        r: Math.round(Number(msrgb[1]) * 255),
        g: Math.round(Number(msrgb[2]) * 255),
        b: Math.round(Number(msrgb[3]) * 255),
        a: parseAlphaToken(msrgb[4]),
      };
    }
    return null;
  }

  function colorLuma(c) {
    return (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) / 255;
  }

  function detectThemeDark() {
    var html = document.documentElement;
    var body = document.body;
    if (body && body.hasAttribute("data-ds-dark-theme")) return true;
    var themeSrc = html.getAttribute("data-ds-theme-source") || html.getAttribute("data-theme");
    if (themeSrc === "dark") return true;
    if (themeSrc === "system" && typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches) {
      return true;
    }
    var cls = (html.className || "") + " " + ((body && body.className) || "");
    if (/\bdark\b/i.test(cls)) return true;
    var probe = document.querySelector("main, aside, #root > div, body");
    if (probe) {
      var bg = probe.dataset && probe.dataset.p3rOrigBg ? probe.dataset.p3rOrigBg : getComputedStyle(probe).backgroundColor;
      var parsed = parseRgb(bg);
      if (parsed && parsed.a > 0.2) return colorLuma(parsed) < 0.48;
    }
    return false;
  }

  function computeSurfaceVars(regionEnabled, isDark) {
    if (!regionEnabled || cfg.panelAlpha <= 0.004) {
      return {
        bg: "transparent",
        cardBg: "transparent",
        blur: "none",
        border: "transparent",
      };
    }
    var alpha = cfg.panelAlpha;
    var blurStr = cfg.blurPx > 0 ? "blur(" + cfg.blurPx + "px) saturate(118%)" : "none";
    if (isDark) {
      var darkA = Math.max(0, Math.min(0.95, alpha * 0.88));
      var darkCardA = Math.max(0, Math.min(0.95, alpha * 0.65));
      return {
        bg: "rgba(5, 24, 68, " + darkA.toFixed(3) + ")",
        cardBg: "rgba(8, 34, 88, " + darkCardA.toFixed(3) + ")",
        blur: blurStr,
        border: "rgba(134, 237, 252, " + Math.min(0.32, alpha * 0.36).toFixed(3) + ")",
      };
    }
    var lightCardA = Math.max(0, Math.min(0.95, alpha * 0.72));
    return {
      bg: "rgba(248, 252, 255, " + alpha.toFixed(3) + ")",
      cardBg: "rgba(255, 255, 255, " + lightCardA.toFixed(3) + ")",
      blur: blurStr,
      border: "rgba(192, 213, 232, " + Math.min(0.75, alpha * 0.85).toFixed(3) + ")",
    };
  }

  function syncGlassCssVars() {
    var html = document.documentElement;
    var htmlStyle = html.style;
    var sVars = computeSurfaceVars(cfg.sidebarGlass, detectedDark);
    var cVars = computeSurfaceVars(cfg.chatGlass, detectedDark);

    html.classList.toggle("p3r-chat-scrim", Boolean(cfg.enabled && cfg.chatScrim));

    htmlStyle.setProperty("--p3r-sidebar-bg", cfg.sidebarScrim ? "transparent" : sVars.bg);
    htmlStyle.setProperty("--p3r-sidebar-blur", sVars.blur);
    htmlStyle.setProperty("--p3r-sidebar-border", cfg.sidebarScrim ? "rgba(82, 100, 255, 0.28)" : sVars.border);
    htmlStyle.setProperty(
      "--p3r-sidebar-scrim",
      cfg.sidebarScrim
        ? "linear-gradient(108deg, rgba(2, 20, 114, 0.78) 0%, rgba(5, 29, 134, 0.65) 66%, rgba(8, 44, 162, 0.34) 100%)"
        : "none"
    );

    htmlStyle.setProperty("--p3r-session-bg", cfg.chatScrim ? "transparent" : cVars.bg);
    htmlStyle.setProperty("--p3r-session-blur", cVars.blur);
    htmlStyle.setProperty("--p3r-session-border", cfg.chatScrim ? "rgba(82, 100, 255, 0.22)" : cVars.border);
    htmlStyle.setProperty(
      "--p3r-session-scrim",
      cfg.chatScrim
        ? "linear-gradient(108deg, rgba(2, 18, 96, 0.56) 0%, rgba(4, 24, 118, 0.34) 44%, rgba(6, 36, 138, 0.14) 100%)"
        : "none"
    );
    htmlStyle.setProperty("--p3r-card-bg", cfg.chatScrim ? "rgba(5, 24, 96, 0.74)" : cVars.cardBg);

    var lightSolidSidebar = !detectedDark && cfg.enabled && !cfg.sidebarScrim && cfg.sidebarGlass && cfg.panelAlpha >= 0.38;
    htmlStyle.setProperty("--p3r-sb-idle-color", lightSolidSidebar ? "#0b2478" : "#ffffff");
    htmlStyle.setProperty("--p3r-sb-idle-sub", lightSolidSidebar ? "rgba(11, 36, 120, 0.76)" : "rgba(232, 244, 255, 0.88)");
    htmlStyle.setProperty("--p3r-sb-idle-shadow", lightSolidSidebar ? "none" : "0 1px 4px rgba(0, 12, 72, 0.56)");
  }

  function ensureP3rBrandLockup() {
    var slots = document.querySelectorAll("[class*='_sidebarCol'] [class*='_brandName']");
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      if (!slot || slot.querySelector(".p3r-brand-wordmark")) continue;
      var wrap = document.createElement("span");
      wrap.className = "p3r-brand-wordmark";
      wrap.setAttribute("data-p3r-brand", "1");
      wrap.setAttribute("aria-hidden", "true");
      wrap.innerHTML =
        '<span class="p3r-brand-ds">DEEPSEEK</span>' +
        '<span class="p3r-brand-har"><span class="p3r-brand-orb"></span><span class="p3r-brand-har-txt">HARNESS</span></span>';
      slot.appendChild(wrap);
    }
  }

  function markP3rEnglishUi(root) {
    if (!root || !cfg.btnFx) return;
    var items = root.querySelectorAll("button, [role='tab'], [role='menuitem'], [role='option'], span, h1, h2, h3, label");
    var limit = Math.min(items.length, 1400);
    var excludedSel = "pre, code, kbd, textarea, input, select, option, [contenteditable='true'], .cm-editor, .xterm, .katex, [class*='_brand'], p, li, td, th, blockquote, [class*='_markdown'], [class*='_prose'], [class*='_sessionRow'] [class*='_title'], [class*='_projectRow'] [class*='_title'], [class*='_rightbarCol'], [class*='_fileTree'], [class*='_changedFiles'], [class*='_deliverables'], [class*='_toolRow'], [class*='_fileName'], [class*='_fileMeta'], [data-p3r-bubble], [role='dialog'], [role='alertdialog']";
    var geoCheck = [];
    var writes = [];
    for (var i = 0; i < limit; i++) {
      var el = items[i];
      var wasMarked = el.getAttribute("data-p3r-en") === "1";
      if (el.children.length > 0) {
        if (wasMarked) writes.push({ el: el, add: false });
        continue;
      }
      var txt = (el.textContent || "").trim();
      if (
        txt.length < 2 ||
        txt.length > 26 ||
        txt.indexOf("/") >= 0 ||
        txt.indexOf("http") === 0 ||
        !/^(?=.*[A-Za-z]{2})[A-Za-z0-9][A-Za-z0-9 ._+:-]*$/.test(txt)
      ) {
        if (wasMarked) writes.push({ el: el, add: false });
        continue;
      }
      if (isExcludedOverlay(el) || el.closest(excludedSel)) {
        if (wasMarked) writes.push({ el: el, add: false });
        continue;
      }
      geoCheck.push({ el: el, wasMarked: wasMarked });
    }
    for (var g = 0; g < geoCheck.length; g++) {
      var item = geoCheck[g];
      var rect = item.el.getBoundingClientRect();
      var valid = rect.width > 0 && rect.height > 0 && rect.height <= 46;
      if (valid && !item.wasMarked) {
        writes.push({ el: item.el, add: true });
      } else if (!valid && item.wasMarked) {
        writes.push({ el: item.el, add: false });
      }
    }
    for (var w = 0; w < writes.length; w++) {
      if (writes[w].add) writes[w].el.setAttribute("data-p3r-en", "1");
      else writes[w].el.removeAttribute("data-p3r-en");
    }
  }

  function markChatBubbles(root) {
    if (!root) return;
    var scrollBodies = root.querySelectorAll(
      "[class$='_centerCol'] [class*='_scrollBody'], [class*='_centerCol '] [class*='_scrollBody'], [class*='_centerCol_'] [class*='_scrollBody']"
    );
    var writes = [];
    for (var s = 0; s < scrollBodies.length; s++) {
      var sb = scrollBodies[s];
      if (!sb || isExcludedOverlay(sb)) continue;

      var userBubbles = sb.querySelectorAll(
        "[class*='_userStack'] [class*='_bubble'], [class*='_userRow'] [class*='_bubble']"
      );
      for (var u = 0; u < userBubbles.length; u++) {
        var ub = userBubbles[u];
        if (!ub || isExcludedOverlay(ub) || ub.matches("[data-portal],[role='tooltip']")) continue;
        if (getComputedStyle(ub).position === "fixed") continue;
        if (ub.getAttribute("data-p3r-bubble") !== "user") {
          writes.push({ el: ub, val: "user" });
        }
      }

      var assistantBodies = sb.querySelectorAll(
        "[data-slot='conversation.chat.flow'] [class*='_body']:not([class*='_thinkBody']), [class*='_column'] [class*='_body']:not([class*='_thinkBody'])"
      );
      for (var a = 0; a < assistantBodies.length; a++) {
        var ab = assistantBodies[a];
        if (!ab || isExcludedOverlay(ab)) continue;
        if (ab.closest("[class*='_userRow'], [class*='_userStack']")) continue;
        if (ab.parentElement && ab.parentElement.closest("[data-p3r-bubble='assistant']")) continue;
        var hasContent =
          (ab.textContent && ab.textContent.trim().length > 0) ||
          Boolean(ab.querySelector("pre, table, blockquote, img, ul, ol"));
        if (!hasContent) {
          if (ab.hasAttribute("data-p3r-bubble")) writes.push({ el: ab, val: null });
          continue;
        }
        if (getComputedStyle(ab).position === "fixed") continue;
        if (ab.getAttribute("data-p3r-bubble") !== "assistant") {
          writes.push({ el: ab, val: "assistant" });
        }
      }
    }
    for (var k = 0; k < writes.length; k++) {
      if (writes[k].val) writes[k].el.setAttribute("data-p3r-bubble", writes[k].val);
      else writes[k].el.removeAttribute("data-p3r-bubble");
    }
  }

  function syncModalOpenState() {
    var html = document.documentElement;
    if (!cfg.enabled) {
      html.classList.remove("p3r-modal-open");
      return;
    }
    var dialogs = document.querySelectorAll("[role='dialog']:not(#p3r-dsh-card), [role='alertdialog']");
    var hasModal = false;
    for (var i = 0; i < dialogs.length; i++) {
      var d = dialogs[i];
      if (!d || d.hasAttribute("hidden") || d.getAttribute("aria-hidden") === "true") continue;
      var cs = getComputedStyle(d);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      hasModal = true;
      break;
    }
    html.classList.toggle("p3r-modal-open", hasModal);
  }

  function clearGlassMarkers() {
    document.documentElement.classList.remove("p3r-modal-open");
    var marked = document.querySelectorAll("[data-p3r-region]");
    for (var i = 0; i < marked.length; i++) {
      marked[i].removeAttribute("data-p3r-region");
    }
    var enMarked = document.querySelectorAll("[data-p3r-en]");
    for (var j = 0; j < enMarked.length; j++) {
      enMarked[j].removeAttribute("data-p3r-en");
    }
    var bubbleMarked = document.querySelectorAll("[data-p3r-bubble]");
    for (var k = 0; k < bubbleMarked.length; k++) {
      bubbleMarked[k].removeAttribute("data-p3r-bubble");
    }
  }

  function isExcludedOverlay(el) {
    if (!el) return true;
    if (el.closest("#p3r-dsh-stage") || el.closest("#p3r-dsh-dock") || el.closest("#p3r-dsh-wallet")) return true;
    if (
      el.matches("[role='dialog'],[role='alertdialog'],[role='menu'],[role='listbox'],[role='tooltip'],[data-radix-popper-content-wrapper],[class*='_overlayAnchor'],[class*='_float_'],[class*='_bannerWrap'],.dshwv-root,.dshwv-menu") ||
      el.closest("[role='dialog'],[role='alertdialog'],[role='menu'],[role='listbox'],[role='tooltip'],[data-radix-popper-content-wrapper],[class*='_overlayAnchor'],[class*='_float_'],[class*='_bannerWrap'],.dshwv-root,.dshwv-menu")
    ) {
      return true;
    }
    return false;
  }

  function hasAncestorRegion(el, targetRegion, stopSelector, pendingMap) {
    var cur = el ? el.parentElement : null;
    while (cur) {
      var r = pendingMap ? pendingMap.get(cur) : undefined;
      if (r === targetRegion) return true;
      if (r === undefined && cur.getAttribute("data-p3r-region") === targetRegion) return true;
      if (stopSelector && cur.matches(stopSelector)) return true;
      cur = cur.parentElement;
    }
    return false;
  }

  function applyGlassPass(forceImmediate) {
    glassScheduled = false;
    if (glassTimer) {
      clearTimeout(glassTimer);
      glassTimer = 0;
    }
    if (!cfg.enabled) {
      clearGlassMarkers();
      return;
    }

    if (!forceImmediate && isFrameAnimating()) {
      scheduleGlassPass(true);
      return;
    }

    var root = document.getElementById("root") || document.getElementById("app") || document.body;
    if (!root) return;

    applyingGlassPass = true;
    try {
      detectedDark = detectThemeDark();
      syncModalOpenState();
      syncGlassCssVars();
      ensureP3rBrandLockup();
      markChatBubbles(root);

      var vw = window.innerWidth || 1280;
      var vh = window.innerHeight || 800;
      var nodes = root.querySelectorAll("div, aside, main, section, nav, header, footer");
      var limit = Math.min(nodes.length, 2400);

      var sidebarColSel = "[class$='_sidebarCol'],[class*='_sidebarCol '],[class*='_sidebarCol_']";
      var sessionColSel = "[class$='_centerCol'],[class*='_centerCol '],[class*='_centerCol_'],[class$='_rightbarCol'],[class*='_rightbarCol '],[class*='_rightbarCol_']";
      var pendingRegions = new WeakMap();
      var regionWrites = [];
      var datasetWrites = [];

      for (var i = 0; i < limit; i++) {
        var el = nodes[i];
        var hadRegion = el.getAttribute("data-p3r-region");
        if (isExcludedOverlay(el) || el.closest("pre, code, .cm-editor, .xterm, .katex, [data-p3r-bubble]")) {
          if (hadRegion) {
            pendingRegions.set(el, null);
            regionWrites.push({ el: el, region: null });
          }
          continue;
        }

        var clsStr = typeof el.className === "string" ? el.className : "";
        if (/_sidebarCol(?:\b|_)|_centerCol(?:\b|_)|_rightbarCol(?:\b|_)|_bottomRow(?:\b|_)|_frame(?:\b|_)|_mainPanel(?:\b|_)|_tabHost_|_emptyTabHost_/.test(clsStr)) {
          continue;
        }

        var rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 36) {
          if (hadRegion) {
            pendingRegions.set(el, null);
            regionWrites.push({ el: el, region: null });
          }
          continue;
        }

        var origBg = el.dataset.p3rOrigBg;
        var origGrad = el.dataset.p3rOrigGrad;
        if (!origBg) {
          var cs = getComputedStyle(el);
          var c = parseRgb(cs.backgroundColor);
          var hasGrad = cs.backgroundImage && cs.backgroundImage !== "none";
          if ((!c || c.a < 0.25) && !hasGrad) continue;
          origBg = cs.backgroundColor;
          origGrad = hasGrad ? "1" : "0";
          datasetWrites.push({ el: el, bg: origBg, grad: origGrad });
        }

        var base = parseRgb(origBg);
        if (base && base.a >= 0.25) {
          var sat = Math.max(base.r, base.g, base.b) - Math.min(base.r, base.g, base.b);
          if (sat > 44 && rect.width < vw * 0.42 && rect.height < vh * 0.42) continue;
        }

        var nextRegion = null;

        if (
          (el.tagName !== "MAIN" && rect.width >= vw * 0.94 && rect.height >= vh * 0.92) ||
          (rect.top <= 4 && rect.width >= vw * 0.82 && rect.height <= 72)
        ) {
          nextRegion = "outer";
        } else {
          var inSidebarZone =
            Boolean(el.closest(sidebarColSel)) ||
            (rect.left <= 24 &&
              rect.right <= Math.max(460, vw * 0.44) &&
              (Boolean(el.closest("aside, nav")) || rect.height >= vh * 0.3 || rect.width >= 48));

          if (inSidebarZone) {
            if (hasAncestorRegion(el, "sidebar-surface", sidebarColSel, pendingRegions)) {
              if (rect.height >= 40 && (rect.width >= 100 || el.tagName === "HEADER" || el.tagName === "FOOTER" || el.scrollHeight > el.clientHeight + 16)) {
                nextRegion = "sidebar-inner";
              }
            } else if (
              el.tagName === "ASIDE" ||
              el.tagName === "NAV" ||
              rect.height >= vh * 0.35 ||
              rect.width >= 48
            ) {
              nextRegion = "sidebar-surface";
            }
          } else if (rect.width >= 150 && rect.height >= 42) {
            var isComposerContainer = /_composer(?:Seat|Stack|Hero)(?:\b|_)|_page(?:Bar|Head)|_compactionButton/.test(clsStr);
            if (!isComposerContainer) {
              var isSessionCard =
                !el.closest("[class*='_rightbarCol']") &&
                (/_card(?:\b|_)/.test(clsStr) ||
                  (rect.height <= vh * 0.48 &&
                    Boolean(el.querySelector("textarea, [contenteditable='true']")) &&
                    !el.querySelector("[class*='_scrollBody']")));
              if (isSessionCard) {
                nextRegion = "session-card";
              } else if (hasAncestorRegion(el, "session-surface", sessionColSel, pendingRegions)) {
                var isStructuralChild =
                  rect.height >= vh * 0.28 ||
                  rect.width >= vw * 0.4 ||
                  el.tagName === "MAIN" ||
                  el.tagName === "SECTION" ||
                  el.tagName === "HEADER" ||
                  el.tagName === "FOOTER" ||
                  el.scrollHeight > el.clientHeight + 20;
                if (isStructuralChild) {
                  nextRegion = "session-inner";
                }
              } else if (
                rect.height >= vh * 0.38 ||
                el.tagName === "MAIN" ||
                el.tagName === "HEADER"
              ) {
                nextRegion = "session-surface";
              }
            }
          }
        }

        pendingRegions.set(el, nextRegion);
        if (nextRegion && hadRegion !== nextRegion) {
          regionWrites.push({ el: el, region: nextRegion });
        } else if (!nextRegion && hadRegion) {
          regionWrites.push({ el: el, region: null });
        }
      }

      for (var d = 0; d < datasetWrites.length; d++) {
        datasetWrites[d].el.dataset.p3rOrigBg = datasetWrites[d].bg;
        datasetWrites[d].el.dataset.p3rOrigGrad = datasetWrites[d].grad;
      }
      for (var w = 0; w < regionWrites.length; w++) {
        if (regionWrites[w].region) {
          regionWrites[w].el.setAttribute("data-p3r-region", regionWrites[w].region);
        } else {
          regionWrites[w].el.removeAttribute("data-p3r-region");
        }
      }

      markP3rEnglishUi(root);
      positionOverlayWidgets();
      lastGlassPassTs = performance.now();
    } finally {
      applyingGlassPass = false;
    }
  }

  function scheduleGlassPass(deferAfterAnim) {
    syncModalOpenState();
    if (!cfg.enabled) return;
    if (isFrameAnimating() || deferAfterAnim) {
      if (glassTimer) clearTimeout(glassTimer);
      glassTimer = setTimeout(function () {
        glassTimer = 0;
        scheduleGlassPass(false);
      }, 340);
      return;
    }
    if (glassScheduled) return;
    var elapsed = performance.now() - lastGlassPassTs;
    if (elapsed < 120 && !glassTimer) {
      glassTimer = setTimeout(function () {
        glassTimer = 0;
        scheduleGlassPass(false);
      }, Math.max(24, 120 - elapsed));
      return;
    }
    glassScheduled = true;
    requestAnimationFrame(function () {
      applyGlassPass(false);
    });
  }

  /* ========================================================================
     P3R INTERACTIVE BUTTON FX ENGINE (SHARD BURST, SYNTH TONE)
     ======================================================================== */
  var fxLayer = null;
  var activeHoverTarget = null;
  var audioCtx = null;

  function playP3rTone(kind) {
    if (!cfg.btnSfx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended" && typeof audioCtx.resume === "function") {
        audioCtx.resume().catch(function () {});
      }
      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = kind === "click" ? "triangle" : "sine";
      if (kind === "hover") {
        osc.frequency.setValueAtTime(1180, now);
        osc.frequency.exponentialRampToValueAtTime(1580, now + 0.035);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        var f1 = kind === "toggle" ? 987.77 : 880;
        var f2 = kind === "toggle" ? 1479.98 : 1318.51;
        osc.frequency.setValueAtTime(f1, now);
        osc.frequency.exponentialRampToValueAtTime(f2, now + 0.065);
        gain.gain.setValueAtTime(0.055, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {}
  }

  function resolveFxTarget(node) {
    if (!node || typeof node.closest !== "function") return null;
    if (node.closest("#p3r-dsh-stage, #p3r-fx-layer, .cm-editor, .xterm, .dshwv-root, .dshwv-menu")) return null;
    var el = node.closest("button, [role='button'], [role='tab'], [role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox'], [role='option'], [role='treeitem'], [class*='_sessionRow'], summary, .p3r-row, #p3r-dsh-pill, #p3r-dsh-wallet");
    if (!el) return null;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") return null;
    var rect = el.getBoundingClientRect();
    if (rect.width < 12 || rect.height < 12 || rect.width > 680 || rect.height > 200) return null;
    return el;
  }

  function spawnClickBurst(x, y) {
    if (!fxLayer || !cfg.btnFx) return;
    while (fxLayer.querySelectorAll(".p3r-burst").length >= 6) {
      var oldest = fxLayer.querySelector(".p3r-burst");
      if (!oldest) break;
      oldest.remove();
    }
    var burst = document.createElement("div");
    burst.className = "p3r-burst";
    burst.style.left = Math.round(x) + "px";
    burst.style.top = Math.round(y) + "px";

    var ring = document.createElement("span");
    ring.className = "p3r-burst-ring";
    var slash = document.createElement("span");
    slash.className = "p3r-burst-slash";
    burst.appendChild(ring);
    burst.appendChild(slash);

    var vectors = [
      { tx: -26, ty: -18, rot: "-75deg", alt: false },
      { tx: 28, ty: -16, rot: "85deg", alt: true },
      { tx: 22, ty: 20, rot: "130deg", alt: false },
      { tx: -22, ty: 19, rot: "-125deg", alt: true },
      { tx: 2, ty: -29, rot: "45deg", alt: false },
    ];
    for (var i = 0; i < vectors.length; i++) {
      var shard = document.createElement("span");
      shard.className = "p3r-burst-shard" + (vectors[i].alt ? " alt" : "");
      shard.style.setProperty("--tx", vectors[i].tx + "px");
      shard.style.setProperty("--ty", vectors[i].ty + "px");
      shard.style.setProperty("--rot", vectors[i].rot);
      burst.appendChild(shard);
    }

    fxLayer.appendChild(burst);
    setTimeout(function () {
      if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 380);
  }

  function installButtonFxEngine() {
    if (fxLayer) return;
    fxLayer = document.createElement("div");
    fxLayer.id = "p3r-fx-layer";
    fxLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(fxLayer);

    document.addEventListener(
      "pointerover",
      function (e) {
        if (!cfg.btnFx) return;
        var t = resolveFxTarget(e.target);
        if (!t) {
          activeHoverTarget = null;
          return;
        }
        if (t !== activeHoverTarget) {
          activeHoverTarget = t;
          playP3rTone("hover");
        }
      },
      true
    );

    document.addEventListener(
      "pointerdown",
      function (e) {
        var t = resolveFxTarget(e.target);
        if (!t) return;
        if (cfg.btnFx) {
          activeHoverTarget = t;
          spawnClickBurst(e.clientX, e.clientY);
        }
        playP3rTone(t.classList && t.classList.contains("p3r-row") ? "toggle" : "click");
      },
      true
    );

    document.addEventListener(
      "focusin",
      function (e) {
        if (!cfg.btnFx) return;
        var t = resolveFxTarget(e.target);
        if (t) activeHoverTarget = t;
      },
      true
    );

    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Escape" && cfg.dockExpanded) {
          cfg.dockExpanded = false;
          var card = document.getElementById("p3r-dsh-card");
          var pillEl = document.getElementById("p3r-dsh-pill");
          if (card) card.classList.remove("open");
          if (pillEl) pillEl.classList.remove("p3r-open");
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          var t = resolveFxTarget(document.activeElement);
          if (t) {
            var r = t.getBoundingClientRect();
            if (cfg.btnFx) spawnClickBurst(r.left + r.width / 2, r.top + r.height / 2);
            playP3rTone("click");
          }
        }
      },
      true
    );

    window.addEventListener("blur", function () {
      activeHoverTarget = null;
    });
    document.addEventListener("mouseleave", function () {
      activeHoverTarget = null;
    });
  }

  /* ========================================================================
     P3R CURRENT WALLET WIDGET
     ======================================================================== */
  var walletEl = null;
  var walletCurEl = null;
  var walletAmtEl = null;
  var walletRefreshing = false;
  var walletTimer = 0;

  function formatWalletCurrency(cur) {
    var code = String(cur || "CNY").toUpperCase();
    if (code === "USD") return "$";
    if (code === "EUR") return "€";
    if (code === "GBP") return "£";
    return "¥";
  }

  function formatWalletAmount(num) {
    if (typeof num !== "number" || !isFinite(num)) return "--.--";
    var roundedInt = Math.round(num);
    if (Math.abs(num - roundedInt) < 0.005) {
      return roundedInt.toLocaleString("en-US");
    }
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function rectIntersects(a, b, pad) {
    var p = pad || 0;
    return !(
      a.right + p <= b.left ||
      a.left - p >= b.right ||
      a.bottom + p <= b.top ||
      a.top - p >= b.bottom
    );
  }

  function collectLayoutObstacles(centerCol, includePill) {
    var out = [];
    var selectors = [
      "[data-p3r-bubble]",
      "[class*='_centerCol'] div[class*='_card']",
      "[class*='_centerCol'] textarea",
      "[class*='_centerCol'] .cm-editor",
      "[class*='_centerCol'] [class*='_scrollBody'] [class*='_bubble']",
      "[class*='_centerCol'] [class*='_heroWorkspaceRow']",
      "[class*='_centerCol'] [class*='_headline']",
      "[class*='_centerCol'] header button",
    ];
    if (includePill) selectors.unshift("#p3r-dsh-pill");
    for (var i = 0; i < selectors.length; i++) {
      var nodes = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < nodes.length; j++) {
        var r = nodes[j].getBoundingClientRect();
        if (r.width >= 8 && r.height >= 8) out.push(r);
      }
    }
    if (centerCol) {
      var h = centerCol.querySelector("header");
      if (h) {
        var hr = h.getBoundingClientRect();
        if (hr.width > 0 && hr.height > 0) out.push(hr);
      }
    }
    return out;
  }

  function clampWidgetCoords(left, top, width, height) {
    var vw = window.innerWidth || 1280;
    var vh = window.innerHeight || 800;
    var maxL = Math.max(6, vw - width - 6);
    var maxT = Math.max(6, vh - height - 6);
    return {
      left: Math.max(6, Math.min(maxL, Math.round(left))),
      top: Math.max(6, Math.min(maxT, Math.round(top))),
    };
  }

  function applyDockPopupDirection(dockEl, left, top, pW, pH) {
    var vw = window.innerWidth || 1280;
    var vh = window.innerHeight || 800;
    dockEl.classList.toggle("p3r-dock-bottom", top + pH / 2 > vh * 0.52);
    dockEl.classList.toggle("p3r-dock-left", left + pW / 2 < vw * 0.5);
  }

  function makeWidgetDraggable(handleEl, targetEl, posKey) {
    if (!handleEl || !targetEl) return;
    var suppressClick = false;

    handleEl.addEventListener(
      "click",
      function (e) {
        if (suppressClick) {
          suppressClick = false;
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true
    );

    handleEl.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      var rect = targetEl.getBoundingClientRect();
      var startX = e.clientX;
      var startY = e.clientY;
      var origLeft = rect.left;
      var origTop = rect.top;
      var moved = false;

      function onMove(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        if (!moved && Math.hypot(dx, dy) <= 4) return;
        if (!moved) {
          moved = true;
          suppressClick = true;
          targetEl.classList.add("p3r-dragging");
        }
        var curW = Math.max(48, Math.round(rect.width || targetEl.offsetWidth || 74));
        var curH = Math.max(40, Math.round(rect.height || targetEl.offsetHeight || 52));
        var pos = clampWidgetCoords(origLeft + dx, origTop + dy, curW, curH);
        targetEl.style.left = pos.left + "px";
        targetEl.style.top = pos.top + "px";
        targetEl.style.right = "auto";
        targetEl.style.bottom = "auto";
        if (posKey === "dock") {
          applyDockPopupDirection(targetEl, pos.left, pos.top, curW, curH);
        }
      }

      function onEnd() {
        window.removeEventListener("pointermove", onMove, true);
        window.removeEventListener("pointerup", onEnd, true);
        window.removeEventListener("pointercancel", onEnd, true);
        targetEl.classList.remove("p3r-dragging");
        if (moved) {
          var finalRect = targetEl.getBoundingClientRect();
          var curW = Math.max(48, Math.round(finalRect.width || targetEl.offsetWidth || 74));
          var curH = Math.max(40, Math.round(finalRect.height || targetEl.offsetHeight || 52));
          var pos = clampWidgetCoords(finalRect.left, finalRect.top, curW, curH);
          customPos[posKey] = pos;
          saveCustomPos();
          setTimeout(function () {
            suppressClick = false;
          }, 60);
        }
      }

      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerup", onEnd, true);
      window.addEventListener("pointercancel", onEnd, true);
    });
  }

  function positionDockWidget() {
    var dockEl = document.getElementById("p3r-dsh-dock");
    if (!dockEl) return;
    var vw = window.innerWidth || 1280;
    var vh = window.innerHeight || 800;
    var pW = 74;
    var pH = 78;

    if (customPos.dock) {
      var pinned = clampWidgetCoords(customPos.dock.left, customPos.dock.top, pW, pH);
      dockEl.style.left = pinned.left + "px";
      dockEl.style.top = pinned.top + "px";
      dockEl.style.right = "auto";
      dockEl.style.bottom = "auto";
      applyDockPopupDirection(dockEl, pinned.left, pinned.top, pW, pH);
      return;
    }

    var centerCol = document.querySelector("[class*='_centerCol']");
    var cr = centerCol ? centerCol.getBoundingClientRect() : { left: 0, right: vw, top: 0, bottom: vh };
    var hdr = centerCol ? centerCol.querySelector("header") : document.querySelector("header");
    var headerBottom = hdr ? Math.round(hdr.getBoundingClientRect().bottom) : 48;
    var topY = Math.max(14, headerBottom + 14);
    var obstacles = collectLayoutObstacles(centerCol, false);

    var candidates = [
      { left: Math.round(cr.right - pW - 20), top: topY, v: "top", h: "right" },
      { left: Math.round(cr.left + 18), top: topY, v: "top", h: "left" },
      { left: Math.round(cr.right - pW - 20), top: Math.round(vh - pH - 16), v: "bottom", h: "right" },
      { left: Math.round(cr.left + 18), top: Math.round(vh - pH - 16), v: "bottom", h: "left" },
    ];

    var chosen = null;
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (c.left < cr.left + 6 || c.left + pW > cr.right - 6) continue;
      if (c.top < 8 || c.top + pH > vh - 8) continue;
      var box = { left: c.left, top: c.top, right: c.left + pW, bottom: c.top + pH };
      var blocked = false;
      for (var k = 0; k < obstacles.length; k++) {
        if (rectIntersects(box, obstacles[k], 6)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        chosen = c;
        break;
      }
    }

    if (!chosen) {
      chosen = { left: Math.round(vw - pW - 18), top: topY, v: "top", h: "right" };
    }

    dockEl.style.left = chosen.left + "px";
    dockEl.style.top = chosen.top + "px";
    dockEl.style.right = "auto";
    dockEl.style.bottom = "auto";
    dockEl.classList.toggle("p3r-dock-bottom", chosen.v === "bottom");
    dockEl.classList.toggle("p3r-dock-left", chosen.h === "left");
  }

  function positionWalletWidget() {
    if (!walletEl) return;
    if (!cfg.enabled || cfg.peek) {
      walletEl.classList.add("p3r-hidden");
      return;
    }
    var vw = window.innerWidth || 1280;
    var vh = window.innerHeight || 800;
    if (vw < 540 || vh < 340) {
      walletEl.classList.add("p3r-hidden");
      return;
    }

    var wr = walletEl.getBoundingClientRect();
    var wW = Math.max(136, Math.round(wr.width || 144));
    var wH = Math.max(46, Math.round(wr.height || 52));

    if (customPos.wallet) {
      var pinned = clampWidgetCoords(customPos.wallet.left, customPos.wallet.top, wW, wH);
      walletEl.style.left = pinned.left + "px";
      walletEl.style.top = pinned.top + "px";
      walletEl.style.right = "auto";
      walletEl.style.bottom = "auto";
      walletEl.classList.remove("p3r-hidden");
      return;
    }

    var centerCol = document.querySelector("[class*='_centerCol']");
    var cr = centerCol ? centerCol.getBoundingClientRect() : { left: 0, right: vw, top: 0, bottom: vh };
    var hdr = centerCol ? centerCol.querySelector("header") : document.querySelector("header");
    var headerBottom = hdr ? Math.round(hdr.getBoundingClientRect().bottom) : 48;
    var topY = Math.max(14, headerBottom + 14);
    var obstacles = collectLayoutObstacles(centerCol, true);

    var candidates = [
      { left: Math.round(cr.right - wW - 18), top: Math.round(vh - wH - 16) },
      { left: Math.round(cr.left + 20), top: Math.round(vh - wH - 16) },
      { left: Math.round(cr.right - wW - 18), top: Math.round(vh - wH - 102) },
      { left: Math.round(cr.right - wW - 18), top: topY },
      { left: Math.round(cr.left + 20), top: topY },
      { left: Math.round(vw - wW - 102), top: Math.round(vh - wH - 16) },
    ];

    var chosen = null;
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (c.left < cr.left + 8 || c.left + wW > cr.right - 8) continue;
      if (c.top < 10 || c.top + wH > vh - 10) continue;
      var box = { left: c.left, top: c.top, right: c.left + wW, bottom: c.top + wH };
      var blocked = false;
      for (var k = 0; k < obstacles.length; k++) {
        if (rectIntersects(box, obstacles[k], 8)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        chosen = c;
        break;
      }
    }

    if (!chosen) {
      walletEl.classList.add("p3r-hidden");
      return;
    }

    walletEl.style.left = chosen.left + "px";
    walletEl.style.top = chosen.top + "px";
    walletEl.style.right = "auto";
    walletEl.style.bottom = "auto";
    walletEl.classList.remove("p3r-hidden");
  }

  function positionOverlayWidgets() {
    positionDockWidget();
    positionWalletWidget();
  }

  var P3R_I18N = {
    zh: {
      enabled: "启用动态视频背景",
      chatGlass: "会话区毛玻璃",
      chatScrim: "主区深蓝护眼衬底",
      sidebarGlass: "左侧菜单毛玻璃",
      sidebarScrim: "侧栏深蓝护眼衬底",
      btnFx: "P3R 按键/菜单动效",
      btnSfx: "P3R 按键音效",
      glassOpacity: "毛玻璃透明度",
      transparentZero: "0% (完全透明)",
      blurStrength: "模糊强度",
      peek: "全景预览",
      restore: "恢复界面",
      replay: "重播落水",
      resetPos: "重置位置",
      close: "收起",
      pillTitle: "Persona 3 Reload 设置（按住拖拽可移动位置）",
      walletDefaultTitle: "当前余额（点击刷新 / 按住拖拽移动）",
      walletBalancePrefix: "当前余额: ",
      walletBonus: "含赠金 ",
      walletTodayUsage: "今日消耗: ",
      walletDragHint: "（点击刷新 / 按住拖拽移动）"
    },
    en: {
      enabled: "Dynamic Video Backdrop",
      chatGlass: "Chat Frosted Glass",
      chatScrim: "Chat Deep-Blue Scrim",
      sidebarGlass: "Sidebar Frosted Glass",
      sidebarScrim: "Sidebar Deep-Blue Scrim",
      btnFx: "P3R Button & Menu FX",
      btnSfx: "P3R Button SFX",
      glassOpacity: "Glass Opacity",
      transparentZero: "0% (Transparent)",
      blurStrength: "Blur Strength",
      peek: "Peek Backdrop",
      restore: "Restore UI",
      replay: "Replay Intro",
      resetPos: "Reset Pos",
      close: "Close",
      pillTitle: "Persona 3 Reload Settings (Drag to move)",
      walletDefaultTitle: "Current Balance (Click to refresh / Drag to move)",
      walletBalancePrefix: "Balance: ",
      walletBonus: "Bonus ",
      walletTodayUsage: "Today: ",
      walletDragHint: " (Click to refresh / Drag to move)"
    },
    ja: {
      enabled: "動的ビデオ背景を有効化",
      chatGlass: "チャットすりガラス",
      chatScrim: "チャット濃紺スクリーム",
      sidebarGlass: "サイドバーすりガラス",
      sidebarScrim: "サイドバー濃紺スクリーム",
      btnFx: "P3R ボタン・メニュー演出",
      btnSfx: "P3R ボタン効果音",
      glassOpacity: "ガラス不透明度",
      transparentZero: "0% (完全透明)",
      blurStrength: "ぼかし強度",
      peek: "背景プレビュー",
      restore: "UI を復元",
      replay: "導入を再再生",
      resetPos: "位置リセット",
      close: "閉じる",
      pillTitle: "Persona 3 Reload 設定（ドラッグで移動）",
      walletDefaultTitle: "現在の残高（クリックで更新 / ドラッグで移動）",
      walletBalancePrefix: "現在の残高: ",
      walletBonus: "ボーナス ",
      walletTodayUsage: "本日利用: ",
      walletDragHint: "（クリックで更新 / ドラッグで移動）"
    }
  };

  var activeLang = "zh";
  var lastWalletData = null;

  function normalizeLocaleCode(raw) {
    var s = String(raw || "").trim().toLowerCase();
    if (!s) return "";
    if (s === "zh" || s.indexOf("zh-") === 0 || s.indexOf("zh_") === 0) return "zh";
    if (s === "ja" || s.indexOf("ja-") === 0 || s.indexOf("ja_") === 0) return "ja";
    if (s === "en" || s.indexOf("en-") === 0 || s.indexOf("en_") === 0) return "en";
    return "";
  }

  function detectDshLang() {
    try {
      var bridge = window.__P3R_DSH_LOCALE__;
      if (bridge) {
        var bridgeVal = typeof bridge.get === "function" ? bridge.get() : bridge.active;
        var mappedBridge = normalizeLocaleCode(bridgeVal);
        if (mappedBridge) return mappedBridge;
      }
    } catch (e) {}

    try {
      var chromeNodes = document.querySelectorAll(
        "[class*='_sidebarCol'] button[class*='_newSession'], [class*='_sidebarCol'] [class*='_sectionLabel']"
      );
      var combinedChrome = "";
      for (var i = 0; i < chromeNodes.length; i++) {
        var txt = (chromeNodes[i].textContent || "").trim();
        if (txt) combinedChrome += " " + txt;
      }
      if (combinedChrome) {
        if (/[\u3040-\u30ff]/.test(combinedChrome)) return "ja";
        if (/[\u4e00-\u9fff]/.test(combinedChrome)) return "zh";
        if (/\b(?:New\s+(?:Chat|Session)|Pinned|Today|Yesterday|Recent)\b/i.test(combinedChrome)) return "en";
      }
    } catch (e) {}

    try {
      var htmlLang = normalizeLocaleCode(document.documentElement && document.documentElement.lang);
      if (htmlLang) return htmlLang;
    } catch (e) {}

    try {
      var navLang = normalizeLocaleCode(typeof navigator !== "undefined" && navigator.language);
      if (navLang) return navLang;
    } catch (e) {}

    return "en";
  }

  function tr(key) {
    var dict = P3R_I18N[activeLang] || P3R_I18N.en;
    if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    return P3R_I18N.en[key] || P3R_I18N.zh[key] || key;
  }

  function formatWalletTitle(data) {
    if (!data || !data.ok) return tr("walletDefaultTitle");
    var val = typeof data.totalBalance === "number" ? data.totalBalance : data.balance;
    if (typeof val !== "number" || !isFinite(val)) return tr("walletDefaultTitle");
    var tip = tr("walletBalancePrefix") + formatWalletCurrency(data.currency) + formatWalletAmount(val);
    if (typeof data.bonusBalance === "number" && data.bonusBalance > 0) {
      tip += " (" + tr("walletBonus") + formatWalletAmount(data.bonusBalance) + ")";
    }
    if (typeof data.todayUsage === "number" && isFinite(data.todayUsage)) {
      tip += " | " + tr("walletTodayUsage") + data.todayUsage.toFixed(2);
    }
    return tip + tr("walletDragHint");
  }

  function applyI18n(force) {
    var nextLang = detectDshLang();
    if (!force && nextLang === activeLang) return;
    activeLang = nextLang;

    var card = document.getElementById("p3r-dsh-card");
    if (card) {
      var nodes = card.querySelectorAll("[data-p3r-i18n]");
      for (var i = 0; i < nodes.length; i++) {
        var key = nodes[i].getAttribute("data-p3r-i18n");
        if (key) nodes[i].textContent = tr(key);
      }
      var btnPeek = document.getElementById("p3r-btn-peek");
      if (btnPeek) {
        var btnPeekLabel = btnPeek.querySelector("span") || btnPeek;
        btnPeekLabel.textContent = tr(cfg.peek ? "restore" : "peek");
      }
      var alphaVal = document.getElementById("p3r-alpha-val");
      if (alphaVal) alphaVal.textContent = formatAlphaText(cfg.panelAlpha);
    }

    var pill = document.getElementById("p3r-dsh-pill");
    if (pill) pill.title = tr("pillTitle");
    if (walletEl) walletEl.title = formatWalletTitle(lastWalletData);
  }

  function fetchWalletBalance(force) {
    if (!walletEl || walletRefreshing) return;
    walletRefreshing = true;
    walletEl.classList.add("p3r-wallet-loading");
    var url = "/p3r-skin/wallet.json" + (force ? "?force=1" : "");
    fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("http_" + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) return;
        var val = typeof data.totalBalance === "number" ? data.totalBalance : data.balance;
        if (typeof val !== "number" || !isFinite(val)) return;
        lastWalletData = data;
        if (walletCurEl) walletCurEl.textContent = formatWalletCurrency(data.currency);
        if (walletAmtEl) walletAmtEl.textContent = formatWalletAmount(val);
        walletEl.title = formatWalletTitle(data);
        positionOverlayWidgets();
      })
      .catch(function () {})
      .then(function () {
        walletRefreshing = false;
        if (walletEl) walletEl.classList.remove("p3r-wallet-loading");
      });
  }

  /* ========================================================================
     UI STAGE + FLOATING CONTROL DOCK
     ======================================================================== */
  function syncStateToDom() {
    var html = document.documentElement;
    var stage = document.getElementById("p3r-dsh-stage");

    html.classList.toggle("p3r-skin-on", cfg.enabled);
    html.classList.toggle("p3r-chat-scrim", Boolean(cfg.enabled && cfg.chatScrim));
    html.classList.toggle("p3r-peek", cfg.enabled && cfg.peek);
    html.classList.toggle("p3r-btn-fx", cfg.btnFx);

    if (stage) stage.classList.toggle("p3r-off", !cfg.enabled);
    if (!cfg.btnFx) activeHoverTarget = null;
    positionOverlayWidgets();

    if (cfg.enabled) {
      if (handoffDone) {
        if (loopVid && loopVid.paused) safePlay(loopVid);
      } else if (introVid && introVid.style.display !== "none" && introVid.paused) {
        safePlay(introVid);
      }
      syncGlassCssVars();
      applyGlassPass();
    } else {
      if (introVid && !introVid.paused) try { introVid.pause(); } catch (e) {}
      if (loopVid && !loopVid.paused) try { loopVid.pause(); } catch (e) {}
      clearGlassMarkers();
    }
  }

  function formatAlphaText(val) {
    var pct = Math.round(val * 100);
    return pct === 0 ? tr("transparentZero") : pct + "%";
  }

  function buildSwitchRow(i18nKey, inputId) {
    return (
      '<label class="p3r-row"><span data-p3r-i18n="' +
      i18nKey +
      '">' +
      tr(i18nKey) +
      '</span><span class="p3r-switch"><input type="checkbox" id="' +
      inputId +
      '"><span class="p3r-switch-track"></span></span></label>'
    );
  }

  function mountDom() {
    if (!document.body || document.getElementById("p3r-dsh-stage")) return;
    ensureStyles();
    activeLang = detectDshLang();

    var stage = document.createElement("div");
    stage.id = "p3r-dsh-stage";
    stage.setAttribute("aria-hidden", "true");

    loopVid = document.createElement("video");
    loopVid.id = "p3r-vid-loop";
    loopVid.className = "p3r-dsh-vid";
    loopVid.muted = true;
    loopVid.playsInline = true;
    loopVid.loop = true;
    loopVid.preload = "auto";

    introVid = document.createElement("video");
    introVid.id = "p3r-vid-intro";
    introVid.className = "p3r-dsh-vid";
    introVid.muted = true;
    introVid.playsInline = true;
    introVid.preload = "auto";

    stage.appendChild(loopVid);
    stage.appendChild(introVid);
    document.body.insertBefore(stage, document.body.firstChild);

    // Floating Control Dock (P3R Reload Skewed Command Strip)
    var dock = document.createElement("div");
    dock.id = "p3r-dsh-dock";
    dock.innerHTML =
      '<div id="p3r-dsh-card">' +
      '  <div class="p3r-card-head"><span>P3R // RELOAD</span><span class="p3r-card-tag"><span>TACTICS</span></span></div>' +
      buildSwitchRow("enabled", "p3r-chk-enabled") +
      buildSwitchRow("chatGlass", "p3r-chk-chat-glass") +
      buildSwitchRow("chatScrim", "p3r-chk-chat-scrim") +
      buildSwitchRow("sidebarGlass", "p3r-chk-sidebar-glass") +
      buildSwitchRow("sidebarScrim", "p3r-chk-sidebar-scrim") +
      buildSwitchRow("btnFx", "p3r-chk-btn-fx") +
      buildSwitchRow("btnSfx", "p3r-chk-btn-sfx") +
      '  <div class="p3r-slider-wrap">' +
      '    <div class="p3r-slider-head"><span data-p3r-i18n="glassOpacity">' + tr("glassOpacity") + '</span><b id="p3r-alpha-val">48%</b></div>' +
      '    <input type="range" id="p3r-rng-alpha" min="0" max="0.92" step="0.01">' +
      "  </div>" +
      '  <div class="p3r-slider-wrap">' +
      '    <div class="p3r-slider-head"><span data-p3r-i18n="blurStrength">' + tr("blurStrength") + '</span><b id="p3r-blur-val">14px</b></div>' +
      '    <input type="range" id="p3r-rng-blur" min="0" max="24" step="1">' +
      "  </div>" +
      '  <div class="p3r-btn-row">' +
      '    <button type="button" class="p3r-mini-btn primary" id="p3r-btn-peek"><span>' + tr("peek") + '</span></button>' +
      '    <button type="button" class="p3r-mini-btn" id="p3r-btn-replay"><span data-p3r-i18n="replay">' + tr("replay") + '</span></button>' +
      '    <button type="button" class="p3r-mini-btn" id="p3r-btn-reset-pos"><span data-p3r-i18n="resetPos">' + tr("resetPos") + '</span></button>' +
      '    <button type="button" class="p3r-mini-btn" id="p3r-btn-close"><span data-p3r-i18n="close">' + tr("close") + '</span></button>' +
      "  </div>" +
      "</div>" +
      '<button type="button" id="p3r-dsh-pill" draggable="false" title="' + tr("pillTitle") + '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 156" width="100%" height="100%" aria-hidden="true"><defs><filter id="p3r-mk-rim" x="-15%" y="-15%" width="130%" height="130%"><feComponentTransfer in="SourceAlpha" result="thresh"><feFuncA type="discrete" tableValues="0 0 0.35 1 1 1 1 1 1 1"/></feComponentTransfer><feMorphology in="thresh" operator="dilate" radius="2.4" result="dilated"/><feGaussianBlur in="dilated" stdDeviation="0.55" result="soft"/><feFlood flood-color="#7beeff" result="cyan"/><feComposite in="cyan" in2="soft" operator="in" result="outline"/><feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge></filter><clipPath id="p3r-mk-headcrop"><polygon points="0,0 148,0 148,96 28,136 0,136"/></clipPath></defs><g filter="url(#p3r-mk-rim)"><g clip-path="url(#p3r-mk-headcrop)"><image href="/p3r-skin/makoto-avatar.png?v=1" x="14" y="4" width="108" height="119" preserveAspectRatio="xMidYMid meet"/></g><g transform="translate(80 121) rotate(-19.8)"><rect x="-56" y="-14.5" width="112" height="29" rx="2.5" fill="#0d5ad0" stroke="#7beeff" stroke-width="2"/><polygon class="p3r-mk-hp" points="-47,-8 39,-8 35,-1.5 -51,-1.5" fill="#3cf2ff"/><polygon class="p3r-mk-sp" points="-37,1.5 49,1.5 45,8 -41,8" fill="#f4d81c"/></g></g></svg>' +
      "</button>";

    document.body.appendChild(dock);

    walletEl = document.createElement("div");
    walletEl.id = "p3r-dsh-wallet";
    walletEl.setAttribute("role", "button");
    walletEl.setAttribute("tabindex", "0");
    walletEl.title = tr("walletDefaultTitle");
    walletEl.innerHTML =
      '<div class="p3r-wallet-card">' +
      '  <div class="p3r-wallet-top">' +
      '    <span class="p3r-wallet-cur">¥</span>' +
      '    <span class="p3r-wallet-amt">--.--</span>' +
      "  </div>" +
      '  <div class="p3r-wallet-sub">current wallet</div>' +
      "</div>";
    document.body.appendChild(walletEl);
    walletCurEl = walletEl.querySelector(".p3r-wallet-cur");
    walletAmtEl = walletEl.querySelector(".p3r-wallet-amt");
    makeWidgetDraggable(walletEl, walletEl, "wallet");
    walletEl.addEventListener("click", function () {
      fetchWalletBalance(true);
    });
    walletEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fetchWalletBalance(true);
      }
    });

    installButtonFxEngine();
    ensureP3rBrandLockup();
    fetchWalletBalance(false);
    if (!walletTimer) {
      walletTimer = setInterval(function () {
        if (cfg.enabled && !document.hidden) fetchWalletBalance(false);
      }, 45000);
    }

    var card = document.getElementById("p3r-dsh-card");
    var pill = document.getElementById("p3r-dsh-pill");
    var chkEnabled = document.getElementById("p3r-chk-enabled");
    var chkChatGlass = document.getElementById("p3r-chk-chat-glass");
    var chkChatScrim = document.getElementById("p3r-chk-chat-scrim");
    var chkSidebarGlass = document.getElementById("p3r-chk-sidebar-glass");
    var chkSidebarScrim = document.getElementById("p3r-chk-sidebar-scrim");
    var chkBtnFx = document.getElementById("p3r-chk-btn-fx");
    var chkBtnSfx = document.getElementById("p3r-chk-btn-sfx");
    var rngAlpha = document.getElementById("p3r-rng-alpha");
    var alphaVal = document.getElementById("p3r-alpha-val");
    var rngBlur = document.getElementById("p3r-rng-blur");
    var blurVal = document.getElementById("p3r-blur-val");
    var btnPeek = document.getElementById("p3r-btn-peek");
    var btnPeekLabel = btnPeek.querySelector("span") || btnPeek;
    var btnReplay = document.getElementById("p3r-btn-replay");
    var btnResetPos = document.getElementById("p3r-btn-reset-pos");
    var btnClose = document.getElementById("p3r-btn-close");

    chkEnabled.checked = cfg.enabled;
    chkChatGlass.checked = cfg.chatGlass;
    chkChatScrim.checked = cfg.chatScrim;
    chkSidebarGlass.checked = cfg.sidebarGlass;
    chkSidebarScrim.checked = cfg.sidebarScrim;
    chkBtnFx.checked = cfg.btnFx;
    chkBtnSfx.checked = cfg.btnSfx;
    rngAlpha.value = String(cfg.panelAlpha);
    alphaVal.textContent = formatAlphaText(cfg.panelAlpha);
    rngBlur.value = String(cfg.blurPx);
    blurVal.textContent = cfg.blurPx + "px";

    makeWidgetDraggable(pill, dock, "dock");

    pill.addEventListener("click", function () {
      cfg.dockExpanded = !cfg.dockExpanded;
      card.classList.toggle("open", cfg.dockExpanded);
      pill.classList.toggle("p3r-open", cfg.dockExpanded);
    });

    btnResetPos.addEventListener("click", function () {
      customPos.dock = null;
      customPos.wallet = null;
      saveCustomPos();
      positionOverlayWidgets();
    });

    btnClose.addEventListener("click", function () {
      cfg.dockExpanded = false;
      card.classList.remove("open");
      pill.classList.remove("p3r-open");
    });

    chkEnabled.addEventListener("change", function () {
      cfg.enabled = chkEnabled.checked;
      saveCfg();
      syncStateToDom();
    });

    chkChatGlass.addEventListener("change", function () {
      cfg.chatGlass = chkChatGlass.checked;
      saveCfg();
      syncGlassCssVars();
      scheduleGlassPass();
    });

    chkChatScrim.addEventListener("change", function () {
      cfg.chatScrim = chkChatScrim.checked;
      saveCfg();
      syncGlassCssVars();
    });

    chkSidebarGlass.addEventListener("change", function () {
      cfg.sidebarGlass = chkSidebarGlass.checked;
      saveCfg();
      syncGlassCssVars();
      scheduleGlassPass();
    });

    chkSidebarScrim.addEventListener("change", function () {
      cfg.sidebarScrim = chkSidebarScrim.checked;
      saveCfg();
      syncGlassCssVars();
    });

    chkBtnFx.addEventListener("change", function () {
      cfg.btnFx = chkBtnFx.checked;
      saveCfg();
      syncStateToDom();
    });

    chkBtnSfx.addEventListener("change", function () {
      cfg.btnSfx = chkBtnSfx.checked;
      saveCfg();
      if (cfg.btnSfx) playP3rTone("toggle");
    });

    rngAlpha.addEventListener("input", function () {
      cfg.panelAlpha = parseFloat(rngAlpha.value);
      alphaVal.textContent = formatAlphaText(cfg.panelAlpha);
      saveCfg();
      syncGlassCssVars();
    });

    rngBlur.addEventListener("input", function () {
      cfg.blurPx = parseInt(rngBlur.value, 10) || 0;
      blurVal.textContent = cfg.blurPx + "px";
      saveCfg();
      syncGlassCssVars();
    });

    btnPeek.addEventListener("click", function () {
      cfg.peek = !cfg.peek;
      btnPeekLabel.textContent = tr(cfg.peek ? "restore" : "peek");
      syncStateToDom();
    });

    btnReplay.addEventListener("click", function () {
      if (!cfg.enabled) {
        cfg.enabled = true;
        chkEnabled.checked = true;
        saveCfg();
        syncStateToDom();
      }
      playIntroSequence();
    });

    window.addEventListener("p3r-dsh-locale-change", function () {
      applyI18n(false);
    });

    initVideoLifecycle();
    syncStateToDom();
    applyI18n(true);

    var resizeRaf = 0;
    window.addEventListener("resize", function () {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function () {
        resizeRaf = 0;
        if (!isFrameAnimating()) positionOverlayWidgets();
        scheduleGlassPass(false);
      });
    });

    var observer = new MutationObserver(function (mutations) {
      if (applyingGlassPass) return;
      var needsPass = false;
      var animEnded = false;
      var localeDirty = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === "attributes") {
          if (m.target === document.documentElement || m.target === document.body) {
            detectedDark = detectThemeDark();
            syncGlassCssVars();
            if (m.attributeName === "lang") localeDirty = true;
          } else if (m.attributeName === "data-animating") {
            if (!m.target.hasAttribute("data-animating")) animEnded = true;
          }
          continue;
        }
        if ((m.addedNodes && m.addedNodes.length > 0) || m.type === "characterData") {
          var mt = m.target && m.target.nodeType === 3 ? m.target.parentElement : m.target;
          if (mt && mt.closest && (mt.closest("#p3r-dsh-dock") || mt.closest("#p3r-fx-layer") || mt.closest("#p3r-dsh-wallet") || mt.closest("#p3r-dsh-stage") || mt.closest("[data-p3r-brand]"))) continue;
          needsPass = true;
          localeDirty = true;
        }
      }
      if (localeDirty) applyI18n(false);
      if (animEnded) {
        if (glassTimer) {
          clearTimeout(glassTimer);
          glassTimer = 0;
        }
        scheduleGlassPass(false);
      } else if (needsPass) {
        if (cfg.enabled && isFrameAnimating()) ensureP3rBrandLockup();
        scheduleGlassPass(false);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-ds-theme-source", "lang"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-ds-dark-theme", "data-animating"],
      childList: true,
      characterData: true,
      subtree: true,
    });
    setTimeout(scheduleGlassPass, 350);
    setTimeout(scheduleGlassPass, 1300);
  }

  function bootstrap() {
    if (document.body) {
      mountDom();
    } else {
      requestAnimationFrame(bootstrap);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
