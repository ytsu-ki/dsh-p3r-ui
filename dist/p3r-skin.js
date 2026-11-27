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
  var MAX_PANEL_ALPHA = 0.92;
  var MAX_BLUR_PX = 24;

  var customPos = { dock: null, wallet: null, moon: null };
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
        if (parsedPos.moon && typeof parsedPos.moon.left === "number" && typeof parsedPos.moon.top === "number") {
          customPos.moon = { left: Math.round(parsedPos.moon.left), top: Math.round(parsedPos.moon.top) };
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
    watermark: true,
    moonHud: true,
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
        if (typeof parsed.watermark === "boolean") cfg.watermark = parsed.watermark;
        if (typeof parsed.moonHud === "boolean") cfg.moonHud = parsed.moonHud;
        if (typeof parsed.panelAlpha === "number" && isFinite(parsed.panelAlpha)) {
          cfg.panelAlpha = Math.max(0, Math.min(MAX_PANEL_ALPHA, parsed.panelAlpha));
        }
        if (typeof parsed.blurPx === "number" && isFinite(parsed.blurPx)) {
          cfg.blurPx = Math.max(0, Math.min(MAX_BLUR_PX, Math.round(parsed.blurPx)));
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
          watermark: cfg.watermark,
          moonHud: cfg.moonHud,
          panelAlpha: cfg.panelAlpha,
          blurPx: cfg.blurPx,
        })
      );
    } catch (e) {}
  }

  /* ========================================================================
     STYLESHEET INJECTION — P3R RELOAD SIGNATURE (A2 + M1 + G2)
     Zero red-on-blue chromostereopsis: crimson (#ff175a) is strictly white/ink buffered.
     ======================================================================== */
  var CSS_TEXT = [
    ":root{--p3r-ink:#070c1c;--p3r-cobalt:#0628d8;--p3r-cobalt-hi:#0d4dff;--p3r-cyan:#3cf2ff;--p3r-cyan-soft:#8df5ff;--p3r-white:#ffffff;--p3r-sp-yellow:#f4e818;--p3r-crimson-edge:#ff175a;--p3r-crimson-ghost:rgba(255,23,90,0.72);--p3r-danger:#e6193c}",
    "#p3r-dsh-stage{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;-webkit-app-region:initial!important;app-region:initial!important;",
    "background:linear-gradient(180deg,#42c9fd 0%,#029eeb 34%,#002ea8 75%,#00188c 100%);transition:opacity .32s ease}",
    "#p3r-dsh-stage *{-webkit-app-region:initial!important;app-region:initial!important}",
    "#p3r-dsh-stage.p3r-off{opacity:0;visibility:hidden}",
    ".p3r-dsh-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:left center;pointer-events:none;user-select:none}",
    "#p3r-vid-loop{z-index:1;opacity:1}",
    "#p3r-vid-intro{z-index:2;opacity:1;display:none;transition:opacity .26s ease}",
    "#p3r-dsh-watermark{position:fixed;inset:0;z-index:2;pointer-events:none;overflow:hidden;opacity:0;visibility:hidden;mix-blend-mode:screen;transition:opacity .28s ease;-webkit-app-region:initial!important;app-region:initial!important}",
    "html.p3r-skin-on.p3r-wm-on:not(.p3r-peek):not(.p3r-modal-open) #p3r-dsh-watermark{opacity:1;visibility:visible}",
    ".p3r-wm-slash{position:absolute;right:14%;top:-40px;width:190px;height:130vh;background:linear-gradient(180deg,rgba(60,242,255,0.085) 0%,rgba(255,255,255,0.03) 52%,rgba(6,40,216,0.06) 100%);border-left:1.5px solid rgba(141,245,255,0.18);transform:skewX(-18deg);pointer-events:none}",
    ".p3r-wm-word{position:absolute;right:-24px;bottom:56px;font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif;font-size:clamp(92px,11.5vw,176px);font-weight:900;font-style:italic;letter-spacing:.04em;line-height:0.86;color:transparent;-webkit-text-stroke:2px rgba(255,255,255,0.15);transform:rotate(-7deg) skewX(-8deg);user-select:none;pointer-events:none}",
    "html.p3r-skin-on,html.p3r-skin-on body{background:transparent!important;background-color:transparent!important;background-image:none!important}",
    "html.p3r-skin-on body{--dsw-specific-sidebar-fill:transparent!important;--dsw-specific-sidebar-tint:transparent!important;--dsw-specific-sidebar-wash-top:transparent!important;--dsw-specific-sidebar-wash-bottom:transparent!important}",
    "html.p3r-skin-on #root [class*='_centerCol'] [data-phase],html.p3r-skin-on #root [class*='_centerCol'] [class*='_scrollBody'],html.p3r-skin-on #root [class*='_centerCol'] [class*='_viewArea']{background:transparent!important;background-color:transparent!important}",
    "html.p3r-skin-on [class*='_overlay']>[class*='_mask'],html.p3r-skin-on [class*='_backdrop']>[class*='_mask'],html.p3r-skin-on body>div>[class*='_mask']{background:rgba(2,8,30,0.74)!important;backdrop-filter:blur(18px) saturate(1.1)!important;-webkit-backdrop-filter:blur(18px) saturate(1.1)!important}",
    "html.p3r-skin-on [class*='_overlay']>[class*='_mask']::after,html.p3r-skin-on [class*='_backdrop']>[class*='_mask']::after{background:rgba(2,8,30,0.52)!important}",
    "html.p3r-skin-on body[data-ds-dark-theme] [role='dialog']:not(#p3r-dsh-card),html.p3r-skin-on body[data-ds-dark-theme] [role='alertdialog']{--dsw-alias-bg-base:#07123c;--dsw-alias-bg-layer-1:#0b1b56;--dsw-alias-bg-layer-2:#081544;--dsw-alias-bg-layer-3:#10246b;--dsw-alias-bg-layer-4:#163082;--dsw-alias-settings-card-fill:rgba(13,30,88,0.95);--dsw-alias-settings-card-stroke:rgba(60,242,255,0.32);--dsw-alias-card-fill:rgba(13,30,88,0.95);--dsw-alias-card-fill-hover:rgba(20,44,120,0.96);--dsw-alias-label-primary:#f2f7ff;--dsw-alias-label-secondary:#c8dcff;--dsw-alias-label-tertiary:#96b8ec;--dsw-alias-label-caption:#7fa7e2;--dsw-alias-border-l1:rgba(102,182,255,0.16);--dsw-alias-border-l2:rgba(102,182,255,0.24);--dsw-alias-border-l3:rgba(102,182,255,0.34);--dsw-alias-border-l4:rgba(120,200,255,0.44);--dsw-specific-sidebar-nav-item-active:rgba(26,86,232,0.38);--dsw-alias-interactive-bg-hover:rgba(60,242,255,0.16);--dsw-alias-interactive-bg-active:rgba(26,86,232,0.44);background:linear-gradient(162deg,rgba(8,21,66,0.98) 0%,rgba(4,12,40,0.99) 100%)!important;background-color:#081544!important;border:1.5px solid rgba(60,242,255,0.62)!important;border-left:4px solid #ffffff!important;border-radius:0!important;box-shadow:8px 8px 0 rgba(7,12,28,0.88),0 24px 64px rgba(0,6,32,0.86)!important;color:#f2f7ff!important}",
    "html.p3r-skin-on body:not([data-ds-dark-theme]) [role='dialog']:not(#p3r-dsh-card),html.p3r-skin-on body:not([data-ds-dark-theme]) [role='alertdialog']{background:rgba(250,252,255,0.985)!important;background-color:#fafcff!important;border:1.5px solid #070c1c!important;border-left:4px solid #0628d8!important;border-top:2.5px solid #ff175a!important;border-radius:0!important;box-shadow:8px 8px 0 rgba(7,12,28,0.26),0 24px 64px rgba(0,12,56,0.32)!important}",
    "html.p3r-skin-on.p3r-modal-open #p3r-dsh-wallet,html.p3r-skin-on.p3r-modal-open #p3r-dsh-moon{z-index:900!important;opacity:0.15!important;pointer-events:none!important}",
    "html.p3r-skin-on.p3r-modal-open #p3r-dsh-dock:not(:has(#p3r-dsh-card.open)){z-index:910!important;opacity:0.35!important}",
    "html.p3r-skin-on #root,html.p3r-skin-on #app{position:relative;z-index:1;background:transparent!important;background-color:transparent!important;background-image:none!important;transition:opacity .25s ease}",
    "html.p3r-skin-on.p3r-peek #root,html.p3r-skin-on.p3r-peek #app{opacity:0.06!important;pointer-events:none!important}",
    "html.p3r-skin-on [class$='_frame'],html.p3r-skin-on [class*='_frame '],html.p3r-skin-on [class*='_frame_'],html.p3r-skin-on [class$='_mainPanel'],html.p3r-skin-on [class*='_mainPanel '],html.p3r-skin-on [class*='_mainPanel_']{background:transparent!important;background-color:transparent!important}",
    "html.p3r-skin-on [class$='_frame']:before,html.p3r-skin-on [class*='_frame ']:before,html.p3r-skin-on [class*='_frame_']:before{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [class$='_sidebarCol'],html.p3r-skin-on [class*='_sidebarCol '],html.p3r-skin-on [class*='_sidebarCol_']{position:relative;background-color:var(--p3r-sidebar-bg,transparent)!important;background-image:var(--p3r-sidebar-scrim,none)!important;backdrop-filter:var(--p3r-sidebar-blur,none)!important;-webkit-backdrop-filter:var(--p3r-sidebar-blur,none)!important;border-color:var(--p3r-sidebar-border,transparent)!important}",
    "html.p3r-skin-on [class$='_sidebarCol']::after,html.p3r-skin-on [class*='_sidebarCol ']::after,html.p3r-skin-on [class*='_sidebarCol_']::after{content:'';position:absolute;right:0;top:0;bottom:0;width:2.5px;background:linear-gradient(180deg,#3cf2ff 0%,rgba(13,77,255,0.58) 52%,rgba(255,255,255,0.68) 100%);pointer-events:none;z-index:3}",
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
    "html.p3r-skin-on body[data-ds-dark-theme] [class*='_float_']{--dsw-alias-bg-base:#07123c;--dsw-alias-bg-layer-1:#0b1b56;--dsw-alias-bg-layer-2:#081544;--dsw-alias-card-fill:rgba(13,30,88,0.94);background:rgba(8,21,66,0.97)!important;border:1.5px solid rgba(60,242,255,0.56)!important;border-left:3.5px solid #ffffff!important;border-radius:0!important;color:#f2f7ff!important}",
    "html.p3r-skin-on body:not([data-ds-dark-theme]) [class*='_float_']{background:rgba(250,252,255,0.98)!important;border:1.5px solid rgba(7,12,28,0.34)!important;border-left:3.5px solid #0628d8!important;border-radius:0!important}",
    "html.p3r-skin-on.p3r-chat-scrim body{--dsw-specific-bubble:rgba(6,32,128,0.74)!important;--dsw-specific-bubble-highlight:rgba(12,50,168,0.84)!important;--dsw-alias-bg-document-preview:rgba(3,16,68,0.84)!important;--dsw-alias-turn-trigger-bg:rgba(6,28,118,0.54)!important;--dsw-alias-turn-trigger-bg-hover:rgba(10,42,152,0.74)!important;--dsw-alias-brand-text:#f8fbff!important;--dsw-alias-hovercard-label-secondary:#e4efff!important;--dsw-alias-hovercard-label-tertiary:#c8dcff!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol']{color:#f4f8ff!important}",
    "html.p3r-skin-on header[class*='_header']{border-bottom:1.5px solid rgba(123,238,255,0.28)!important;background:linear-gradient(90deg,rgba(3,18,94,0.46) 0%,rgba(4,24,118,0.18) 65%,transparent 100%)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_titleCluster'],html.p3r-skin-on [class*='_root'] [class*='_titleCluster']{padding:8px 12px!important;margin:-8px -12px!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_crumbs'],html.p3r-skin-on [class*='_centerCol'] [class*='_crumbSeg'],html.p3r-skin-on [class*='_root'] [class*='_crumbs'],html.p3r-skin-on [class*='_root'] [class*='_crumbSeg']{overflow:visible!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_headline'],html.p3r-skin-on [class*='_centerCol'] [class*='_titleGroup'],html.p3r-skin-on [class*='_centerCol'] [class*='_crumb'],html.p3r-skin-on [class*='_centerCol'] [class*='_crumbCurrent'],html.p3r-skin-on [class*='_centerCol'] [class*='_crumbSep'],html.p3r-skin-on :is([class*='_centerCol'],[class*='_root']) header [class*='_titleRow'] :is(span,a,div,h1,h2,h3):not([class*='_previewBadge']):not([class*='_headerUtilities']):not([class*='_headerUtilities'] *):not(button *),html.p3r-skin-on :is([class*='_centerCol'],[class*='_root']) header :is([class*='_titleCluster'],[class*='_titleGroup'],[class*='_crumbs'],[class*='_crumbSeg']) button:not([class*='_headerUtilities'] *),html.p3r-skin-on [class*='_root'] [class*='_crumb'],html.p3r-skin-on [class*='_root'] [class*='_crumbCurrent']{color:#ffffff!important;font-family:'Futura','Impact','Arial Black','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;font-weight:900!important;font-style:italic!important;letter-spacing:.02em!important;text-shadow:-0.5px -0.5px 0 rgba(4,19,110,0.48),0.5px -0.5px 0 rgba(4,19,110,0.36),-0.5px 0.5px 0 rgba(4,19,110,0.48),1.5px 2px 0 #04136e,2.2px 2.8px 0 #04136e,0 0 8px rgba(4,19,110,0.58)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_fish'],html.p3r-skin-on [class*='_root'] [class*='_fish']{color:#ffffff!important;filter:drop-shadow(1.5px 2px 0 #04136e) drop-shadow(0 0 6px rgba(4,19,110,0.55))!important}",
    "html.p3r-skin-on :is([class*='_centerCol'],[class*='_root']) :is([class*='_titleCluster'],[class*='_titleGroup'],[class*='_crumbs'],[class*='_crumb']) svg:not([class*='_headerUtilities'] *){color:#ffffff!important;overflow:visible!important;filter:drop-shadow(1.5px 2px 0 #04136e) drop-shadow(0 0 6px rgba(4,19,110,0.55))!important}",
    "html.p3r-skin-on :is([class*='_centerCol'],[class*='_root']) header :is([class*='_titleCluster'],[class*='_titleGroup'],[class*='_crumbs'],[class*='_crumbSeg']) button:not([class*='_headerUtilities'] *){background:transparent!important;border:none!important;box-shadow:none!important;overflow:visible!important}",
    "html.p3r-skin-on :is([class*='_centerCol'],[class*='_root']) header :is([class*='_titleCluster'],[class*='_titleGroup'],[class*='_crumbs'],[class*='_crumbSeg']) button:not([class*='_headerUtilities'] *):hover{color:#3cf2ff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_previewBadge']{background:#070c1c!important;border:1.5px solid #3cf2ff!important;color:#ffffff!important;border-radius:0!important;clip-path:polygon(7px 0,100% 0,calc(100% - 7px) 100%,0 100%);padding-left:10px!important;padding-right:10px!important;font-style:italic;font-weight:900;text-shadow:none!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_heroWorkspaceRow'] button{background:rgba(7,12,28,0.88)!important;border:1.5px solid rgba(100,194,255,0.52)!important;border-left:3px solid #3cf2ff!important;color:#f4f8ff!important;border-radius:0!important;box-shadow:3px 3px 0 rgba(7,12,28,0.68);font-weight:800;font-style:italic}",
    "html.p3r-skin-on :is([class*='_centerCol'],[class*='_root']) header :is([class*='_headerUtilities'] button:not([class*='_primary']),button:not([class*='_primary']):not([class*='_crumb']):not([class*='_titleCluster'] *):not([class*='_titleGroup'] *):not([class*='_crumbs'] *):not([class*='_crumbSeg'] *):is(:has(>svg:only-child),:has(>span:only-child>svg:only-child))){background:rgba(7,12,28,0.86)!important;border:1.5px solid rgba(100,194,255,0.62)!important;color:#f4f8ff!important;border-radius:0!important;box-shadow:2px 2px 0 rgba(7,12,28,0.72)!important;margin:0!important;text-shadow:none!important;font-style:normal!important;font-weight:800}",
    "html.p3r-skin-on :is([class*='_centerCol'],[class*='_root']) header :is([class*='_headerUtilities'] button:not([class*='_primary']),button:not([class*='_primary']):not([class*='_crumb']):not([class*='_titleCluster'] *):not([class*='_titleGroup'] *):not([class*='_crumbs'] *):not([class*='_crumbSeg'] *):is(:has(>svg:only-child),:has(>span:only-child>svg:only-child))) svg{color:currentColor!important;filter:none!important}",
    "html.p3r-skin-on #root :is([class*='_centerCol'],[class*='_root']) header :is([class*='_headerUtilities'] button:not([class*='_primary']),button:not([class*='_primary']):not([class*='_crumb']):not([class*='_titleCluster'] *):not([class*='_titleGroup'] *):not([class*='_crumbs'] *):not([class*='_crumbSeg'] *):is(:has(>svg:only-child),:has(>span:only-child>svg:only-child))):hover{background:#ffffff!important;color:#061cc4!important;border-color:#070c1c!important;box-shadow:inset 0 2px 0 #ff175a,2px 2px 0 #070c1c!important}",
    "html.p3r-skin-on [class*='_scrollBody'] [class*='_viewArea']{padding-bottom:22px!important}",
    "html.p3r-skin-on [class*='_composerSeat']{--dsw-alias-label-primary:#f4f8ff;--dsw-alias-label-secondary:#e2eeff;--dsw-alias-label-tertiary:#b8d4ff;--dsw-alias-label-caption:#9ee8ff;z-index:28!important;padding-top:10px!important;background:linear-gradient(180deg,rgba(4,16,70,0) 0%,rgba(4,16,70,0.22) 55%,rgba(3,12,56,0.42) 100%)!important;background-color:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [class*='_composerHero']{--dsw-alias-label-primary:#f4f8ff;--dsw-alias-label-secondary:#e2eeff;--dsw-alias-label-tertiary:#b8d4ff;--dsw-alias-label-caption:#9ee8ff}",
    "html.p3r-skin-on [class*='_composerStack']{background:transparent!important;background-color:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "html.p3r-skin-on [class*='_composerStack']>div[class*='_card'],html.p3r-skin-on [class*='_composerHero'] div[class*='_card'],html.p3r-skin-on [class*='_composerSeat'] div[class*='_card']:not([class*='_overlayAnchor'] *){position:relative;z-index:2;border-radius:0!important;background:linear-gradient(155deg,rgba(4,15,66,0.90) 0%,rgba(7,25,100,0.86) 100%)!important;background-color:rgba(4,15,66,0.88)!important;border:1.5px solid rgba(102,210,255,0.62)!important;border-top:2.5px solid #3cf2ff!important;border-left:4px solid #ffffff!important;box-shadow:6px 6px 0 rgba(7,12,28,0.82),0 10px 28px rgba(0,10,56,0.42),inset 0 1px 0 rgba(164,226,255,0.24)!important;backdrop-filter:blur(18px) saturate(1.14)!important;-webkit-backdrop-filter:blur(18px) saturate(1.14)!important;transition:border-color .16s ease,box-shadow .16s ease}",
    "html.p3r-skin-on [class*='_composerStack']>div[class*='_card']:focus-within,html.p3r-skin-on [class*='_composerHero'] div[class*='_card']:focus-within,html.p3r-skin-on [class*='_composerSeat'] div[class*='_card']:not([class*='_overlayAnchor'] *):focus-within{border-color:#ffffff!important;border-top-color:#f4e818!important;box-shadow:7px 7px 0 rgba(7,12,28,0.90),0 0 20px rgba(60,242,255,0.22)!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_overlayAnchor']>*,html.p3r-skin-on [class*='_composerHero'] [class*='_overlayAnchor']>*{--dsw-alias-bg-layer-1:rgba(6,20,72,0.97);--dsw-alias-bg-layer-2:rgba(6,20,72,0.97);--dsw-alias-label-primary:#f0f6ff;--dsw-alias-label-secondary:#cbe0ff;--dsw-alias-label-tertiary:#9dc2f5;--dsw-alias-interactive-bg-hover:rgba(60,242,255,0.20);background:linear-gradient(162deg,rgba(6,20,72,0.97) 0%,rgba(4,11,40,0.98) 100%)!important;background-color:#061448!important;border:2px solid #070c1c!important;border-left:4px solid #3cf2ff!important;border-top:2px solid #ffffff!important;border-radius:0!important;color:#f0f6ff!important;box-shadow:6px 6px 0 rgba(7,12,28,0.88),0 18px 40px rgba(0,10,48,0.58)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_card'] :is(textarea,[contenteditable='true'],.cm-editor,.cm-content,.cm-line,.cm-line *,.cm-placeholder,[class*='_placeholder']),html.p3r-skin-on [class*='_composerHero'] [class*='_card'] :is(textarea,[contenteditable='true'],.cm-editor,.cm-content,.cm-line,.cm-line *,.cm-placeholder,[class*='_placeholder']){font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;font-weight:800!important;font-style:italic!important;letter-spacing:.02em!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_card'] :is(textarea,[contenteditable='true'],.cm-editor,.cm-content,.cm-line),html.p3r-skin-on [class*='_composerHero'] [class*='_card'] :is(textarea,[contenteditable='true'],.cm-editor,.cm-content,.cm-line){color:#ffffff!important;caret-color:#f4e818!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_card'] :is(.cm-placeholder,[class*='_placeholder']),html.p3r-skin-on [class*='_composerSeat'] [class*='_card'] textarea::placeholder,html.p3r-skin-on [class*='_composerHero'] [class*='_card'] :is(.cm-placeholder,[class*='_placeholder']),html.p3r-skin-on [class*='_composerHero'] [class*='_card'] textarea::placeholder{color:rgba(218,236,255,0.88)!important;text-shadow:0 1px 2px rgba(0,8,40,0.65)!important}",
    "html.p3r-skin-on [class*='_composerSeat'] button,html.p3r-skin-on [class*='_composerSeat'] button *,html.p3r-skin-on [class*='_composerHero'] button,html.p3r-skin-on [class*='_composerHero'] button *,html.p3r-skin-on [class*='_composerSeat'] [class*='_dock'],html.p3r-skin-on [class*='_composerSeat'] [class*='_dock'] *,html.p3r-skin-on [class*='_composerHero'] [class*='_dock'],html.p3r-skin-on [class*='_composerHero'] [class*='_dock'] *{font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;font-weight:800!important;font-style:italic!important;letter-spacing:.02em!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort'],html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort']{position:relative;display:inline-flex!important;align-items:center;gap:3px;margin-left:4px;padding:1px 6px 3px;border:1px solid rgba(60,242,255,0.48);border-left:2.5px solid #3cf2ff;border-radius:0!important;background:rgba(7,20,76,0.78);color:#8df5ff!important;font-family:'Futura','Impact','PingFang SC','Microsoft YaHei',sans-serif!important;font-weight:900!important;font-style:italic!important;letter-spacing:.03em;text-shadow:none!important;cursor:ew-resize;transform:none!important;transition:background .14s ease,color .14s ease,border-color .14s ease,box-shadow .14s ease}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort']::before,html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort']::before{content:'‹';font-style:normal;font-weight:900;font-size:11px;line-height:1;opacity:0.62;transition:transform .14s ease,opacity .14s ease}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort']::after,html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort']::after{content:'›';font-style:normal;font-weight:900;font-size:11px;line-height:1;opacity:0.62;transition:transform .14s ease,opacity .14s ease}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort']:hover::before,html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort']:hover::before{opacity:1;transform:translateX(-1.5px)}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort']:hover::after,html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort']:hover::after{opacity:1;transform:translateX(1.5px)}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort']:hover,html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort']:hover{box-shadow:0 0 0 1.5px #3cf2ff!important}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort'][data-p3r-effort-tier='0'],html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort'][data-p3r-effort-tier='0']{border-color:rgba(141,245,255,0.45);border-left-color:#8df5ff;color:#b8f4ff!important;background:linear-gradient(90deg,rgba(141,245,255,0.85) 0 24%,rgba(141,245,255,0.16) 24% 100%) bottom/100% 2px no-repeat,rgba(10,32,96,0.72)}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort'][data-p3r-effort-tier='1'],html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort'][data-p3r-effort-tier='1']{border-color:rgba(60,242,255,0.58);border-left-color:#3cf2ff;color:#3cf2ff!important;background:linear-gradient(90deg,#3cf2ff 0 50%,rgba(60,242,255,0.18) 50% 100%) bottom/100% 2px no-repeat,rgba(6,34,116,0.80)}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort'][data-p3r-effort-tier='2'],html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort'][data-p3r-effort-tier='2']{border-color:rgba(244,232,24,0.68);border-left-color:#f4e818;color:#f4e818!important;background:linear-gradient(90deg,#3cf2ff 0%,#f4e818 76%,rgba(244,232,24,0.18) 76% 100%) bottom/100% 2px no-repeat,rgba(14,22,58,0.90)}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_triggerEffort'][data-p3r-effort-tier='3'],html.p3r-skin-on [class*='_composerHero'] [class*='_triggerEffort'][data-p3r-effort-tier='3']{border:1px solid #070c1c;border-top:2px solid #ff175a;border-left:3px solid #061cc4;background:linear-gradient(90deg,#3cf2ff 0%,#f4e818 60%,#ff175a 100%) bottom/100% 2px no-repeat,#ffffff!important;color:#061cc4!important;text-shadow:none!important;box-shadow:2px 2px 0 #070c1c}",
    "html.p3r-skin-on [class*='_triggerEffort'].p3r-effort-pulse{animation:p3rEffortPulse .28s cubic-bezier(0.16,1,0.3,1)}",
    "@keyframes p3rEffortPulse{0%{transform:scale(1)}40%{transform:scale(1.14)}100%{transform:scale(1)}}",
    "html.p3r-skin-on [class*='_composerSeat'] [class*='_dock'],html.p3r-skin-on [class*='_composerSeat'] [class*='_dock'] *,html.p3r-skin-on [class*='_composerHero'] [class*='_dock'],html.p3r-skin-on [class*='_composerHero'] [class*='_dock'] *{color:#e6f2ff!important;text-shadow:0 1px 3px rgba(0,8,38,0.75)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [data-p3r-region='session-card'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_changedFiles'] [class*='_card'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_ApprovalPanel'] [class*='_card'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_fileCard']{--dsw-alias-label-primary:#f4f8ff;--dsw-alias-label-secondary:#d4e6ff;--dsw-alias-label-tertiary:#a6c4f0;background:linear-gradient(155deg,rgba(4,16,68,0.86) 0%,rgba(7,26,102,0.80) 100%)!important;border:1.5px solid rgba(94,186,255,0.52)!important;border-left:3.5px solid #3cf2ff!important;border-radius:0!important;color:#f4f8ff!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_modes'] button,html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_trailing'] button[class*='_trigger']{background:#070c1c!important;border:1.5px solid rgba(100,190,255,0.50)!important;color:#eef6ff!important;border-radius:0!important;clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_modes'] button:hover,html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_trailing'] button[class*='_trigger']:hover{background:#ffffff!important;color:#061cc4!important;border-color:#070c1c!important;box-shadow:inset 0 2.5px 0 #ff175a!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_modes'] button:hover *,html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_trailing'] button[class*='_trigger']:hover *:not([class*='_triggerEffort']){color:#061cc4!important;text-shadow:none!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] button[class*='_add']{background:#0628d8!important;border:1.5px solid #3cf2ff!important;color:#ffffff!important;border-radius:0!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] button[class*='_primary']{background:#3cf2ff!important;border:1.5px solid #070c1c!important;color:#070c1c!important;border-radius:0!important;clip-path:polygon(7px 0,100% 0,calc(100% - 7px) 100%,0 100%);box-shadow:3px 3px 0 #070c1c}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] button[class*='_primary'] *{color:#070c1c!important;text-shadow:none!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] button[class*='_primary']:hover{background:#ffffff!important;color:#061cc4!important;border-color:#070c1c!important;box-shadow:inset 0 2.5px 0 #ff175a,3px 3px 0 #070c1c!important}",
    "html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] button[class*='_primary']:hover *{color:#061cc4!important}",
    "html.p3r-skin-on [data-p3r-bubble='assistant'] :is(p,li,h1,h2,h3,h4,h5,h6,strong,em,blockquote,td,th),html.p3r-skin-on.p3r-chat-scrim [class*='_centerCol'] [class*='_scrollBody'] :is(p,li,h1,h2,h3,h4,blockquote,td,th){color:#f4f8ff!important;text-shadow:0 1px 3px rgba(0,10,56,0.48)}",
    "html.p3r-skin-on [data-p3r-bubble='user'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userStack'] [class*='_bubble']:not([data-portal]):not([role='tooltip']),html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userRow'] [class*='_bubble']:not([data-portal]):not([role='tooltip']){--dsw-alias-label-primary:#f8fbff;--dsw-alias-label-secondary:#dcebff;position:relative!important;z-index:1;overflow:visible!important;isolation:isolate;margin:10px 10px 16px 12px!important;padding:12px 20px!important;border-radius:0!important;background:linear-gradient(155deg,rgba(4,15,66,0.90) 0%,rgba(7,26,108,0.84) 100%)!important;background-color:rgba(4,15,66,0.88)!important;border:1.5px solid rgba(102,212,255,0.78)!important;border-right:4px solid #3cf2ff!important;color:#f8fbff!important;font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;font-weight:800!important;font-style:italic!important;letter-spacing:.02em!important;box-shadow:6px 6px 0 rgba(7,12,28,0.72),0 10px 26px rgba(0,8,52,0.48),inset 0 1px 0 rgba(164,226,255,0.22)!important;backdrop-filter:var(--p3r-session-blur,blur(14px))!important;-webkit-backdrop-filter:var(--p3r-session-blur,blur(14px))!important;text-shadow:0 1px 2px rgba(0,8,44,0.55)}",
    "html.p3r-skin-on [data-p3r-bubble='user']::before,html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userStack'] [class*='_bubble']:not([data-portal]):not([role='tooltip'])::before,html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userRow'] [class*='_bubble']:not([data-portal]):not([role='tooltip'])::before{content:'';position:absolute;top:-6px;left:-9px;right:12px;bottom:8px;border-top:2.5px solid #3cf2ff;border-left:2.5px solid #0d4dff;z-index:-1;pointer-events:none}",
    "html.p3r-skin-on [data-p3r-bubble='user']::after,html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userStack'] [class*='_bubble']:not([data-portal]):not([role='tooltip'])::after,html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_userRow'] [class*='_bubble']:not([data-portal]):not([role='tooltip'])::after{content:'';position:absolute;right:14px;bottom:-11px;width:22px;height:12px;background:linear-gradient(180deg,#3cf2ff 0%,#0628d8 100%);clip-path:polygon(0 0,100% 0,84% 100%);pointer-events:none;z-index:1}",
    "html.p3r-skin-on [data-p3r-bubble='user'] *:not(code):not(pre):not(kbd){color:#f8fbff!important;font-weight:800!important;font-style:italic!important}",
    "html.p3r-skin-on [data-p3r-bubble='assistant']{--dsw-alias-label-primary:#f4f8ff;--dsw-alias-label-secondary:#d8e9ff;--dsw-alias-label-tertiary:#a8c7f5;--dsw-alias-label-caption:#90b4e8;position:relative!important;z-index:1;overflow:visible!important;isolation:isolate;margin:22px 8px 16px 12px!important;padding:22px 24px 18px!important;border-radius:0!important;background:linear-gradient(155deg,rgba(4,14,62,0.88) 0%,rgba(6,22,88,0.83) 100%)!important;background-color:rgba(4,14,62,0.85)!important;border:1.5px solid rgba(98,198,255,0.72)!important;border-left:4px solid #ffffff!important;color:#f4f8ff!important;box-shadow:7px 7px 0 rgba(7,12,28,0.72),0 12px 32px rgba(0,8,52,0.48),inset 0 1px 0 rgba(164,226,255,0.20)!important;backdrop-filter:var(--p3r-session-blur,blur(14px))!important;-webkit-backdrop-filter:var(--p3r-session-blur,blur(14px))!important}",
    "html.p3r-skin-on [data-p3r-bubble='assistant']::before{content:'';position:absolute;top:-6px;left:-10px;right:16px;bottom:8px;border-top:2.5px solid #3cf2ff;border-left:2.5px solid #0d4dff;z-index:-1;pointer-events:none}",
    "html.p3r-skin-on [data-p3r-bubble='assistant']::after{content:'DEEPSEEK  //  TALK';position:absolute;top:-15px;left:10px;padding:3px 20px 3px 18px;background:#ffffff;color:#0628d8;border-top:2.5px solid #ff175a;font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif;font-size:10.5px;font-weight:900;font-style:italic;letter-spacing:.11em;line-height:1.25;clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);box-shadow:4px 4px 0 #070c1c;pointer-events:none;z-index:2;transition:background .16s ease,color .16s ease}",
    "html.p3r-skin-on.p3r-streaming [data-p3r-bubble='assistant']:last-of-type::after{content:'DEEPSEEK  //  LIVE SYNC';background:#3cf2ff;color:#070c1c;border-top-color:#ffffff;animation:p3rTalkPulse .85s ease-in-out infinite alternate}",
    "@keyframes p3rTalkPulse{from{opacity:.92;transform:translateX(0)}to{opacity:1;transform:translateX(2px)}}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [data-chat-flow-kind='turn-process'] [data-disclosure-header]{background:rgba(7,12,28,0.76)!important;border:1px solid rgba(60,242,255,0.44)!important;border-left:3.5px solid #f4e818!important;border-radius:0!important;padding:3px 12px!important;color:#e6f4ff!important;clip-path:polygon(0 0,100% 0,calc(100% - 8px) 100%,0 100%);backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [data-open] [data-disclosure-header]{background:rgba(6,20,74,0.92)!important;color:#ffffff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_thinkBody']{margin:6px 0 8px 0!important;padding:8px 14px!important;border-left:2.5px solid #3cf2ff!important;background:rgba(2,10,52,0.78)!important;border-radius:0!important;color:#dceaff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_sourceCard'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_instructionsCard'],html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] div[class*='_message']{background:rgba(3,14,62,0.78)!important;border:1px solid rgba(60,242,255,0.44)!important;border-left:3px solid #3cf2ff!important;border-radius:0!important;color:#e8f2ff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] pre{background:rgba(2,9,44,0.90)!important;border:1px solid rgba(60,242,255,0.34)!important;border-left:3px solid #3cf2ff!important;border-radius:0!important;overflow-x:auto!important;color:#eaf3ff!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] [class*='_bannerWrap']{background:rgba(3,14,58,0.96)!important;color:#dceeff!important;border-bottom:1px solid rgba(60,242,255,0.30)!important}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] code:not(pre code){background:rgba(10,52,184,0.62)!important;border:1px solid rgba(123,238,255,0.38);border-radius:2px;color:#8df5ff!important;padding:1px 5px}",
    "html.p3r-skin-on [class*='_centerCol'] [class*='_scrollBody'] a{color:#66efff!important}",
    "html.p3r-skin-on.p3r-btn-fx [class*='_centerCol'] [data-chat-flow-kind='turn-tail'] button:hover,html.p3r-skin-on.p3r-btn-fx [class*='_centerCol'] [class*='_heroWorkspaceRow'] button:hover{background:#ffffff!important;background-color:#ffffff!important;color:#061cc4!important;font-style:italic!important;font-weight:800!important;border-color:#070c1c!important;box-shadow:inset 0 2.5px 0 0 #ff175a,3px 3px 0 #070c1c!important}",
    "html.p3r-skin-on ::-webkit-scrollbar-thumb{background:#ffffff!important;border:1.5px solid #070c1c!important;border-radius:0!important}",
    "html.p3r-skin-on ::-webkit-scrollbar-thumb:hover{background:#3cf2ff!important;border-color:#070c1c!important}",
    "html.p3r-skin-on ::selection{background:rgba(60,242,255,0.34);color:#ffffff}",
    "#p3r-dsh-moon{position:fixed;z-index:2147482985;top:8px;right:180px;display:inline-flex;align-items:center;gap:9px;padding:4px 13px 4px 9px;background:linear-gradient(108deg,rgba(6,40,216,0.92) 0%,rgba(4,16,78,0.94) 100%);border:1.5px solid #ffffff;border-bottom:2.5px solid #070c1c;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);box-shadow:3px 3px 0 rgba(7,12,28,0.82);color:#ffffff;font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif;cursor:grab;touch-action:none;user-select:none;-webkit-app-region:no-drag;pointer-events:auto;transition:transform .16s cubic-bezier(0.16,1,0.3,1),opacity .18s ease,border-color .16s ease}",
    "#p3r-dsh-moon:hover{transform:translateY(-1px);border-color:#3cf2ff}",
    "#p3r-dsh-moon.p3r-dragging{transition:none!important;cursor:grabbing!important;transform:none!important}",
    "#p3r-dsh-moon.p3r-hidden{opacity:0;pointer-events:none;transform:translateY(-4px)}",
    ".p3r-moon-disc{position:relative;width:20px;height:20px;border-radius:50%;background:#070c1c;border:2px solid #ffffff;overflow:hidden;flex-shrink:0;box-shadow:0 0 0 1px #070c1c}",
    ".p3r-moon-lit{position:absolute;inset:1px;border-radius:50%;background:#f4e818}",
    ".p3r-moon-shadow{position:absolute;inset:1px;border-radius:50%;background:#070c1c;transition:transform .3s ease}",
    "html.p3r-streaming #p3r-dsh-moon{border-color:#3cf2ff;box-shadow:3px 3px 0 rgba(7,12,28,0.9),0 0 14px rgba(60,242,255,0.42)}",
    "html.p3r-streaming .p3r-moon-disc{border-color:#f4e818;animation:p3rMoonPulse .9s ease-in-out infinite alternate}",
    "@keyframes p3rMoonPulse{from{opacity:.84}to{opacity:1}}",
    ".p3r-moon-meta{display:flex;flex-direction:column;line-height:1.08}",
    ".p3r-moon-date{font-size:12px;font-weight:900;font-style:italic;letter-spacing:.06em;color:#ffffff}",
    ".p3r-moon-sub{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Avenir Next Condensed',sans-serif;font-size:8.5px;font-weight:800;letter-spacing:.09em;color:#8df5ff;border-bottom:2px solid #3cf2ff;padding-bottom:1px;width:fit-content}",
    "html.p3r-streaming .p3r-moon-sub{color:#f4e818;border-bottom-color:#f4e818}",
    "#p3r-dsh-wallet{position:fixed;z-index:2147482990;right:20px;bottom:86px;min-width:136px;padding:0;background:transparent;border:none;color:#070c1c;font-family:'Avenir Next Condensed','Futura','Helvetica Neue',sans-serif;cursor:grab;touch-action:none;user-select:none;-webkit-app-region:no-drag;pointer-events:auto;transition:transform .16s cubic-bezier(0.16,1,0.3,1),opacity .18s ease}",
    "#p3r-dsh-wallet.p3r-dragging,#p3r-dsh-dock.p3r-dragging,#p3r-dsh-dock.p3r-dragging #p3r-dsh-pill{transition:none!important;cursor:grabbing!important}",
    "#p3r-dsh-wallet.p3r-dragging{transform:none!important}",
    "#p3r-dsh-wallet.p3r-hidden{opacity:0;pointer-events:none;transform:translateY(4px)}",
    "#p3r-dsh-wallet::before{content:'';position:absolute;left:-7px;top:-4px;width:48%;height:calc(100% + 10px);background:#0628d8;clip-path:polygon(0 0,74% 0,100% 100%,14% 100%);z-index:0;pointer-events:none}",
    "#p3r-dsh-wallet::after{content:'';position:absolute;right:-5px;bottom:-5px;width:48%;height:68%;background:#070c1c;clip-path:polygon(24% 0,100% 0,100% 100%,0 100%);z-index:0;pointer-events:none}",
    ".p3r-wallet-card{position:relative;z-index:1;padding:6px 14px 7px 12px;background:#ffffff;border:2px solid #070c1c;border-top:2.5px solid #ff175a;border-radius:0;box-shadow:0 8px 20px rgba(4,10,32,0.24);transition:border-color .16s ease}",
    "#p3r-dsh-wallet:hover{transform:translateY(-2px)}",
    "#p3r-dsh-wallet:hover .p3r-wallet-card{border-color:#0628d8;border-top-color:#ff175a}",
    "#p3r-dsh-wallet:active{transform:scale(0.97)}",
    ".p3r-wallet-top{display:flex;align-items:baseline;gap:3px;line-height:1;color:#070c1c}",
    ".p3r-wallet-cur{font-size:19px;font-weight:800;letter-spacing:-0.02em}",
    ".p3r-wallet-amt{font-size:21px;font-weight:600;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}",
    ".p3r-wallet-sub{margin-top:2px;font-size:10px;font-weight:900;font-style:italic;letter-spacing:.01em;line-height:1.1;color:#070c1c}",
    "#p3r-dsh-wallet.p3r-wallet-loading .p3r-wallet-amt{opacity:.55}",
    "#p3r-dsh-wallet.p3r-wallet-error .p3r-wallet-card{border-color:#e6193c;border-top-color:#e6193c}",
    "#p3r-dsh-wallet.p3r-wallet-error .p3r-wallet-sub{color:#e6193c}",
    "#p3r-dsh-dock{position:fixed;top:62px;right:20px;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;user-select:none;-webkit-app-region:no-drag;pointer-events:auto}",
    "#p3r-dsh-dock *{-webkit-app-region:no-drag;box-sizing:border-box}",
    "#p3r-dsh-pill{position:relative;display:inline-flex;align-items:center;justify-content:center;width:74px;height:78px;padding:0;border:none;background:transparent;cursor:grab;touch-action:none;filter:drop-shadow(0 5px 14px rgba(0,18,86,0.52));transition:transform .18s cubic-bezier(0.16,1,0.3,1),filter .18s ease}",
    "#p3r-dsh-pill svg{width:74px;height:78px;display:block;overflow:visible;pointer-events:none;user-select:none;-webkit-user-drag:none}",
    "#p3r-dsh-pill:hover{transform:translateY(-2px) scale(1.06);filter:drop-shadow(0 8px 18px rgba(60,242,255,0.65))}",
    "#p3r-dsh-pill.p3r-open{transform:translateY(-1px) scale(1.04);filter:drop-shadow(0 8px 18px rgba(60,242,255,0.78))}",
    "#p3r-dsh-pill:active{transform:scale(0.95)}",
    "html.p3r-streaming #p3r-dsh-pill .p3r-mk-hp{animation:p3rBarPulse .7s ease-in-out infinite alternate}",
    "html.p3r-streaming #p3r-dsh-pill .p3r-mk-sp{animation:p3rBarPulse .95s ease-in-out infinite alternate-reverse}",
    "@keyframes p3rBarPulse{from{opacity:.76}to{opacity:1}}",
    "#p3r-dsh-card{position:absolute;right:0;top:84px;bottom:auto;width:292px;max-height:calc(100vh - 108px);overflow-y:auto;padding:12px 14px 13px;border-radius:0;border:2px solid #070c1c;border-left:4.5px solid #3cf2ff;background:linear-gradient(164deg,rgba(6,20,72,0.97) 0%,rgba(4,11,40,0.98) 100%);color:#eaf6ff;box-shadow:7px 7px 0 rgba(7,12,28,0.90),0 18px 42px rgba(0,10,48,0.64);display:none;flex-direction:column;gap:7px;transform-origin:top right;animation:p3rCardInDown .17s cubic-bezier(0.16,1,0.3,1)}",
    "#p3r-dsh-dock.p3r-dock-bottom #p3r-dsh-card{top:auto;bottom:84px;transform-origin:bottom right;animation:p3rCardIn .17s cubic-bezier(0.16,1,0.3,1)}",
    "#p3r-dsh-dock.p3r-dock-left #p3r-dsh-card{left:0;right:auto;transform-origin:top left}",
    "#p3r-dsh-dock.p3r-dock-bottom.p3r-dock-left #p3r-dsh-card{transform-origin:bottom left}",
    "#p3r-dsh-card.open{display:flex}",
    "@keyframes p3rCardIn{from{opacity:0;transform:translateY(8px) skewX(-2deg) scale(0.96)}to{opacity:1;transform:translateY(0) skewX(0deg) scale(1)}}",
    "@keyframes p3rCardInDown{from{opacity:0;transform:translateY(-8px) skewX(-2deg) scale(0.96)}to{opacity:1;transform:translateY(0) skewX(0deg) scale(1)}}",
    ".p3r-card-head{display:flex;align-items:center;justify-content:space-between;margin:-12px -14px 3px -14px;padding:9px 14px;background:linear-gradient(108deg,#0044dc 0%,#072296 72%,#070c1c 100%);border-bottom:2px solid #3cf2ff;font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif;font-size:15px;font-weight:900;font-style:italic;letter-spacing:.06em;color:#ffffff}",
    ".p3r-card-tag{font-family:'Futura','Impact','Arial Black',sans-serif;font-size:10px;font-weight:900;padding:2px 10px;border-radius:0;background:#ffffff;color:#061cc4;border:1.5px solid #070c1c;border-top:2.5px solid #ff175a;transform:skewX(-14deg);box-shadow:2.5px 2.5px 0 #070c1c}",
    ".p3r-card-tag span{display:inline-block;transform:skewX(6deg)}",
    ".p3r-row{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:#e2f0ff;gap:8px;padding:4.5px 9px;margin:0 -4px;border-radius:0;border-top:2px solid transparent;cursor:pointer;transition:background .12s ease,color .12s ease,border-color .12s ease,transform .14s cubic-bezier(0.16,1,0.3,1)}",
    ".p3r-row:hover{background:#ffffff;color:#061cc4;border-top-color:#ff175a;clip-path:polygon(0 0,100% 0,calc(100% - 8px) 100%,0 100%);transform:translateX(4px);font-style:italic}",
    ".p3r-switch{position:relative;display:inline-flex;align-items:center;width:38px;height:18px;flex-shrink:0}",
    ".p3r-switch input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer;z-index:2}",
    ".p3r-switch-track{position:relative;width:100%;height:100%;background:#070c1c;border:1.5px solid #486ca8;border-radius:0;transform:skewX(-16deg);transition:background .15s ease,border-color .15s ease,box-shadow .15s ease}",
    ".p3r-switch-track::after{content:'';position:absolute;top:2px;left:2px;width:12px;height:11px;background:#9bb8e8;border-radius:0;transition:transform .16s cubic-bezier(0.16,1,0.3,1),background .15s ease}",
    ".p3r-switch input:checked+.p3r-switch-track{background:#3cf2ff;border-color:#ffffff;box-shadow:0 0 10px rgba(60,242,255,0.36)}",
    ".p3r-switch input:checked+.p3r-switch-track::after{transform:translateX(18px);background:#070c1c}",
    ".p3r-slider-wrap{display:flex;flex-direction:column;gap:4px;font-size:11.5px;padding-top:2px}",
    ".p3r-slider-head{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:#dbeafe}",
    ".p3r-slider-head b{color:#8df5ff;font-variant-numeric:tabular-nums}",
    ".p3r-slider-wrap input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:0;background:#070c1c;border:1px solid #3c609c;outline:none;cursor:pointer}",
    ".p3r-slider-wrap input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:13px;height:13px;background:#f4e818;border:2px solid #070c1c;border-radius:0;transform:rotate(45deg);cursor:pointer;transition:transform .12s ease,background .12s ease}",
    ".p3r-slider-wrap input[type=range]::-webkit-slider-thumb:hover{background:#3cf2ff;border-color:#ffffff;transform:rotate(45deg) scale(1.16)}",
    ".p3r-btn-row{display:flex;flex-wrap:wrap;gap:6px;padding-top:3px}",
    ".p3r-mini-btn{position:relative;flex:1 1 calc(50% - 4px);padding:6px 6px;border-radius:0;border:1.5px solid rgba(102,198,255,0.44);border-left:3.5px solid #3cf2ff;background:#070c1c;color:#eaf6ff;font-size:11px;font-weight:800;letter-spacing:.04em;cursor:pointer;text-align:center;white-space:nowrap;transform:skewX(-12deg);overflow:hidden;transition:transform .14s cubic-bezier(0.16,1,0.3,1),background .14s ease,border-color .14s ease,color .14s ease}",
    ".p3r-mini-btn>span{display:inline-block;transform:skewX(12deg)}",
    ".p3r-mini-btn:hover{transform:skewX(-12deg) translateY(-1px);background:#ffffff;color:#061cc4;border-color:#070c1c;border-top-color:#ff175a;box-shadow:2.5px 2.5px 0 #070c1c}",
    ".p3r-mini-btn:active{transform:skewX(-12deg) scale(0.95)}",
    ".p3r-mini-btn.primary{background:#ffffff;border-color:#070c1c;border-left:4px solid #ff175a;color:#061cc4;box-shadow:2.5px 2.5px 0 #070c1c}",
    ".p3r-mini-btn.primary:hover{background:#3cf2ff;color:#070c1c;border-color:#ffffff;border-left-color:#070c1c}",
    "html.p3r-btn-fx #root button:not(:disabled),html.p3r-btn-fx #root [role='button']:not([aria-disabled='true']),html.p3r-btn-fx #root [role='tab'],html.p3r-btn-fx #root [role='menuitem'],html.p3r-btn-fx [role='dialog'] button:not(:disabled),html.p3r-btn-fx [role='menu'] [role='menuitem'],html.p3r-btn-fx [role='menu'] [role='menuitemradio'],html.p3r-btn-fx [role='menu'] [role='menuitemcheckbox'],html.p3r-btn-fx [role='listbox'] [role='option']{transition:transform .15s cubic-bezier(0.16,1,0.3,1),box-shadow .18s ease,border-color .18s ease,background .18s ease,background-color .18s ease,color .15s ease,filter .15s ease}",
    "html.p3r-btn-fx #root button:not(:disabled):not([class*='_sidebarCol'] *):not([aria-current='page']):hover,html.p3r-btn-fx #root [role='button']:not([aria-disabled='true']):not([class*='_sidebarCol'] *):hover,html.p3r-btn-fx #root [role='tab']:hover,html.p3r-btn-fx [role='dialog'] button:not(:disabled):hover{border-color:#3cf2ff!important;box-shadow:inset 3px 0 0 #3cf2ff,3px 3px 0 rgba(7,12,28,0.72)!important}",
    "html.p3r-btn-fx #root [role='tab'][aria-selected='true'],html.p3r-btn-fx #root button[aria-pressed='true']:not([class*='_sidebarCol'] *){background:#ffffff!important;color:#061cc4!important;border-color:#070c1c!important;box-shadow:inset 0 2.5px 0 #ff175a,3px 2px 0 #070c1c!important}",
    "html.p3r-btn-fx #root [role='tab'][aria-selected='true'] *,html.p3r-btn-fx #root button[aria-pressed='true']:not([class*='_sidebarCol'] *) *{color:#061cc4!important}",
    "html.p3r-btn-fx #root button:not(:disabled):active,html.p3r-btn-fx #root [role='button']:not([aria-disabled='true']):active,html.p3r-btn-fx #root [role='tab']:active,html.p3r-btn-fx [role='dialog'] button:not(:disabled):active{transform:scale(0.97)!important}",
    "html.p3r-btn-fx #root button:focus-visible,html.p3r-btn-fx #root [role='button']:focus-visible,html.p3r-btn-fx #p3r-dsh-dock button:focus-visible,html.p3r-btn-fx #p3r-dsh-wallet:focus-visible,html.p3r-btn-fx #p3r-dsh-moon:focus-visible{outline:2px solid #3cf2ff!important;outline-offset:2px!important}",
    "html.p3r-btn-fx [class*='_panelEntryActive']{background:transparent!important;background-color:transparent!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button:is([class$='_newSession'],[class*='_newSession '],[class*='_newSession_']){position:relative!important;background:rgba(5,16,58,0.76)!important;background-image:none!important;border:1.5px solid rgba(60,242,255,0.62)!important;border-left:4px solid #3cf2ff!important;border-radius:0!important;clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%);color:#ffffff!important;font-style:italic!important;font-weight:800!important;letter-spacing:.02em;text-shadow:0 1px 4px rgba(0,12,72,0.56)!important;box-shadow:3px 3px 0 rgba(7,12,28,0.68)!important;transition:transform .14s cubic-bezier(0.16,1,0.3,1),background .14s ease,color .12s ease,border-color .14s ease,box-shadow .14s ease!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button:is([class$='_newSession'],[class*='_newSession '],[class*='_newSession_']) *{color:inherit!important;font-style:italic!important;text-shadow:inherit!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button:is([class$='_newSession'],[class*='_newSession '],[class*='_newSession_']):is(:hover,:focus-visible){background:#ffffff!important;background-color:#ffffff!important;color:#061cc4!important;border-color:#070c1c!important;border-top:2.5px solid #ff175a!important;border-left:4px solid #061cc4!important;text-shadow:none!important;box-shadow:3px 3px 0 #070c1c!important;transform:translateX(3px)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button:is([class$='_newSession'],[class*='_newSession '],[class*='_newSession_']):is(:hover,:focus-visible) *{color:#061cc4!important;text-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button[class$='_panelRow'],button[class*='_panelRow '],button[class*='_panelRow_'],[class*='_footArea'] button[class$='_trigger'],[class*='_footArea'] button[class*='_trigger '],[class*='_footArea'] button[class*='_trigger_'],[class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_'],[class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_']){position:relative!important;isolation:isolate;overflow:visible!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:none!important;border-radius:0!important;color:var(--p3r-sb-idle-color,#ffffff)!important;font-style:italic!important;font-weight:700!important;letter-spacing:.01em;text-shadow:var(--p3r-sb-idle-shadow,0 1px 4px rgba(0,12,72,0.56))!important;transition:transform .14s cubic-bezier(0.16,1,0.3,1),color .12s ease!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button[class$='_panelRow'],button[class*='_panelRow '],button[class*='_panelRow_'],[class*='_footArea'] button[class$='_trigger'],[class*='_footArea'] button[class*='_trigger '],[class*='_footArea'] button[class*='_trigger_'],[class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_'],[class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_'])::before{content:'';position:absolute;inset:0 2px 0 0;z-index:-2;pointer-events:none;background:rgba(255,23,90,0.82);clip-path:polygon(0 0,100% 0,calc(100% - 11px) 100%,0 100%);transform-origin:left center;transform:translate(0,0) scaleX(0.14);opacity:0;transition:transform .16s cubic-bezier(0.16,1,0.3,1),opacity .12s ease}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button[class$='_panelRow'],button[class*='_panelRow '],button[class*='_panelRow_'],[class*='_footArea'] button[class$='_trigger'],[class*='_footArea'] button[class*='_trigger '],[class*='_footArea'] button[class*='_trigger_'],[class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_'],[class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_'])::after{content:'';position:absolute;inset:0 2px 0 0;z-index:-1;pointer-events:none;background:#ffffff;border-top:2.5px solid #ff175a;clip-path:polygon(0 0,100% 0,calc(100% - 11px) 100%,0 100%);transform-origin:left center;transform:scaleX(0.18);opacity:0;transition:transform .14s cubic-bezier(0.16,1,0.3,1),opacity .10s ease}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button[class$='_panelRow'],button[class*='_panelRow '],button[class*='_panelRow_'],[class*='_footArea'] button[class$='_trigger'],[class*='_footArea'] button[class*='_trigger '],[class*='_footArea'] button[class*='_trigger_'],[class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_'],[class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_']) *{color:inherit!important;font-style:italic!important;text-shadow:inherit!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is([class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_']) :is([class*='_time'],[class*='_meta']),html.p3r-btn-fx [class*='_sidebarCol'] [class*='_newSessionShortcut']{color:var(--p3r-sb-idle-sub,#8df5ff)!important;font-style:italic!important;font-weight:600!important;background:transparent!important;border:none!important;box-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button:is([class$='_newSession'],[class*='_newSession '],[class*='_newSession_']) kbd{background:rgba(60,242,255,0.14)!important;border:1px solid rgba(60,242,255,0.44)!important;color:#8df5ff!important;text-shadow:none!important;box-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is([class$='_toggle'],[class*='_toggle '],[class*='_toggle_'],[class$='_searchButton'],[class*='_searchButton '],[class*='_searchButton_'],[class$='_iconButton'],[class*='_iconButton '],[class*='_iconButton_'],[class$='_panelUnpin'],[class*='_panelUnpin '],[class*='_panelUnpin_'],[class$='_brand'],[class*='_brand '],[class*='_brand_']){color:var(--p3r-sb-idle-color,#ffffff)!important;font-style:italic!important;border-radius:0!important}",
    "html.p3r-skin-on.p3r-btn-fx kbd{font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif!important;font-weight:900!important;text-transform:uppercase}",
    "html.p3r-skin-on.p3r-btn-fx [data-p3r-en='1']{font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif!important;font-weight:900!important;text-transform:uppercase!important;letter-spacing:.02em!important;font-style:normal!important;display:inline-block;transform:skewX(-14deg)}",
    "html.p3r-skin-on.p3r-btn-fx body[data-ds-dark-theme] [data-p3r-en='1'],html.p3r-skin-on.p3r-btn-fx [class*='_centerCol'] [data-p3r-en='1'],html.p3r-skin-on.p3r-btn-fx [class*='_sidebarCol'] [data-p3r-en='1']{text-shadow:1.5px 2px 0 #04136e,2px 2.5px 0 #04136e,0 0 8px rgba(0,14,88,0.48)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button:is([class$='_panelRow'],[class*='_panelRow '],[class*='_panelRow_']):is(:hover,:focus-visible,[aria-current='page'],[aria-expanded='true']),[class*='_panelEntryActive'] button:is([class$='_panelRow'],[class*='_panelRow '],[class*='_panelRow_']),[class*='_footArea'] button:is([class$='_trigger'],[class*='_trigger '],[class*='_trigger_']):is(:hover,:focus-visible,[aria-expanded='true']),:is([class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_']):is(:hover,:focus-visible,[aria-selected='true']),:is([class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_']):is(:hover,:focus-visible,[class*='_selected'])){color:#061cc4!important;font-style:italic!important;font-weight:800!important;text-shadow:none!important;transform:translateX(3px)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button:is([class$='_panelRow'],[class*='_panelRow '],[class*='_panelRow_']):is(:hover,:focus-visible,[aria-current='page'],[aria-expanded='true']),[class*='_panelEntryActive'] button:is([class$='_panelRow'],[class*='_panelRow '],[class*='_panelRow_']),[class*='_footArea'] button:is([class$='_trigger'],[class*='_trigger '],[class*='_trigger_']):is(:hover,:focus-visible,[aria-expanded='true']),:is([class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_']):is(:hover,:focus-visible,[aria-selected='true']),:is([class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_']):is(:hover,:focus-visible,[class*='_selected']))::after{opacity:1!important;transform:scaleX(1)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button:is([class$='_panelRow'],[class*='_panelRow '],[class*='_panelRow_']):is(:hover,:focus-visible,[aria-current='page'],[aria-expanded='true']),[class*='_panelEntryActive'] button:is([class$='_panelRow'],[class*='_panelRow '],[class*='_panelRow_']),[class*='_footArea'] button:is([class$='_trigger'],[class*='_trigger '],[class*='_trigger_']):is(:hover,:focus-visible,[aria-expanded='true']),:is([class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_']):is(:hover,:focus-visible,[aria-selected='true']),:is([class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_']):is(:hover,:focus-visible,[class*='_selected']))::before{opacity:0.86!important;transform:translate(3.5px,2.5px) scaleX(1)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button:is([class$='_panelRow'],[class*='_panelRow '],[class*='_panelRow_']):is(:hover,:focus-visible,[aria-current='page'],[aria-expanded='true']),[class*='_panelEntryActive'] button:is([class$='_panelRow'],[class*='_panelRow '],[class*='_panelRow_']),[class*='_footArea'] button:is([class$='_trigger'],[class*='_trigger '],[class*='_trigger_']):is(:hover,:focus-visible,[aria-expanded='true']),:is([class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_']):is(:hover,:focus-visible,[aria-selected='true']),:is([class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_']):is(:hover,:focus-visible,[class*='_selected'])) *{color:#061cc4!important;font-style:italic!important;text-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] :is(button:is([class$='_newSession'],[class*='_newSession '],[class*='_newSession_']),:is(button[class$='_panelRow'],button[class*='_panelRow '],button[class*='_panelRow_'],[class*='_footArea'] button[class$='_trigger'],[class*='_footArea'] button[class*='_trigger '],[class*='_footArea'] button[class*='_trigger_'],[class$='_projectRow'],[class*='_projectRow '],[class*='_projectRow_'],[class$='_sessionRow'],[class*='_sessionRow '],[class*='_sessionRow_'])):active{transform:translateX(3px) scale(0.975)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button:is([class$='_newSession'],[class*='_newSession '],[class*='_newSession_']):is(:hover,:focus-visible) [class*='_newSessionShortcut']{background:transparent!important;border:none!important;color:#061cc4!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] button:is([class$='_newSession'],[class*='_newSession '],[class*='_newSession_']):is(:hover,:focus-visible) kbd{background:rgba(6,28,196,0.10)!important;color:#061cc4!important;border:1px solid rgba(6,28,196,0.32)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_panelRow'] [class*='_panelUnpin'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow'] [class*='_iconButton'],html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow'] [class*='_iconButton']{background:transparent!important;box-shadow:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_panelRow'] [class*='_panelUnpin']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_projectRow'] [class*='_iconButton']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sessionRow'] [class*='_iconButton']:hover{background:rgba(6,28,196,0.12)!important;color:#061cc4!important;box-shadow:none!important}",
    "html.p3r-btn-fx [class*='_collapsed'] [class*='_newSession']{width:36px!important;height:36px!important;justify-content:center!important;padding:0!important;clip-path:none!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_toggle']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_searchButton']:hover,html.p3r-btn-fx [class*='_sidebarCol']>[class*='_iconButton']:hover,html.p3r-btn-fx [class*='_sidebarCol'] [class*='_controls'] [class*='_iconButton']:hover{background:#ffffff!important;color:#061cc4!important;box-shadow:inset 0 2.5px 0 0 #ff175a,2.5px 2.5px 0 #070c1c!important;transform:scale(1.06)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_brand']{overflow:visible!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_brand']:hover{transform:translateX(2px) scale(1.02)!important;color:#ffffff!important;filter:drop-shadow(0 0 8px rgba(60,242,255,0.72))}",
    "html.p3r-skin-on [class*='_sidebarCol'] [class*='_brandMark'] svg{color:#ffffff!important;transform:skewX(-10deg) scale(1.05);filter:drop-shadow(2px 2px 0 #04136e) drop-shadow(0 0 8px rgba(60,242,255,0.48));transition:transform .16s ease,filter .16s ease}",
    "html.p3r-skin-on [class*='_sidebarCol'] [class*='_brandName']{overflow:visible!important;display:inline-flex!important;align-items:center!important}",
    "html.p3r-skin-on [class*='_sidebarCol'] [class*='_brandName'] [data-slot='sidebar.brand.name']{display:none!important}",
    "html:not(.p3r-skin-on) .p3r-brand-wordmark{display:none!important}",
    "html.p3r-skin-on .p3r-brand-wordmark{display:inline-flex;align-items:center;gap:6px;margin-left:2px;overflow:visible;line-height:1;user-select:none}",
    "html.p3r-skin-on .p3r-brand-ds{font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif!important;font-weight:900!important;font-size:17px;letter-spacing:.015em;color:#ffffff!important;text-transform:uppercase;font-style:normal!important;display:inline-block;transform:skewX(-16deg) rotate(-2.5deg);text-shadow:2.5px 2.5px 0 #04136e,-0.5px -0.5px 0 rgba(60,242,255,0.48),0 3px 10px rgba(0,14,88,0.62)!important}",
    "html.p3r-skin-on .p3r-brand-har{position:relative;display:inline-flex;align-items:center;padding:1px 4px;margin-left:1px;overflow:visible}",
    "html.p3r-skin-on .p3r-brand-orb{position:absolute;left:10px;top:50%;width:24px;height:24px;margin-top:-12px;border-radius:50%;background:#0c8aff;box-shadow:0 0 10px rgba(60,242,255,0.58);z-index:0;pointer-events:none;transition:transform .16s ease,box-shadow .16s ease}",
    "html.p3r-skin-on [class*='_sidebarCol'] [class*='_brand']:hover .p3r-brand-orb{transform:scale(1.14);box-shadow:0 0 16px rgba(60,242,255,0.88)}",
    "html.p3r-skin-on .p3r-brand-har-txt{position:relative;z-index:1;font-family:'Futura','Impact','Arial Black','Avenir Next Condensed',sans-serif!important;font-weight:900!important;font-size:12px;letter-spacing:.025em;color:#ffffff!important;text-transform:uppercase;font-style:normal!important;display:inline-block;transform:skewX(-16deg) rotate(-2.5deg) translateY(1px);text-shadow:2px 2px 0 #04136e,-0.5px -0.5px 0 rgba(0,14,88,0.65),0 2px 8px rgba(0,12,72,0.65)!important}",
    "html.p3r-btn-fx [class*='_sidebarCol'] [class*='_sectionHeader'] [class*='_sectionLabel']{letter-spacing:.10em;font-style:italic!important;font-weight:800!important;color:var(--p3r-sb-idle-sub,#8df5ff)!important;text-shadow:var(--p3r-sb-idle-shadow,0 1px 4px rgba(0,12,72,0.52))!important;text-transform:uppercase}",
    "html.p3r-btn-fx [class*='_folderActive']{color:#061cc4!important}",
    "html.p3r-btn-fx [role='menu'],html.p3r-btn-fx [role='listbox']{border:2px solid #070c1c!important;border-left:4px solid #3cf2ff!important;border-top:2px solid #ffffff!important;border-radius:0!important;background:linear-gradient(162deg,rgba(6,20,72,0.97) 0%,rgba(4,11,40,0.98) 100%)!important;color:#eaf6ff!important;box-shadow:6px 6px 0 rgba(7,12,28,0.88),0 18px 40px rgba(0,10,48,0.58)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;animation:p3rMenuPopIn .14s cubic-bezier(0.16,1,0.3,1)}",
    "html.p3r-btn-fx body[data-ds-dark-theme] [role='menu'],html.p3r-btn-fx body[data-ds-dark-theme] [role='listbox']{background:linear-gradient(162deg,rgba(6,20,72,0.98) 0%,rgba(4,11,40,0.99) 100%)!important;color:#eaf6ff!important;box-shadow:6px 6px 0 rgba(7,12,28,0.92),0 20px 44px rgba(0,10,48,0.64)!important}",
    "html.p3r-btn-fx [role='menu'][data-menu-material]>[aria-hidden='true']{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}",
    "@keyframes p3rMenuPopIn{from{opacity:0;clip-path:inset(0 0 22% 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem'],html.p3r-btn-fx [role='listbox'] [role='option']{position:relative;overflow:hidden;border-radius:0!important;color:#e2f0ff!important;font-weight:700;border:none!important;border-top:2px solid transparent!important}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem']:not([data-danger='true']):hover,html.p3r-btn-fx [role='menu'] [role^='menuitem']:not([data-danger='true']):focus-visible,html.p3r-btn-fx [role='menu'] [role^='menuitem'][data-highlighted]:not([data-danger='true']),html.p3r-btn-fx [role='listbox'] [role='option']:hover,html.p3r-btn-fx [role='listbox'] [role='option'][aria-selected='true']{background:#ffffff!important;color:#061cc4!important;border-top-color:#ff175a!important;clip-path:polygon(0 0,100% 0,calc(100% - 8px) 100%,0 100%);font-style:italic!important;transform:translateX(3px)}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem']:not([data-danger='true']):hover *,html.p3r-btn-fx [role='menu'] [role^='menuitem'][data-highlighted]:not([data-danger='true']) *,html.p3r-btn-fx [role='listbox'] [role='option']:hover *,html.p3r-btn-fx [role='listbox'] [role='option'][aria-selected='true'] *{color:#061cc4!important}",
    "html.p3r-btn-fx [role='menu'] [role='menuitemradio'][aria-checked='true'],html.p3r-btn-fx [role='menu'] [role='menuitemcheckbox'][aria-checked='true']{background:#3cf2ff!important;color:#070c1c!important;border-top-color:#ffffff!important;box-shadow:3px 2px 0 #070c1c!important}",
    "html.p3r-btn-fx [role='menu'] [role='menuitemradio'][aria-checked='true'] *,html.p3r-btn-fx [role='menu'] [role='menuitemcheckbox'][aria-checked='true'] *{color:#070c1c!important}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem'][data-danger='true']{color:#ff8aa4!important}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem'][data-danger='true']:hover,html.p3r-btn-fx [role='menu'] [role^='menuitem'][data-danger='true']:focus-visible{background:#e6193c!important;color:#ffffff!important;box-shadow:3px 2px 0 #070c1c!important;transform:translateX(3px)}",
    "html.p3r-btn-fx [role='menu'] [role^='menuitem']:active,html.p3r-btn-fx [role='listbox'] [role='option']:active{transform:translateX(2px) scale(0.97)!important}",
    "html.p3r-btn-fx [role='menu'] [role='separator']{background:rgba(60,242,255,0.28)!important}",
    "#p3r-fx-layer{position:fixed;inset:0;z-index:2147483400;pointer-events:none;overflow:hidden;-webkit-app-region:initial!important;app-region:initial!important}",
    "#p3r-fx-layer *{-webkit-app-region:initial!important;app-region:initial!important}",
    ".p3r-burst{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none}",
    ".p3r-burst-ring{position:absolute;left:-14px;top:-14px;width:28px;height:28px;border:2px solid #3cf2ff;transform:skewX(-12deg) rotate(45deg) scale(0.32);animation:p3rRingOut .28s cubic-bezier(0.16,1,0.3,1) forwards}",
    ".p3r-burst-slash{position:absolute;left:-26px;top:-1.5px;width:52px;height:3px;background:linear-gradient(90deg,transparent 0%,#3cf2ff 24%,#ffffff 52%,#ff175a 78%,transparent 100%);transform:rotate(-18deg) scaleX(0.2);animation:p3rSlashCut .22s cubic-bezier(0.16,1,0.3,1) forwards}",
    ".p3r-burst-shard{position:absolute;left:0;top:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;background:#3cf2ff;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);animation:p3rShardFly .30s cubic-bezier(0.16,1,0.3,1) forwards}",
    ".p3r-burst-shard.alt{background:#ffffff;width:5px;height:9px;clip-path:polygon(50% 0%,100% 35%,45% 100%,0% 30%)}",
    ".p3r-burst-shard.sp{background:#f4e818;width:5px;height:5px;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%)}",
    "@keyframes p3rRingOut{0%{opacity:1;transform:skewX(-12deg) rotate(45deg) scale(0.32)}100%{opacity:0;transform:skewX(-12deg) rotate(45deg) scale(1.85)}}",
    "@keyframes p3rSlashCut{0%{opacity:1;transform:rotate(-18deg) scaleX(0.2)}55%{opacity:1;transform:rotate(-18deg) scaleX(1.18)}100%{opacity:0;transform:rotate(-18deg) scaleX(1.42)}}",
    "@keyframes p3rShardFly{0%{opacity:1;transform:translate(0,0) rotate(0deg) scale(1)}100%{opacity:0;transform:translate(var(--tx,22px),var(--ty,-18px)) rotate(var(--rot,90deg)) scale(0.15)}}",
    "#p3r-effort-canvas{position:fixed;left:0;top:0;z-index:2147483450;pointer-events:none;visibility:hidden;-webkit-app-region:initial!important;app-region:initial!important}",
    "#p3r-effort-float{position:fixed;left:0;top:0;z-index:2147483420;min-width:258px;max-width:340px;padding:10px 14px 11px;background:linear-gradient(156deg,rgba(6,20,76,0.97) 0%,rgba(4,10,36,0.99) 100%);border:2px solid #070c1c;border-top:2.5px solid #3cf2ff;border-left:4px solid #ffffff;box-shadow:6px 6px 0 rgba(7,12,28,0.92),0 18px 40px rgba(0,10,56,0.62);color:#eef6ff;opacity:0;visibility:hidden;transform:translate3d(0,8px,0) scale(0.95);pointer-events:none;contain:layout style;transition:opacity .12s ease,transform .14s cubic-bezier(0.16,1,0.3,1),border-top-color .14s ease;-webkit-app-region:initial!important;app-region:initial!important}",
    "#p3r-effort-float::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:#ff175a;opacity:0;pointer-events:none;transition:opacity .12s ease}",
    "#p3r-effort-float.open{opacity:1;visibility:visible;transform:translate3d(0,0,0) scale(1);pointer-events:auto}",
    "#p3r-effort-float[data-tier='0']{border-top-color:#8df5ff}",
    "#p3r-effort-float[data-tier='1']{border-top-color:#3cf2ff}",
    "#p3r-effort-float[data-tier='2']{border-top-color:#f4e818}",
    "#p3r-effort-float[data-tier='3']{border-top-color:#ffffff}",
    "#p3r-effort-float[data-tier='3']::before{opacity:1}",
    "html.p3r-skin-on.p3r-btn-fx [role='menu'][data-p3r-effort-pane='1']{min-width:268px!important;padding:5px!important}",
    "html.p3r-skin-on.p3r-btn-fx [role='menu'][data-p3r-effort-pane='1'] [class*='_groups']{position:relative!important;height:0!important;min-height:0!important;max-height:0!important;padding:0!important;margin:0!important;overflow:hidden!important}",
    "html.p3r-skin-on.p3r-btn-fx [role='menu'][data-p3r-effort-pane='1'] [role='menuitemradio']{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;pointer-events:none!important}",
    ".p3r-effort-rail{position:relative;display:flex;flex-direction:column;gap:7px;user-select:none;-webkit-user-select:none;contain:layout style;font-family:'Futura','Impact','PingFang SC','Microsoft YaHei',sans-serif}",
    ".p3r-effort-rail.p3r-er-inline{padding:9px 11px 10px;margin:0;background:linear-gradient(152deg,rgba(4,14,56,0.94) 0%,rgba(6,24,96,0.90) 100%);border:1.5px solid rgba(60,242,255,0.44);border-left:3.5px solid #3cf2ff}",
    ".p3r-effort-rail.p3r-er-inline::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:#ff175a;opacity:0;pointer-events:none;transition:opacity .12s ease}",
    ".p3r-effort-rail.p3r-er-inline[data-tier='0']{border-left-color:#8df5ff}",
    ".p3r-effort-rail.p3r-er-inline[data-tier='2']{border-left-color:#f4e818}",
    ".p3r-effort-rail.p3r-er-inline[data-tier='3']{border-left-color:#ffffff}",
    ".p3r-effort-rail.p3r-er-inline[data-tier='3']::before{opacity:1}",
    ".p3r-er-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:#8df5ff;font-style:italic}",
    ".p3r-er-badge{display:inline-flex;align-items:center;padding:1px 8px;background:#070c1c;border:1px solid #3cf2ff;color:#3cf2ff;font-size:10.5px;font-weight:900;letter-spacing:.06em;transform:skewX(-12deg);transition:background .12s ease,color .12s ease,border-color .12s ease}",
    ".p3r-er-badge>span{display:inline-block;transform:skewX(12deg)}",
    ".p3r-effort-rail[data-tier='0'] .p3r-er-badge{border-color:#8df5ff;color:#8df5ff}",
    ".p3r-effort-rail[data-tier='2'] .p3r-er-badge{border-color:#f4e818;color:#f4e818}",
    ".p3r-effort-rail[data-tier='3'] .p3r-er-badge{background:#ffffff;border-color:#070c1c;color:#061cc4;box-shadow:inset 0 2px 0 #ff175a,2px 2px 0 #070c1c}",
    ".p3r-er-track-hit{position:relative;height:30px;display:flex;align-items:center;cursor:ew-resize;touch-action:none;padding:0 8px;outline:none}",
    ".p3r-er-track-hit:focus-visible{outline:2px solid #3cf2ff;outline-offset:2px}",
    ".p3r-er-track{position:relative;width:100%;height:8px;background:#070c1c;border:1px solid rgba(102,198,255,0.46);transform:skewX(-14deg);overflow:visible}",
    ".p3r-er-fill{position:absolute;inset:0;transform-origin:left center;transform:scaleX(0);will-change:transform;background:linear-gradient(90deg,#0628d8 0%,#3cf2ff 100%);transition:transform .16s cubic-bezier(0.16,1,0.3,1)}",
    ".p3r-effort-rail[data-tier='0'] .p3r-er-fill{background:linear-gradient(90deg,#0c4a9c 0%,#8df5ff 100%)}",
    ".p3r-effort-rail[data-tier='2'] .p3r-er-fill{background:linear-gradient(90deg,#0628d8 0%,#3cf2ff 48%,#f4e818 100%)}",
    ".p3r-effort-rail[data-tier='3'] .p3r-er-fill{background:linear-gradient(90deg,#3cf2ff 0%,#f4e818 62%,#ffffff 88%,#ff175a 100%)}",
    ".p3r-er-ticks{position:absolute;inset:0;pointer-events:none}",
    ".p3r-er-tick{position:absolute;top:50%;width:5px;height:12px;margin:-6px 0 0 -2.5px;background:rgba(141,245,255,0.34);border:1px solid #070c1c}",
    ".p3r-er-tick.passed{background:#3cf2ff}",
    ".p3r-er-tick.active{background:#ffffff}",
    ".p3r-er-thumb{position:absolute;top:50%;left:0;width:15px;height:15px;margin:-7.5px 0 0 -7.5px;background:#3cf2ff;border:2px solid #070c1c;will-change:transform;transform:translate3d(0,0,0) skewX(14deg) rotate(45deg);pointer-events:none;transition:transform .16s cubic-bezier(0.16,1,0.3,1)}",
    ".p3r-effort-rail.p3r-er-dragging .p3r-er-fill,.p3r-effort-rail.p3r-er-dragging .p3r-er-thumb{transition:none!important}",
    ".p3r-effort-rail[data-tier='0'] .p3r-er-thumb{background:#8df5ff}",
    ".p3r-effort-rail[data-tier='2'] .p3r-er-thumb{background:#f4e818}",
    ".p3r-effort-rail[data-tier='3'] .p3r-er-thumb{background:#ffffff;border-color:#ff175a}",
    ".p3r-er-labels{display:flex;align-items:center;justify-content:space-between;gap:4px;padding:0 2px}",
    ".p3r-er-lbl{flex:1 1 0;text-align:center;font-size:10.5px;font-weight:800;font-style:italic;color:rgba(216,236,255,0.72);cursor:pointer;padding:2px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .12s ease}",
    ".p3r-er-lbl:first-child{text-align:left}",
    ".p3r-er-lbl:last-child{text-align:right}",
    ".p3r-er-lbl.active{color:#ffffff}",
    ".p3r-effort-rail[data-tier='2'] .p3r-er-lbl.active{color:#f4e818}",
    "@media (prefers-reduced-motion:reduce){.p3r-burst,#p3r-effort-canvas{display:none!important}.p3r-effort-pulse,html.p3r-streaming [data-p3r-bubble='assistant']::after,html.p3r-streaming #p3r-dsh-pill .p3r-mk-hp,html.p3r-streaming #p3r-dsh-pill .p3r-mk-sp,html.p3r-streaming .p3r-moon-disc,#p3r-dsh-card,[role='menu'],[role='listbox']{animation:none!important}html.p3r-btn-fx *,html.p3r-btn-fx *::before,html.p3r-btn-fx *::after{transition-duration:0.01ms!important}}"
  ].join("");

  function ensureStyles() {
    if (document.getElementById("p3r-dsh-skin-css")) return;
    var style = document.createElement("style");
    style.id = "p3r-dsh-skin-css";
    style.textContent = CSS_TEXT;
    (document.head || document.documentElement).appendChild(style);
  }

  /* ========================================================================
     TWO-STAGE ALIGNED VIDEO BACKGROUND ENGINE (EXPLICIT STATE MACHINE)
     videoPhase: "idle" | "booting" | "intro" | "loop"
     ======================================================================== */
  var introVid = null;
  var loopVid = null;
  var videoPhase = "idle";
  var hostHasIntro = null;
  var introGen = 0;
  var introWatchdog = 0;
  var introMetaHandler = null;
  var blobPromises = {};
  var blobUrls = {};
  var videoListenersBound = false;

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
          delete blobPromises[url];
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

  function clearIntroHooks() {
    if (introWatchdog) {
      clearTimeout(introWatchdog);
      introWatchdog = 0;
    }
    if (introVid && introMetaHandler) {
      introVid.removeEventListener("loadedmetadata", introMetaHandler);
      introMetaHandler = null;
    }
  }

  function switchToLoop(immediate, restartLoop) {
    if (videoPhase === "loop" && !restartLoop) return;
    videoPhase = "loop";
    introGen++;
    clearIntroHooks();
    if (!loopVid) return;

    assignVideoSrc(loopVid, LOOP_URL, function () {
      if (!loopVid || videoPhase !== "loop") return;
      try {
        if (restartLoop || (Math.abs((loopVid.currentTime || 0) - 0) > 0.12 && loopVid.paused)) {
          loopVid.currentTime = 0;
        }
      } catch (e) {}
      if (cfg.enabled) safePlay(loopVid);
    });

    function hideIntro() {
      if (!introVid || videoPhase !== "loop") return;
      if (immediate) {
        introVid.style.display = "none";
        try { introVid.pause(); } catch (e) {}
        return;
      }
      introVid.style.opacity = "0";
      var gen = introGen;
      setTimeout(function () {
        if (!introVid || videoPhase !== "loop" || gen !== introGen) return;
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
    // Host reported no intro clip (or previous load failed): restart loop cleanly without 404 or flash.
    if (hostHasIntro === false) {
      switchToLoop(true, true);
      return;
    }

    var gen = ++introGen;
    videoPhase = "intro";
    clearIntroHooks();

    try { loopVid.pause(); } catch (e) {}
    try { loopVid.currentTime = 0; } catch (e) {}

    introVid.style.display = "block";
    introVid.style.opacity = "1";

    function startAtDive() {
      introMetaHandler = null;
      if (gen !== introGen || videoPhase !== "intro") return;
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
      if (gen !== introGen || videoPhase !== "intro") return;
      if (introVid.error) {
        hostHasIntro = false;
        switchToLoop(true, true);
      } else if (introVid.readyState >= 1) {
        startAtDive();
      } else {
        introMetaHandler = startAtDive;
        introVid.addEventListener("loadedmetadata", startAtDive, { once: true });
      }
    });

    // Safety fallback if video stalls or fails on slow disks
    introWatchdog = setTimeout(function () {
      if (gen === introGen && videoPhase === "intro") switchToLoop(false);
    }, 8500);
  }

  // Started lazily the first time the skin is enabled, so a disabled skin never
  // downloads the backdrop videos into memory.
  function initVideoLifecycle() {
    if (videoPhase !== "idle" || !loopVid || !introVid) return;
    videoPhase = "booting";

    if (!videoListenersBound) {
      videoListenersBound = true;
      introVid.addEventListener("ended", function () {
        if (videoPhase === "intro") switchToLoop(false);
      });
      introVid.addEventListener("timeupdate", function () {
        if (videoPhase !== "intro" || !isFinite(introVid.duration) || introVid.duration <= 0) return;
        if (introVid.duration - introVid.currentTime <= 0.045) {
          switchToLoop(false);
        }
      });
      introVid.addEventListener("error", function () {
        hostHasIntro = false;
        if (videoPhase === "intro") switchToLoop(true, true);
      });
      window.addEventListener("pagehide", function () {
        for (var k in blobUrls) {
          if (Object.prototype.hasOwnProperty.call(blobUrls, k)) {
            try { URL.revokeObjectURL(blobUrls[k]); } catch (e) {}
          }
        }
        blobUrls = {};
        blobPromises = {};
      });
    }

    assignVideoSrc(loopVid, LOOP_URL, function () {
      if (videoPhase === "loop" && cfg.enabled && loopVid && loopVid.paused) {
        safePlay(loopVid);
      }
    });

    var bootGen = introGen;
    fetch(BOOT_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("boot-state failed");
        return res.json();
      })
      .then(function (data) {
        if (data && typeof data.hasIntro === "boolean") {
          hostHasIntro = data.hasIntro;
        }
        if (bootGen !== introGen || videoPhase !== "booting") return;
        var played = Boolean(data && data.introPlayed);
        if (hostHasIntro === false) {
          // Host reports no intro clip installed: skip the doomed request.
          switchToLoop(true);
        } else if (!played) {
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
        if (bootGen !== introGen || videoPhase !== "booting") return;
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
    htmlStyle.setProperty("--p3r-sidebar-border", cfg.sidebarScrim ? "rgba(123, 238, 255, 0.28)" : sVars.border);
    htmlStyle.setProperty(
      "--p3r-sidebar-scrim",
      cfg.sidebarScrim
        ? "linear-gradient(108deg, rgba(2, 20, 114, 0.80) 0%, rgba(5, 29, 134, 0.68) 66%, rgba(8, 44, 162, 0.36) 100%)"
        : "none"
    );

    htmlStyle.setProperty("--p3r-session-bg", cfg.chatScrim ? "transparent" : cVars.bg);
    htmlStyle.setProperty("--p3r-session-blur", cVars.blur);
    htmlStyle.setProperty("--p3r-session-border", cfg.chatScrim ? "rgba(123, 238, 255, 0.22)" : cVars.border);
    htmlStyle.setProperty(
      "--p3r-session-scrim",
      cfg.chatScrim
        ? "linear-gradient(108deg, rgba(2, 18, 96, 0.56) 0%, rgba(4, 24, 118, 0.34) 44%, rgba(6, 36, 138, 0.14) 100%)"
        : "none"
    );
    htmlStyle.setProperty("--p3r-card-bg", cfg.chatScrim ? "rgba(5, 24, 96, 0.74)" : cVars.cardBg);

    var lightSolidSidebar = !detectedDark && cfg.enabled && !cfg.sidebarScrim && cfg.sidebarGlass && cfg.panelAlpha >= 0.38;
    htmlStyle.setProperty("--p3r-sb-idle-color", lightSolidSidebar ? "#0b2478" : "#ffffff");
    htmlStyle.setProperty("--p3r-sb-idle-sub", lightSolidSidebar ? "rgba(6, 28, 196, 0.78)" : "#8df5ff");
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
    if (!root) return;
    if (!cfg.enabled || !cfg.btnFx) {
      var stale = root.querySelectorAll("[data-p3r-en]");
      for (var c = 0; c < stale.length; c++) stale[c].removeAttribute("data-p3r-en");
      return;
    }
    var items = root.querySelectorAll("button, [role='tab'], [role='menuitem'], [role='option'], span, h1, h2, h3, label");
    var limit = Math.min(items.length, 1400);
    var excludedSel = "pre, code, kbd, textarea, input, select, option, [contenteditable='true'], .cm-editor, .xterm, .katex, [class*='_brand'], [class*='_triggerEffort'], .p3r-effort-rail, p, li, td, th, blockquote, [class*='_markdown'], [class*='_prose'], [class*='_sessionRow'] [class*='_title'], [class*='_projectRow'] [class*='_title'], [class*='_rightbarCol'], [class*='_fileTree'], [class*='_changedFiles'], [class*='_deliverables'], [class*='_toolRow'], [class*='_fileName'], [class*='_fileMeta'], [data-p3r-bubble], [role='dialog'], [role='alertdialog']";
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
    document.documentElement.classList.remove("p3r-modal-open", "p3r-streaming");
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
    teardownEffortUi();
  }

  function isExcludedOverlay(el) {
    if (!el) return true;
    if (el.closest("#p3r-dsh-stage") || el.closest("#p3r-dsh-watermark") || el.closest("#p3r-dsh-dock") || el.closest("#p3r-dsh-wallet") || el.closest("#p3r-dsh-moon") || el.closest("#p3r-effort-float") || el.closest("#p3r-effort-canvas") || el.closest(".p3r-effort-rail")) return true;
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

    detectedDark = detectThemeDark();
    syncModalOpenState();
    syncGlassCssVars();
    ensureP3rBrandLockup();
    markChatBubbles(root);
    syncEffortUi();

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
     P3R INTERACTIVE BUTTON FX ENGINE (WATER PRISM SHARDS + CRYSTALLINE SYNTH)
     ======================================================================== */
  var fxLayer = null;
  var activeHoverTarget = null;
  var audioCtx = null;

  function fireSynthVoice(ctx, type, fStart, fEnd, t0, dur, peakGain) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(fStart, t0);
    if (fEnd !== fStart) {
      osc.frequency.exponentialRampToValueAtTime(fEnd, t0 + dur * 0.72);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peakGain, t0 + Math.min(0.008, dur * 0.18));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.008);
  }

  function playP3rTone(kind) {
    if (!cfg.enabled || !cfg.btnSfx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended" && typeof audioCtx.resume === "function") {
        audioCtx.resume().catch(function () {});
      }
      var now = audioCtx.currentTime;
      if (kind === "hover") {
        // Crisp P3R crystalline menu slide tick
        fireSynthVoice(audioCtx, "sine", 1318.5, 1760, now, 0.038, 0.022);
        fireSynthVoice(audioCtx, "triangle", 2637, 2960, now, 0.028, 0.008);
      } else if (kind === "open") {
        // Ascending aqua glass arpeggio for Dock expand
        fireSynthVoice(audioCtx, "triangle", 659.25, 659.25, now, 0.07, 0.036);
        fireSynthVoice(audioCtx, "sine", 987.77, 1318.51, now + 0.028, 0.09, 0.034);
      } else if (kind === "close") {
        // Soft descending water-drop on Dock collapse
        fireSynthVoice(audioCtx, "sine", 987.77, 659.25, now, 0.075, 0.030);
      } else if (kind === "toggle") {
        // Tactical double-blip switch confirmation
        fireSynthVoice(audioCtx, "triangle", 987.77, 1479.98, now, 0.068, 0.044);
        fireSynthVoice(audioCtx, "sine", 1975.53, 2217.46, now + 0.018, 0.055, 0.016);
      } else {
        // Signature P3R confirm chime (A5 -> E6 harmonic)
        fireSynthVoice(audioCtx, "triangle", 880, 1318.51, now, 0.088, 0.048);
        fireSynthVoice(audioCtx, "sine", 1760, 2637.02, now + 0.012, 0.075, 0.018);
      }
    } catch (e) {}
  }

  function isEditableInput(node) {
    if (!node || typeof node.closest !== "function") return false;
    return Boolean(
      node.closest(
        "input:not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']), textarea, select, [contenteditable='true']"
      )
    );
  }

  function resolveFxTarget(node) {
    if (!node || typeof node.closest !== "function") return null;
    if (isEditableInput(node)) return null;
    if (node.closest("#p3r-dsh-stage, #p3r-dsh-watermark, #p3r-fx-layer, #p3r-effort-float, #p3r-effort-canvas, .p3r-effort-rail, .cm-editor, .xterm, .dshwv-root, .dshwv-menu")) return null;
    var el = node.closest("button, [role='button'], [role='tab'], [role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox'], [role='option'], [role='treeitem'], [class*='_sessionRow'], summary, .p3r-row, #p3r-dsh-pill, #p3r-dsh-wallet, #p3r-dsh-moon");
    if (!el) return null;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") return null;
    var rect = el.getBoundingClientRect();
    if (rect.width < 12 || rect.height < 12 || rect.width > 680 || rect.height > 200) return null;
    return el;
  }

  function spawnClickBurst(x, y) {
    if (!fxLayer || !cfg.btnFx) return;
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      { tx: -26, ty: -18, rot: "-75deg", cls: "" },
      { tx: 28, ty: -16, rot: "85deg", cls: " alt" },
      { tx: 22, ty: 20, rot: "130deg", cls: "" },
      { tx: -22, ty: 19, rot: "-125deg", cls: " alt" },
      { tx: 2, ty: -29, rot: "45deg", cls: " sp" },
    ];
    for (var i = 0; i < vectors.length; i++) {
      var shard = document.createElement("span");
      shard.className = "p3r-burst-shard" + vectors[i].cls;
      shard.style.setProperty("--tx", vectors[i].tx + "px");
      shard.style.setProperty("--ty", vectors[i].ty + "px");
      shard.style.setProperty("--rot", vectors[i].rot);
      burst.appendChild(shard);
    }

    fxLayer.appendChild(burst);
    setTimeout(function () {
      if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 340);
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
        if (!cfg.enabled || !cfg.btnFx) return;
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
        if (!cfg.enabled) return;
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
        if (!cfg.enabled || !cfg.btnFx) return;
        var t = resolveFxTarget(e.target);
        if (t) activeHoverTarget = t;
      },
      true
    );

    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Escape") {
          if (cfg.dockExpanded) {
            setDockExpanded(false);
            return;
          }
          if (cfg.enabled && cfg.peek) {
            cfg.peek = false;
            var btnPeek = document.getElementById("p3r-btn-peek");
            if (btnPeek) {
              var lbl = btnPeek.querySelector("span") || btnPeek;
              lbl.textContent = tr("peek");
            }
            syncStateToDom();
            return;
          }
        }
        if (!cfg.enabled) return;
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
     P3R x CODEX THINKING EFFORT PULL RAIL & V2 ZERO-REFLOW PARTICLE ENGINE
     Localized bounded canvas + pre-allocated typed pool + compositor transforms
     ======================================================================== */
  var effortCanvas = null;
  var effortCtx = null;
  var effortCanvasOx = 0;
  var effortCanvasOy = 0;
  var effortCanvasW = 0;
  var effortCanvasH = 0;
  var effortDpr = 1;
  var effortRaf = 0;
  var effortFloatEl = null;
  var effortFloatCloseTimer = 0;
  var effortEngineBound = false;
  var suppressEffortClickUntil = 0;
  var activeEffortDrag = null;
  var effortIdleFrameTick = 0;

  var EFFORT_POOL_CAP = 128;
  var EP_MOTE = 0;
  var EP_DIAMOND = 1;
  var EP_SPARK = 2;
  var EP_RING = 3;
  var EP_SLASH = 4;
  var effortPoolCount = 0;
  var epKind = new Uint8Array(EFFORT_POOL_CAP);
  var epX = new Float32Array(EFFORT_POOL_CAP);
  var epY = new Float32Array(EFFORT_POOL_CAP);
  var epVx = new Float32Array(EFFORT_POOL_CAP);
  var epVy = new Float32Array(EFFORT_POOL_CAP);
  var epSize = new Float32Array(EFFORT_POOL_CAP);
  var epEndSize = new Float32Array(EFFORT_POOL_CAP);
  var epRot = new Float32Array(EFFORT_POOL_CAP);
  var epVrot = new Float32Array(EFFORT_POOL_CAP);
  var epLife = new Uint16Array(EFFORT_POOL_CAP);
  var epMaxLife = new Uint16Array(EFFORT_POOL_CAP);
  var epCol = new Uint8Array(EFFORT_POOL_CAP);
  var EP_PALETTE = ["#8df5ff", "#d4fbff", "#ffffff", "#3cf2ff", "#f4e818", "#ff175a"];
  var EP_TIER_COLS = [[0, 1, 2], [3, 0, 2], [4, 3, 2], [2, 4, 3, 5]];

  var EFFORT_TIERS = [
    { tag: "CALM", trailCount: 1, burstCount: 10, speed: 1.7, pitch: 587.33, slash: false },
    { tag: "TACTICAL", trailCount: 2, burstCount: 16, speed: 2.5, pitch: 783.99, slash: false },
    { tag: "CHARGED", trailCount: 3, burstCount: 22, speed: 3.3, pitch: 1046.5, slash: false },
    { tag: "THEURGIA", trailCount: 4, burstCount: 30, speed: 4.3, pitch: 1396.91, slash: true },
  ];

  function isReducedMotion() {
    return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function classifyEffortTier(label, effortId, index, total) {
    var probe = (String(effortId || "") + " " + String(label || "")).trim();
    if (/\b(?:max|xhigh|extra[\s_-]*high|ultra|overdrive)\b|极高|最高|超高/i.test(probe)) return 3;
    if (/\bhigh\b|高/i.test(probe)) return 2;
    if (/\b(?:medium|med|mid|normal|balanced|default|auto)\b|中|默认|自动|均衡/i.test(probe)) return 1;
    if (/\b(?:none|off)\b|关闭|无/i.test(probe)) return 0;
    if (/\b(?:minimal|min|low|fast|quick)\b|低|极速/i.test(probe)) {
      return typeof index === "number" && index > 0 ? 1 : 0;
    }
    if (typeof index === "number" && typeof total === "number" && total > 1) {
      var ratio = Math.max(0, Math.min(1, index / (total - 1)));
      if (ratio <= 0.18) return 0;
      if (ratio <= 0.55) return 1;
      if (ratio <= 0.85) return 2;
      return 3;
    }
    return 1;
  }

  function playEffortStepTone(tier, isCommit) {
    if (!cfg.enabled || !cfg.btnSfx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended" && typeof audioCtx.resume === "function") {
        audioCtx.resume().catch(function () {});
      }
      var prof = EFFORT_TIERS[Math.max(0, Math.min(3, tier || 0))];
      var now = audioCtx.currentTime;
      if (isCommit) {
        fireSynthVoice(audioCtx, "triangle", prof.pitch, prof.pitch * 1.5, now, 0.11, 0.046);
        fireSynthVoice(audioCtx, "sine", prof.pitch * 1.5, prof.pitch * 2.0, now + 0.022, 0.12, 0.026);
        if (tier >= 3) {
          fireSynthVoice(audioCtx, "sine", prof.pitch * 2.0, prof.pitch * 2.5, now + 0.045, 0.14, 0.022);
        }
      } else {
        fireSynthVoice(audioCtx, "triangle", prof.pitch * 0.96, prof.pitch * 1.18, now, 0.052, 0.032);
        fireSynthVoice(audioCtx, "sine", prof.pitch * 2.0, prof.pitch * 2.25, now + 0.008, 0.04, 0.012);
      }
    } catch (e) {}
  }

  function anchorEffortCanvas(rect) {
    if (!effortCanvas && document.body) {
      effortCanvas = document.createElement("canvas");
      effortCanvas.id = "p3r-effort-canvas";
      effortCanvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(effortCanvas);
      effortCtx = effortCanvas.getContext("2d");
    }
    if (!effortCanvas || !effortCtx) return false;
    var vw = window.innerWidth || 1280;
    var vh = window.innerHeight || 800;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var padX = 100;
    var padTop = 108;
    var padBot = 78;
    var ox = rect ? Math.max(0, Math.floor(rect.left - padX)) : 0;
    var oy = rect ? Math.max(0, Math.floor(rect.top - padTop)) : 0;
    var cw = rect ? Math.min(vw - ox, Math.ceil(rect.width + padX * 2)) : vw;
    var ch = rect ? Math.min(vh - oy, Math.ceil(rect.height + padTop + padBot)) : vh;
    if (cw < 160) cw = Math.min(vw - ox, 260);
    if (ch < 140) ch = Math.min(vh - oy, 220);

    effortCanvasOx = ox;
    effortCanvasOy = oy;
    effortCanvas.style.left = ox + "px";
    effortCanvas.style.top = oy + "px";
    if (cw !== effortCanvasW || ch !== effortCanvasH || dpr !== effortDpr) {
      effortCanvasW = cw;
      effortCanvasH = ch;
      effortDpr = dpr;
      effortCanvas.width = Math.round(cw * dpr);
      effortCanvas.height = Math.round(ch * dpr);
      effortCanvas.style.width = cw + "px";
      effortCanvas.style.height = ch + "px";
      effortCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    if (effortCanvas.style.visibility !== "visible") {
      effortCanvas.style.visibility = "visible";
    }
    return true;
  }

  function pushEffortParticle(kind, x, y, vx, vy, size, endSize, rot, vrot, maxLife, colIdx) {
    var idx = effortPoolCount < EFFORT_POOL_CAP ? effortPoolCount++ : ((Math.random() * EFFORT_POOL_CAP) | 0);
    epKind[idx] = kind;
    epX[idx] = x;
    epY[idx] = y;
    epVx[idx] = vx;
    epVy[idx] = vy;
    epSize[idx] = size;
    epEndSize[idx] = endSize;
    epRot[idx] = rot;
    epVrot[idx] = vrot;
    epLife[idx] = 0;
    epMaxLife[idx] = maxLife;
    epCol[idx] = colIdx;
    if (!effortRaf) {
      effortRaf = requestAnimationFrame(stepEffortParticles);
    }
  }

  function emitEffortTrail(x, y, vxHint, tier, anchorRect) {
    if (!cfg.enabled || !cfg.btnFx || isReducedMotion()) return;
    if (anchorRect && !effortCanvasW) anchorEffortCanvas(anchorRect);
    if (!effortCanvas || !effortCtx) {
      if (!anchorEffortCanvas(anchorRect || { left: x - 120, top: y - 20, width: 240, height: 40 })) return;
    } else if (effortCanvas.style.visibility !== "visible") {
      effortCanvas.style.visibility = "visible";
    }
    var tIdx = Math.max(0, Math.min(3, tier || 0));
    var prof = EFFORT_TIERS[tIdx];
    var cols = EP_TIER_COLS[tIdx];
    var clampedVx = Math.max(-12, Math.min(12, vxHint || 0));
    for (var i = 0; i < prof.trailCount; i++) {
      var isSpark = (i & 1) === 0;
      var cIdx = cols[(Math.random() * cols.length) | 0];
      pushEffortParticle(
        isSpark ? EP_SPARK : (Math.random() < 0.6 ? EP_DIAMOND : EP_MOTE),
        x + (Math.random() - 0.5) * 6,
        y + (Math.random() - 0.5) * 6,
        -clampedVx * (0.16 + Math.random() * 0.2) + (Math.random() - 0.5) * prof.speed * 1.3,
        -0.6 - Math.random() * prof.speed * 0.85,
        isSpark ? 2.0 : 2.6 + Math.random() * 2.4,
        0,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.24,
        16 + ((Math.random() * (12 + tIdx * 4)) | 0),
        cIdx
      );
    }
  }

  function emitEffortGlideArc(fromX, toX, y, tier) {
    if (!cfg.enabled || !cfg.btnFx || isReducedMotion()) return;
    var dist = toX - fromX;
    if (Math.abs(dist) < 10) return;
    var steps = Math.min(7, Math.max(3, Math.round(Math.abs(dist) / 28)));
    var dir = dist > 0 ? 1 : -1;
    for (var i = 1; i < steps; i++) {
      var f = i / steps;
      emitEffortTrail(fromX + dist * f, y, dir * 5.5, tier);
    }
  }

  function emitEffortBurst(x, y, tier, isCommit, anchorRect) {
    if (!cfg.enabled || !cfg.btnFx || isReducedMotion()) return;
    if (anchorRect) {
      anchorEffortCanvas(anchorRect);
    } else if (!effortCanvas || !effortCtx || x < effortCanvasOx + 24 || x > effortCanvasOx + effortCanvasW - 24 || y < effortCanvasOy + 24 || y > effortCanvasOy + effortCanvasH - 24) {
      anchorEffortCanvas({ left: x - 120, top: y - 20, width: 240, height: 40 });
    } else if (effortCanvas.style.visibility !== "visible") {
      effortCanvas.style.visibility = "visible";
    }
    if (!effortCanvas || !effortCtx) return;
    var tIdx = Math.max(0, Math.min(3, tier || 0));
    var prof = EFFORT_TIERS[tIdx];
    var cols = EP_TIER_COLS[tIdx];
    var count = isCommit ? prof.burstCount : Math.max(8, Math.round(prof.burstCount * 0.55));
    for (var i = 0; i < count; i++) {
      var ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.32;
      var spd = prof.speed * (0.55 + Math.random() * (isCommit ? 1.2 : 0.85));
      var kind = i % 3 === 0 ? EP_SPARK : (i % 3 === 1 ? EP_DIAMOND : EP_MOTE);
      pushEffortParticle(
        kind,
        x,
        y,
        Math.cos(ang) * spd,
        Math.sin(ang) * spd - 0.4,
        kind === EP_SPARK ? 2.3 : 3.0 + Math.random() * (isCommit ? 2.8 : 2.0),
        0,
        ang,
        (Math.random() - 0.5) * 0.26,
        18 + ((Math.random() * (isCommit ? 18 : 10)) | 0),
        cols[i % cols.length]
      );
    }
    pushEffortParticle(
      EP_RING,
      x,
      y,
      0,
      0,
      isCommit ? 12 : 9,
      isCommit ? (36 + tIdx * 10) : (26 + tIdx * 6),
      0,
      0,
      isCommit ? 20 : 15,
      tIdx >= 2 ? 4 : 3
    );
    if (isCommit && prof.slash) {
      pushEffortParticle(EP_SLASH, x, y, 0, 0, 16, 78, -0.28, 0, 15, 2);
    }
  }

  function stepEffortParticles() {
    effortRaf = 0;
    if (activeEffortDrag && typeof activeEffortDrag.flushPending === "function") {
      activeEffortDrag.flushPending();
    }
    if (!effortCtx || !effortCanvas) {
      effortPoolCount = 0;
      return;
    }
    effortCtx.clearRect(0, 0, effortCanvasW, effortCanvasH);
    if (!cfg.enabled || !cfg.btnFx || isReducedMotion()) {
      effortPoolCount = 0;
      effortCanvas.style.visibility = "hidden";
      return;
    }

    var ox = effortCanvasOx;
    var oy = effortCanvasOy;
    var write = 0;
    for (var i = 0; i < effortPoolCount; i++) {
      var life = epLife[i] + 1;
      var maxLife = epMaxLife[i];
      if (life >= maxLife) continue;
      var prog = life / maxLife;
      var alpha = 1 - prog * prog;
      var vx = epVx[i];
      var vy = epVy[i];
      var px = epX[i] + vx;
      var py = epY[i] + vy;
      vx *= 0.935;
      vy = vy * 0.935 - 0.035;
      var rot = epRot[i] + epVrot[i];
      var kind = epKind[i];
      var size = epSize[i];
      var endSize = epEndSize[i];
      var cIdx = epCol[i];

      if (write !== i) {
        epKind[write] = kind;
        epX[write] = px;
        epY[write] = py;
        epVx[write] = vx;
        epVy[write] = vy;
        epSize[write] = size;
        epEndSize[write] = endSize;
        epRot[write] = rot;
        epVrot[write] = epVrot[i];
        epLife[write] = life;
        epMaxLife[write] = maxLife;
        epCol[write] = cIdx;
      } else {
        epX[write] = px;
        epY[write] = py;
        epVx[write] = vx;
        epVy[write] = vy;
        epRot[write] = rot;
        epLife[write] = life;
      }
      write++;

      var lx = px - ox;
      var ly = py - oy;
      effortCtx.globalAlpha = alpha;
      var col = EP_PALETTE[cIdx];
      if (kind === EP_SPARK) {
        effortCtx.strokeStyle = col;
        effortCtx.lineWidth = Math.max(1, size * (1 - prog * 0.45));
        effortCtx.beginPath();
        effortCtx.moveTo(lx, ly);
        effortCtx.lineTo(lx - vx * 3.1, ly - vy * 3.1);
        effortCtx.stroke();
      } else if (kind === EP_DIAMOND) {
        var s = size * (1 - prog * 0.52);
        var cs = Math.cos(rot);
        var sn = Math.sin(rot);
        var sw = s * 0.72;
        effortCtx.fillStyle = col;
        effortCtx.beginPath();
        effortCtx.moveTo(lx + sn * s, ly - cs * s);
        effortCtx.lineTo(lx + cs * sw, ly + sn * sw);
        effortCtx.lineTo(lx - sn * s, ly + cs * s);
        effortCtx.lineTo(lx - cs * sw, ly - sn * sw);
        effortCtx.closePath();
        effortCtx.fill();
      } else if (kind === EP_MOTE) {
        var mr = size * 0.58 * (1 - prog * 0.4);
        effortCtx.fillStyle = col;
        effortCtx.beginPath();
        effortCtx.arc(lx, ly, mr, 0, 6.2832);
        effortCtx.fill();
      } else if (kind === EP_RING) {
        var inv = 1 - prog;
        var rSize = size + (endSize - size) * (1 - inv * inv * inv);
        var half = rSize * 0.5;
        effortCtx.strokeStyle = col;
        effortCtx.lineWidth = Math.max(1, 2.4 * inv);
        effortCtx.beginPath();
        effortCtx.moveTo(lx + half * 0.22, ly - half);
        effortCtx.lineTo(lx + half, ly);
        effortCtx.lineTo(lx - half * 0.22, ly + half);
        effortCtx.lineTo(lx - half, ly);
        effortCtx.closePath();
        effortCtx.stroke();
      } else if (kind === EP_SLASH) {
        var inv2 = 1 - prog;
        var len = size + (endSize - size) * (1 - inv2 * inv2);
        var th = 3.2 * (1 - prog * 0.5);
        var sc = Math.cos(rot);
        var ss = Math.sin(rot);
        effortCtx.lineWidth = th;
        effortCtx.strokeStyle = "#3cf2ff";
        effortCtx.beginPath();
        effortCtx.moveTo(lx - sc * len, ly - ss * len);
        effortCtx.lineTo(lx - sc * len * 0.32, ly - ss * len * 0.32);
        effortCtx.stroke();
        effortCtx.strokeStyle = "#ffffff";
        effortCtx.beginPath();
        effortCtx.moveTo(lx - sc * len * 0.32, ly - ss * len * 0.32);
        effortCtx.lineTo(lx + sc * len * 0.35, ly + ss * len * 0.35);
        effortCtx.stroke();
        effortCtx.strokeStyle = "#ff175a";
        effortCtx.beginPath();
        effortCtx.moveTo(lx + sc * len * 0.35, ly + ss * len * 0.35);
        effortCtx.lineTo(lx + sc * len, ly + ss * len);
        effortCtx.stroke();
      }
    }
    effortPoolCount = write;
    effortCtx.globalAlpha = 1;

    // Gentle paced shimmer while holding High / Theurgia during active drag
    if (activeEffortDrag && activeEffortDrag.tier >= 2) {
      effortIdleFrameTick++;
      var cadence = activeEffortDrag.tier >= 3 ? 3 : 5;
      if (effortIdleFrameTick % cadence === 0) {
        emitEffortTrail(activeEffortDrag.thumbX, activeEffortDrag.thumbY, 0, activeEffortDrag.tier);
      }
    }

    if (effortPoolCount > 0 || activeEffortDrag) {
      effortRaf = requestAnimationFrame(stepEffortParticles);
    } else {
      effortCanvas.style.visibility = "hidden";
    }
  }

  function getBridgeEffortSnapshot() {
    try {
      var bridge = window.__P3R_DSH_EFFORT__;
      if (bridge && typeof bridge.getSnapshot === "function") {
        return bridge.getSnapshot();
      }
    } catch (e) {}
    return null;
  }

  function resolveBridgeChoiceForItem(idx, label) {
    var snap = getBridgeEffortSnapshot();
    if (!snap || !snap.available || !Array.isArray(snap.choices) || !snap.choices.length) return null;
    if (idx >= 0 && idx < snap.choices.length) {
      var byIdx = snap.choices[idx];
      if (!label || !byIdx.label || String(byIdx.label).trim() === String(label).trim()) return byIdx;
    }
    for (var i = 0; i < snap.choices.length; i++) {
      if (String(snap.choices[i].label || "").trim() === String(label || "").trim()) return snap.choices[i];
    }
    return snap.choices[Math.max(0, Math.min(snap.choices.length - 1, idx))] || null;
  }

  function buildEffortRailController(choices, initialIndex, opts) {
    var total = choices.length;
    var safeIdx = Math.max(0, Math.min(total - 1, initialIndex >= 0 ? initialIndex : 0));
    var rail = document.createElement("div");
    rail.className = "p3r-effort-rail" + (opts && opts.inline ? " p3r-er-inline" : "");

    var head = document.createElement("div");
    head.className = "p3r-er-head";
    var titleEl = document.createElement("span");
    var badgeEl = document.createElement("span");
    badgeEl.className = "p3r-er-badge";
    var badgeSpan = document.createElement("span");
    badgeEl.appendChild(badgeSpan);
    head.appendChild(titleEl);
    head.appendChild(badgeEl);

    var trackHit = document.createElement("div");
    trackHit.className = "p3r-er-track-hit";
    trackHit.setAttribute("role", "slider");
    trackHit.setAttribute("tabindex", "0");
    trackHit.setAttribute("aria-valuemin", "0");
    trackHit.setAttribute("aria-valuemax", String(total - 1));
    trackHit.setAttribute("aria-valuenow", String(safeIdx));
    var track = document.createElement("div");
    track.className = "p3r-er-track";
    var fill = document.createElement("div");
    fill.className = "p3r-er-fill";
    var ticksWrap = document.createElement("div");
    ticksWrap.className = "p3r-er-ticks";
    var thumb = document.createElement("div");
    thumb.className = "p3r-er-thumb";
    track.appendChild(fill);
    track.appendChild(ticksWrap);
    track.appendChild(thumb);
    trackHit.appendChild(track);

    var labelsRow = document.createElement("div");
    labelsRow.className = "p3r-er-labels";
    var tickEls = [];
    var labelEls = [];
    for (var i = 0; i < total; i++) {
      var pct = total <= 1 ? 0 : (i / (total - 1)) * 100;
      var tick = document.createElement("span");
      tick.className = "p3r-er-tick";
      tick.style.left = pct + "%";
      ticksWrap.appendChild(tick);
      tickEls.push(tick);

      var lbl = document.createElement("span");
      lbl.className = "p3r-er-lbl";
      lbl.textContent = choices[i].label;
      lbl.setAttribute("data-idx", String(i));
      labelsRow.appendChild(lbl);
      labelEls.push(lbl);
    }

    rail.appendChild(head);
    rail.appendChild(trackHit);
    rail.appendChild(labelsRow);

    var currentIdx = -1;
    var currentTier = 1;
    var cachedRect = null;
    var lastThumbPx = 0;

    function refreshMetrics() {
      var r = track.getBoundingClientRect();
      if (r && r.width > 0) cachedRect = r;
      return cachedRect;
    }

    function render(rawT, snappedIdx, snapPop) {
      var idx = Math.max(0, Math.min(total - 1, snappedIdx));
      var idxChanged = idx !== currentIdx;
      var ch = choices[idx];
      if (idxChanged) {
        currentIdx = idx;
        currentTier = classifyEffortTier(ch.label, ch.effort, idx, total);
        var prof = EFFORT_TIERS[currentTier];
        rail.setAttribute("data-tier", String(currentTier));
        if (opts && opts.hostEl) opts.hostEl.setAttribute("data-tier", String(currentTier));
        titleEl.textContent = "THINKING // " + prof.tag;
        badgeSpan.textContent = ch.label;
        trackHit.setAttribute("aria-valuenow", String(idx));
        trackHit.setAttribute("aria-valuetext", ch.label);
        for (var k = 0; k < total; k++) {
          tickEls[k].classList.toggle("passed", k <= idx);
          tickEls[k].classList.toggle("active", k === idx);
          labelEls[k].classList.toggle("active", k === idx);
        }
      }

      var clamped = Math.max(0, Math.min(1, rawT));
      var over = rawT < 0 ? rawT : (rawT > 1 ? rawT - 1 : 0);
      var rubberPx = over !== 0 ? Math.tanh(over * 3.0) * 14 : 0;
      var tw = cachedRect && cachedRect.width > 0 ? cachedRect.width : 200;
      var pxX = clamped * tw + rubberPx;
      lastThumbPx = pxX;
      var scaleX = Math.max(0, Math.min(1.08, pxX / tw));
      fill.style.transform = "scaleX(" + scaleX.toFixed(4) + ")";
      thumb.style.transform =
        "translate3d(" +
        pxX.toFixed(1) +
        "px,0,0) skewX(14deg) rotate(45deg)" +
        (snapPop && !isReducedMotion() ? " scale(1.24)" : "");
    }

    function getThumbPoint() {
      var r = cachedRect || refreshMetrics();
      if (!r) return { x: 0, y: 0 };
      return { x: r.left + lastThumbPx, y: r.top + r.height * 0.5 };
    }

    // Initial layout render deferred cleanly once element is mounted
    render(total <= 1 ? 0 : safeIdx / (total - 1), safeIdx, false);

    return {
      el: rail,
      trackHit: trackHit,
      labelsRow: labelsRow,
      hasMetrics: function () { return Boolean(cachedRect && cachedRect.width > 0); },
      refreshMetrics: refreshMetrics,
      render: render,
      getThumbPoint: getThumbPoint,
      getIndex: function () { return currentIdx < 0 ? safeIdx : currentIdx; },
      getTier: function () { return currentTier; },
    };
  }

  function pulseComposerEffortBadge(triggerEl) {
    var badge = triggerEl ? triggerEl.querySelector("[class*=_triggerEffort]") : document.querySelector("[class*=_composerSeat] [class*=_triggerEffort], [class*=_composerHero] [class*=_triggerEffort]");
    if (!badge || isReducedMotion()) return;
    badge.classList.remove("p3r-effort-pulse");
    requestAnimationFrame(function () {
      if (badge.isConnected) badge.classList.add("p3r-effort-pulse");
    });
  }

  function ensureEffortFloat() {
    if (effortFloatEl && effortFloatEl.parentNode) return effortFloatEl;
    effortFloatEl = document.createElement("div");
    effortFloatEl.id = "p3r-effort-float";
    effortFloatEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(effortFloatEl);
    return effortFloatEl;
  }

  function closeEffortFloat(immediate) {
    if (effortFloatCloseTimer) {
      clearTimeout(effortFloatCloseTimer);
      effortFloatCloseTimer = 0;
    }
    if (!effortFloatEl) return;
    if (immediate) {
      effortFloatEl.classList.remove("open");
      effortFloatEl.setAttribute("aria-hidden", "true");
      return;
    }
    // Hold ~650ms after release so the full tier commit burst finishes cleanly
    effortFloatCloseTimer = setTimeout(function () {
      effortFloatCloseTimer = 0;
      if (effortFloatEl) {
        effortFloatEl.classList.remove("open");
        effortFloatEl.setAttribute("aria-hidden", "true");
      }
    }, 650);
  }

  function syncComposerEffortBadges() {
    var badges = document.querySelectorAll("[class*=_composerSeat] [class*=_triggerEffort], [class*=_composerHero] [class*=_triggerEffort]");
    var snap = getBridgeEffortSnapshot();
    var hint = tr("effortDragHint");
    for (var i = 0; i < badges.length; i++) {
      var b = badges[i];
      if (!cfg.enabled || !cfg.btnFx) {
        b.removeAttribute("data-p3r-effort-tier");
        continue;
      }
      if (b.hasAttribute("data-p3r-en")) b.removeAttribute("data-p3r-en");
      var idx = snap && snap.available ? snap.activeIndex : -1;
      var total = snap && snap.choices ? snap.choices.length : 0;
      var effId = snap && snap.effectiveEffort !== undefined ? snap.effectiveEffort : "";
      var tier = classifyEffortTier(effId ? "" : (b.textContent || ""), effId, idx, total);
      if (b.getAttribute("data-p3r-effort-tier") !== String(tier)) {
        b.setAttribute("data-p3r-effort-tier", String(tier));
      }
      if (b.getAttribute("title") !== hint) {
        b.setAttribute("title", hint);
      }
    }
  }

  function looksLikeEffortMenu(menu) {
    if (!menu || !menu.matches || !menu.matches("[role=menu]")) return null;
    if (menu.querySelector("[class*=_modelOption], [data-danger=true]")) return null;
    var radios = menu.querySelectorAll("button[role=menuitemradio]");
    if (radios.length < 2 || radios.length > 8) return null;
    var isModelSelectMenu = (menu.id && menu.id.slice(-5) === "-menu") || menu.getAttribute("data-p3r-effort-menu") === "1";
    var keywordHits = 0;
    for (var i = 0; i < radios.length; i++) {
      var txt = (radios[i].textContent || "").trim();
      if (/\b(?:none|off|minimal|low|medium|med|high|max|xhigh|extra[\s_-]*high|default|auto)\b|低|中|高|极高|最高|默认|关闭/i.test(txt)) {
        keywordHits++;
      }
    }
    if (!isModelSelectMenu && keywordHits < 2) return null;
    return radios;
  }

  function enhanceEffortMenus() {
    if (!cfg.enabled || !cfg.btnFx) return;
    var menus = document.querySelectorAll("[role=menu]");
    for (var m = 0; m < menus.length; m++) {
      var menu = menus[m];
      var radios = looksLikeEffortMenu(menu);
      var existing = menu.querySelector(".p3r-effort-rail.p3r-er-inline");
      if (!radios) {
        if (existing) existing.remove();
        if (menu.hasAttribute("data-p3r-effort-pane")) menu.removeAttribute("data-p3r-effort-pane");
        continue;
      }
      menu.setAttribute("data-p3r-effort-pane", "1");
      if (existing) continue;

      var choices = [];
      var activeIdx = 0;
      for (var i = 0; i < radios.length; i++) {
        var rBtn = radios[i];
        var label = (rBtn.textContent || "").trim() || ("L" + (i + 1));
        var effAttr = rBtn.getAttribute("data-effort") || label;
        choices.push({ key: "dom:" + i, effort: effAttr, label: label, btn: rBtn });
        if (rBtn.getAttribute("aria-checked") === "true") activeIdx = i;
      }

      (function (targetMenu, itemList, startIdx) {
        var ctrl = buildEffortRailController(itemList, startIdx, { inline: true });
        targetMenu.insertBefore(ctrl.el, targetMenu.firstChild);
        var initRect = ctrl.refreshMetrics();
        if (initRect) {
          ctrl.render(itemList.length <= 1 ? 0 : startIdx / (itemList.length - 1), startIdx, false);
        }
        requestAnimationFrame(function () {
          if (!ctrl.el.isConnected) return;
          var r = ctrl.refreshMetrics();
          ctrl.render(itemList.length <= 1 ? 0 : startIdx / (itemList.length - 1), startIdx, false);
          if (r) anchorEffortCanvas(r);
          // Hand focus smoothly from visually-hidden radio row onto the slider so keyboard works natively
          if (document.activeElement && targetMenu.contains(document.activeElement) && document.activeElement !== ctrl.trackHit) {
            try { ctrl.trackHit.focus({ preventScroll: true }); } catch (err) {}
          }
        });

        function commitInlineIndex(idx, emitPt, fromPt, skipFx) {
          var safe = Math.max(0, Math.min(itemList.length - 1, idx));
          var tier = classifyEffortTier(itemList[safe].label, itemList[safe].effort, safe, itemList.length);
          if (!skipFx) {
            var pt = emitPt || ctrl.getThumbPoint();
            emitEffortBurst(pt.x, pt.y, tier, true);
            if (fromPt) emitEffortGlideArc(fromPt.x, pt.x, pt.y, tier);
            playEffortStepTone(tier, true);
          }

          // Direct ModelDirectory commit keeps Effort popover OPEN (bypasses ModelSelect closeAfterSelection)
          var committedViaBridge = false;
          try {
            var bridge = window.__P3R_DSH_EFFORT__;
            if (bridge && typeof bridge.selectEffort === "function") {
              var matched = resolveBridgeChoiceForItem(safe, itemList[safe].label);
              if (matched) {
                bridge.selectEffort(matched.effort);
                committedViaBridge = true;
              }
            }
          } catch (err) {}

          if (!committedViaBridge) {
            var targetBtn = itemList[safe].btn;
            if (targetBtn && targetBtn.isConnected && !targetBtn.disabled) {
              targetBtn.click();
            }
          }
          pulseComposerEffortBadge(null);
        }

        // Sync rail when ModelDirectory updates externally while popover stays open
        function onExternalEffortSync(ev) {
          if (!ctrl.el.isConnected) {
            window.removeEventListener("p3r-dsh-effort-change", onExternalEffortSync);
            return;
          }
          if (activeEffortDrag) return;
          var detail = ev && ev.detail;
          if (!detail || !detail.available || detail.activeIndex < 0 || detail.activeIndex >= itemList.length) return;
          if (detail.activeIndex === ctrl.getIndex()) return;
          ctrl.el.classList.remove("p3r-er-dragging");
          ctrl.render(itemList.length <= 1 ? 0 : detail.activeIndex / (itemList.length - 1), detail.activeIndex, false);
        }
        window.addEventListener("p3r-dsh-effort-change", onExternalEffortSync);

        // WAI-ARIA role="slider" keyboard control (Esc / Shift+Tab bubble naturally to ModelSelect)
        ctrl.trackHit.addEventListener("keydown", function (kv) {
          var cur = ctrl.getIndex();
          var next = cur;
          if (kv.key === "ArrowLeft" || kv.key === "ArrowDown") next = Math.max(0, cur - 1);
          else if (kv.key === "ArrowRight" || kv.key === "ArrowUp") next = Math.min(itemList.length - 1, cur + 1);
          else if (kv.key === "Home") next = 0;
          else if (kv.key === "End") next = itemList.length - 1;
          else return;
          kv.preventDefault();
          kv.stopPropagation();
          if (next === cur) return;
          if (!ctrl.hasMetrics()) {
            var kr = ctrl.refreshMetrics();
            if (kr) anchorEffortCanvas(kr);
          }
          var fromPt = ctrl.getThumbPoint();
          ctrl.el.classList.remove("p3r-er-dragging");
          ctrl.render(itemList.length <= 1 ? 0 : next / (itemList.length - 1), next, false);
          commitInlineIndex(next, ctrl.getThumbPoint(), fromPt, false);
        });

        // Clicking labels directly glides smoothly + commits with arc & burst while keeping popover open
        ctrl.labelsRow.addEventListener("pointerdown", function (ev) {
          ev.stopPropagation();
          var lbl = ev.target && ev.target.closest ? ev.target.closest(".p3r-er-lbl") : null;
          if (!lbl) return;
          var idx = parseInt(lbl.getAttribute("data-idx"), 10);
          if (!isFinite(idx)) return;
          if (idx === ctrl.getIndex()) return;
          if (!ctrl.hasMetrics()) {
            var lr = ctrl.refreshMetrics();
            if (lr) anchorEffortCanvas(lr);
          }
          var fromPt = ctrl.getThumbPoint();
          ctrl.el.classList.remove("p3r-er-dragging");
          ctrl.render(itemList.length <= 1 ? 0 : idx / (itemList.length - 1), idx, false);
          commitInlineIndex(idx, ctrl.getThumbPoint(), fromPt, false);
        });

        // rAF-coalesced, zero-reflow drag & instant-response single-click glide on inline Codex energy track
        ctrl.trackHit.addEventListener("pointerdown", function (ev) {
          if (ev.button !== 0) return;
          ev.preventDefault();
          ev.stopPropagation();
          try { ctrl.trackHit.focus({ preventScroll: true }); } catch (err) {}
          var total = itemList.length;
          var trRect = ctrl.refreshMetrics();
          if (!trRect || !trRect.width) return;
          anchorEffortCanvas(trRect);

          var downX = ev.clientX;
          var fromPt = ctrl.getThumbPoint();
          var startIdx = ctrl.getIndex();
          var lastSnap = startIdx;
          var lastAppliedX = downX;
          var pendingClientX = null;
          var didDrag = false;

          // Instant 0ms glide + arc + burst on pointerdown when tapping a different notch
          var initRawT = (downX - trRect.left) / trRect.width;
          var initSnap = Math.round(Math.max(0, Math.min(1, initRawT)) * (total - 1));
          ctrl.el.classList.remove("p3r-er-dragging");
          ctrl.render(total <= 1 ? 0 : initSnap / (total - 1), initSnap, false);
          lastSnap = initSnap;
          var downBurstFired = initSnap !== startIdx;
          if (downBurstFired) {
            var toPt = ctrl.getThumbPoint();
            var initTier = ctrl.getTier();
            emitEffortBurst(toPt.x, toPt.y, initTier, true, trRect);
            emitEffortGlideArc(fromPt.x, toPt.x, toPt.y, initTier);
            playEffortStepTone(initTier, true);
          }

          function applyClientX(clientX) {
            var rawT = (clientX - trRect.left) / trRect.width;
            var clamped = Math.max(0, Math.min(1, rawT));
            var snapIdx = Math.round(clamped * (total - 1));
            var changed = snapIdx !== lastSnap;
            ctrl.render(rawT, snapIdx, changed);
            var pt = ctrl.getThumbPoint();
            var tier = ctrl.getTier();
            if (activeEffortDrag) {
              activeEffortDrag.thumbX = pt.x;
              activeEffortDrag.thumbY = pt.y;
              activeEffortDrag.tier = tier;
            }
            if (changed) {
              lastSnap = snapIdx;
              emitEffortBurst(pt.x, pt.y, tier, false);
              playEffortStepTone(tier, false);
            } else {
              emitEffortTrail(pt.x, pt.y, clientX - lastAppliedX, tier);
            }
            lastAppliedX = clientX;
          }

          activeEffortDrag = {
            thumbX: ctrl.getThumbPoint().x,
            thumbY: trRect.top + trRect.height * 0.5,
            tier: ctrl.getTier(),
            flushPending: function () {
              if (pendingClientX === null) return;
              var cx = pendingClientX;
              pendingClientX = null;
              applyClientX(cx);
            },
          };

          function onMove(mv) {
            mv.preventDefault();
            if (!didDrag) {
              if (Math.abs(mv.clientX - downX) < 4) return;
              didDrag = true;
              ctrl.el.classList.add("p3r-er-dragging");
            }
            pendingClientX = mv.clientX;
            if (!effortRaf) effortRaf = requestAnimationFrame(stepEffortParticles);
          }

          function onEnd() {
            window.removeEventListener("pointermove", onMove, true);
            window.removeEventListener("pointerup", onEnd, true);
            window.removeEventListener("pointercancel", onCancel, true);
            if (didDrag && pendingClientX !== null) {
              applyClientX(pendingClientX);
              pendingClientX = null;
            }
            activeEffortDrag = null;
            ctrl.el.classList.remove("p3r-er-dragging");
            var finalIdx = ctrl.getIndex();
            ctrl.render(total <= 1 ? 0 : finalIdx / (total - 1), finalIdx, false);
            if (finalIdx !== startIdx) {
              commitInlineIndex(finalIdx, ctrl.getThumbPoint(), null, !didDrag && downBurstFired);
            }
          }

          function onCancel() {
            window.removeEventListener("pointermove", onMove, true);
            window.removeEventListener("pointerup", onEnd, true);
            window.removeEventListener("pointercancel", onCancel, true);
            pendingClientX = null;
            activeEffortDrag = null;
            ctrl.el.classList.remove("p3r-er-dragging");
          }

          window.addEventListener("pointermove", onMove, true);
          window.addEventListener("pointerup", onEnd, true);
          window.addEventListener("pointercancel", onCancel, true);
        });
      })(menu, choices, activeIdx);
    }
  }

  function syncEffortUi() {
    if (!cfg.enabled || !cfg.btnFx) {
      teardownEffortUi();
      return;
    }
    syncComposerEffortBadges();
    enhanceEffortMenus();
  }

  function teardownEffortUi() {
    activeEffortDrag = null;
    closeEffortFloat(true);
    if (effortRaf) {
      cancelAnimationFrame(effortRaf);
      effortRaf = 0;
    }
    effortPoolCount = 0;
    if (effortCtx && effortCanvas) {
      effortCtx.clearRect(0, 0, effortCanvasW, effortCanvasH);
      effortCanvas.style.visibility = "hidden";
    }
    var panes = document.querySelectorAll("[data-p3r-effort-pane]");
    for (var pIdx = 0; pIdx < panes.length; pIdx++) {
      panes[pIdx].removeAttribute("data-p3r-effort-pane");
    }
    var rails = document.querySelectorAll(".p3r-effort-rail.p3r-er-inline");
    for (var i = 0; i < rails.length; i++) {
      rails[i].remove();
    }
    var badges = document.querySelectorAll("[data-p3r-effort-tier]");
    for (var j = 0; j < badges.length; j++) {
      badges[j].removeAttribute("data-p3r-effort-tier");
    }
  }

  function installEffortDragEngine() {
    if (effortEngineBound) return;
    effortEngineBound = true;

    // Warm catalog lazily on hover so direct horizontal pull has 0ms latency
    document.addEventListener(
      "pointerenter",
      function (e) {
        if (!cfg.enabled || !cfg.btnFx) return;
        var el = e.target && e.target.closest ? e.target.closest("[class*=_composerSeat] button[class*=_trigger], [class*=_composerHero] button[class*=_trigger]") : null;
        if (!el || !el.querySelector("[class*=_triggerEffort]")) return;
        try {
          var bridge = window.__P3R_DSH_EFFORT__;
          if (bridge && typeof bridge.ensureLoaded === "function") bridge.ensureLoaded();
        } catch (err) {}
      },
      true
    );

    // Suppress trailing click only when a horizontal Codex pull actually occurred
    document.addEventListener(
      "click",
      function (e) {
        if (performance.now() <= suppressEffortClickUntil) {
          var trg = e.target && e.target.closest ? e.target.closest("button[class*=_trigger]") : null;
          if (trg) {
            e.preventDefault();
            e.stopPropagation();
            suppressEffortClickUntil = 0;
          }
        }
      },
      true
    );

    // Direct Codex-style horizontal pull on composer Model/Effort trigger (rAF-coalesced, zero reflow)
    document.addEventListener(
      "pointerdown",
      function (e) {
        if (!cfg.enabled || !cfg.btnFx || e.button !== 0) return;
        var target = e.target;
        if (!target || typeof target.closest !== "function") return;
        var trigger = target.closest("[class*=_composerSeat] button[class*=_trigger], [class*=_composerHero] button[class*=_trigger]");
        if (!trigger || trigger.disabled) return;
        if (!trigger.querySelector("[class*=_triggerEffort]")) return;

        var snap = getBridgeEffortSnapshot();
        if (!snap || !snap.available || !snap.choices || snap.choices.length < 2) {
          try {
            var bridge = window.__P3R_DSH_EFFORT__;
            if (bridge && typeof bridge.ensureLoaded === "function") bridge.ensureLoaded();
          } catch (err) {}
          return;
        }

        var downX = e.clientX;
        var downY = e.clientY;
        var dragging = false;
        var ctrl = null;
        var cachedTrRect = null;
        var choices = snap.choices;
        var total = choices.length;
        var startIdx = snap.activeIndex >= 0 ? snap.activeIndex : 0;
        var lastSnap = startIdx;
        var lastAppliedX = downX;
        var pendingMoveX = null;
        var pointerOffsetX = 0;

        function applyFloatMove(clientX) {
          if (!cachedTrRect || !cachedTrRect.width) return;
          var mappedX = clientX + pointerOffsetX;
          var rawT = (mappedX - cachedTrRect.left) / cachedTrRect.width;
          var clamped = Math.max(0, Math.min(1, rawT));
          var snapIdx = Math.round(clamped * (total - 1));
          var changed = snapIdx !== lastSnap;
          ctrl.render(rawT, snapIdx, changed);
          var pt = ctrl.getThumbPoint();
          var tier = ctrl.getTier();
          if (activeEffortDrag) {
            activeEffortDrag.thumbX = pt.x;
            activeEffortDrag.thumbY = pt.y;
            activeEffortDrag.tier = tier;
          }
          if (changed) {
            lastSnap = snapIdx;
            emitEffortBurst(pt.x, pt.y, tier, false);
            playEffortStepTone(tier, false);
          } else {
            emitEffortTrail(pt.x, pt.y, clientX - lastAppliedX, tier);
          }
          lastAppliedX = clientX;
        }

        function startFloatingPull(curX) {
          dragging = true;
          if (effortFloatCloseTimer) {
            clearTimeout(effortFloatCloseTimer);
            effortFloatCloseTimer = 0;
          }
          var host = ensureEffortFloat();
          host.innerHTML = "";
          ctrl = buildEffortRailController(choices, startIdx, { inline: false, hostEl: host });
          ctrl.el.classList.add("p3r-er-dragging");
          host.appendChild(ctrl.el);

          var vw = window.innerWidth || 1280;
          var trgRect = trigger.getBoundingClientRect();
          host.style.left = "0px";
          host.style.top = "0px";
          var fW = Math.max(258, host.offsetWidth || 276);
          var fH = host.offsetHeight || 86;

          var startRatio = total <= 1 ? 0 : startIdx / (total - 1);
          var estTrackPad = 22;
          var estTrackW = Math.max(120, fW - estTrackPad * 2);
          var desiredLeft = Math.round(downX - (estTrackPad + startRatio * estTrackW));
          var clampedLeft = Math.max(12, Math.min(vw - fW - 12, desiredLeft));
          var top = Math.max(12, Math.round(trgRect.top - fH - 12));
          host.style.left = clampedLeft + "px";
          host.style.top = top + "px";
          host.setAttribute("aria-hidden", "false");
          host.classList.add("open");

          cachedTrRect = ctrl.refreshMetrics();
          ctrl.render(startRatio, startIdx, false);
          if (cachedTrRect) {
            anchorEffortCanvas(cachedTrRect);
            var startNotchX = cachedTrRect.left + startRatio * cachedTrRect.width;
            pointerOffsetX = startNotchX - downX;
          }

          var initPt = ctrl.getThumbPoint();
          var initTier = ctrl.getTier();
          activeEffortDrag = {
            thumbX: initPt.x,
            thumbY: initPt.y,
            tier: initTier,
            flushPending: function () {
              if (pendingMoveX === null) return;
              var cx = pendingMoveX;
              pendingMoveX = null;
              applyFloatMove(cx);
            },
          };
          emitEffortTrail(initPt.x, initPt.y, curX - downX, initTier);
          if (!effortRaf && !isReducedMotion()) {
            effortRaf = requestAnimationFrame(stepEffortParticles);
          }
          try {
            var sel = window.getSelection && window.getSelection();
            if (sel && sel.removeAllRanges) sel.removeAllRanges();
          } catch (err) {}
        }

        function onMove(mv) {
          var dx = mv.clientX - downX;
          var dy = mv.clientY - downY;
          if (!dragging) {
            if (Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx) * 1.4) {
              cleanup(false);
              return;
            }
            if (Math.abs(dx) < 6) return;
            startFloatingPull(mv.clientX);
          }
          mv.preventDefault();
          pendingMoveX = mv.clientX;
          if (!effortRaf) effortRaf = requestAnimationFrame(stepEffortParticles);
        }

        function cleanup(commit) {
          window.removeEventListener("pointermove", onMove, true);
          window.removeEventListener("pointerup", onUp, true);
          window.removeEventListener("pointercancel", onCancel, true);
          window.removeEventListener("keydown", onKey, true);
          if (dragging && pendingMoveX !== null) {
            applyFloatMove(pendingMoveX);
            pendingMoveX = null;
          }
          activeEffortDrag = null;
          if (!dragging || !ctrl) return;
          suppressEffortClickUntil = performance.now() + 300;
          if (commit) {
            ctrl.el.classList.remove("p3r-er-dragging");
            var finalIdx = ctrl.getIndex();
            var chosen = choices[finalIdx];
            var tier = ctrl.getTier();
            ctrl.render(total <= 1 ? 0 : finalIdx / (total - 1), finalIdx, false);
            var pt = ctrl.getThumbPoint();
            emitEffortBurst(pt.x, pt.y, tier, true, cachedTrRect);
            playEffortStepTone(tier, true);
            if (chosen && finalIdx !== startIdx) {
              try {
                var bridge = window.__P3R_DSH_EFFORT__;
                if (bridge && typeof bridge.selectEffort === "function") {
                  bridge.selectEffort(chosen.effort);
                }
              } catch (err) {}
            }
            pulseComposerEffortBadge(trigger);
            closeEffortFloat(false);
          } else {
            closeEffortFloat(true);
          }
        }

        function onUp() { cleanup(true); }
        function onCancel() { cleanup(false); }
        function onKey(kv) {
          if (kv.key === "Escape") {
            kv.preventDefault();
            cleanup(false);
          }
        }

        window.addEventListener("pointermove", onMove, true);
        window.addEventListener("pointerup", onUp, true);
        window.addEventListener("pointercancel", onCancel, true);
        window.addEventListener("keydown", onKey, true);
      },
      true
    );

    window.addEventListener("p3r-dsh-effort-change", function () {
      syncComposerEffortBadges();
    });
  }

  /* ========================================================================
     P3R MOON PHASE / DARK HOUR MICRO-HUD + STREAMING STATE COUPLING
     ======================================================================== */
  var moonEl = null;
  var moonDateEl = null;
  var moonSubEl = null;
  var moonShadowEl = null;
  var moonTimer = 0;
  var streamingTimer = 0;

  function computeLunarPhase(date) {
    var d = date || new Date();
    // Known new moon epoch: 2000-01-06T18:14:00Z, synodic month = 29.53058867 days
    var synodic = 29.53058867;
    var daysSince = (d.getTime() - Date.UTC(2000, 0, 6, 18, 14, 0)) / 86400000;
    var phase = ((daysSince % synodic) + synodic) % synodic / synodic; // 0..1
    var label = "HALF MOON";
    if (phase < 0.04 || phase >= 0.96) label = "NEW MOON";
    else if (phase < 0.21) label = "WAXING";
    else if (phase < 0.29) label = "HALF MOON";
    else if (phase < 0.46) label = "GIBBOUS";
    else if (phase < 0.54) label = "FULL MOON";
    else if (phase < 0.71) label = "WANING";
    else if (phase < 0.79) label = "HALF MOON";
    else label = "CRESCENT";
    // Horizontal shadow disc offset in % (-100%..100% hides shadow near Full Moon)
    var shiftPct = phase <= 0.5 ? -Math.round((phase * 2) * 100) : Math.round(((1 - phase) * 2) * 100);
    return { phase: phase, label: label, shiftPct: shiftPct };
  }

  function updateMoonHudContent() {
    if (!moonEl) return;
    var now = new Date();
    var weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    var mm = String(now.getMonth() + 1);
    var dd = String(now.getDate());
    var lunar = computeLunarPhase(now);
    if (moonDateEl) moonDateEl.textContent = mm + "/" + dd + " · " + weekdays[now.getDay()];
    var isStreaming = document.documentElement.classList.contains("p3r-streaming");
    if (moonSubEl) {
      moonSubEl.textContent = isStreaming ? "DARK HOUR · SYNC" : lunar.label + " · READY";
    }
    if (moonShadowEl) {
      if (lunar.label === "FULL MOON") {
        moonShadowEl.style.transform = "translateX(120%)";
      } else if (lunar.label === "NEW MOON") {
        moonShadowEl.style.transform = "translateX(0%)";
      } else {
        moonShadowEl.style.transform = "translateX(" + lunar.shiftPct + "%)";
      }
    }
  }

  function pulseStreamingState() {
    if (!cfg.enabled) return;
    var html = document.documentElement;
    if (!html.classList.contains("p3r-streaming")) {
      html.classList.add("p3r-streaming");
      updateMoonHudContent();
    }
    if (streamingTimer) clearTimeout(streamingTimer);
    streamingTimer = setTimeout(function () {
      streamingTimer = 0;
      html.classList.remove("p3r-streaming");
      updateMoonHudContent();
    }, 1250);
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
    if (code === "CNY" || code === "JPY") return "¥";
    return /^[A-Z]{3}$/.test(code) ? code + " " : "¥";
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

  function collectLayoutObstacles(centerCol, includePill, includeMoon) {
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
    if (includeMoon) selectors.unshift("#p3r-dsh-moon");
    for (var i = 0; i < selectors.length; i++) {
      var nodes = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].classList && nodes[j].classList.contains("p3r-hidden")) continue;
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
    var activePointerId = null;

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
      if (e.button !== 0 || activePointerId !== null) return;
      var pointerId = e.pointerId;
      activePointerId = pointerId;
      var rect = targetEl.getBoundingClientRect();
      var startX = e.clientX;
      var startY = e.clientY;
      var origLeft = rect.left;
      var origTop = rect.top;
      var moved = false;
      var captured = false;

      if (typeof handleEl.setPointerCapture === "function") {
        try {
          handleEl.setPointerCapture(pointerId);
          captured = true;
        } catch (err) {}
      }

      function onMove(ev) {
        if (ev.pointerId !== pointerId) return;
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

      function onEnd(ev) {
        if (ev && ev.pointerId !== undefined && ev.pointerId !== pointerId) return;
        activePointerId = null;
        window.removeEventListener("pointermove", onMove, true);
        window.removeEventListener("pointerup", onEnd, true);
        window.removeEventListener("pointercancel", onEnd, true);
        window.removeEventListener("blur", onEnd);
        if (captured && typeof handleEl.releasePointerCapture === "function") {
          try { handleEl.releasePointerCapture(pointerId); } catch (err) {}
        }
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
      window.addEventListener("blur", onEnd);
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
    var obstacles = collectLayoutObstacles(centerCol, true, true);

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

  function positionMoonWidget() {
    if (!moonEl) return;
    if (!cfg.enabled || !cfg.moonHud || cfg.peek) {
      moonEl.classList.add("p3r-hidden");
      return;
    }
    var vw = window.innerWidth || 1280;
    var vh = window.innerHeight || 800;
    if (vw < 680 || vh < 380) {
      moonEl.classList.add("p3r-hidden");
      return;
    }

    var mr = moonEl.getBoundingClientRect();
    var mW = Math.max(146, Math.round(mr.width || 158));
    var mH = Math.max(32, Math.round(mr.height || 36));

    if (customPos.moon) {
      var pinned = clampWidgetCoords(customPos.moon.left, customPos.moon.top, mW, mH);
      moonEl.style.left = pinned.left + "px";
      moonEl.style.top = pinned.top + "px";
      moonEl.style.right = "auto";
      moonEl.style.bottom = "auto";
      moonEl.classList.remove("p3r-hidden");
      return;
    }

    var centerCol = document.querySelector("[class*='_centerCol']");
    var cr = centerCol ? centerCol.getBoundingClientRect() : { left: 0, right: vw, top: 0, bottom: vh };
    var hdr = centerCol ? centerCol.querySelector("header") : document.querySelector("header");
    var hdrRect = hdr ? hdr.getBoundingClientRect() : { top: 0, bottom: 52, height: 52 };
    var headerTop = Math.max(6, Math.round(hdrRect.top + Math.max(0, (hdrRect.height - mH) / 2)));

    // Prefer sitting cleanly inside the center header right-of-center zone, avoiding header buttons/badges
    var hdrObstacles = [];
    var rightAnchor = cr.right - 16;
    var midX = (cr.left + cr.right) / 2;
    if (hdr) {
      var hItems = hdr.querySelectorAll("button, a, [class*='_previewBadge'], [class*='_titleCluster'], [class*='_titleGroup'], [class*='_crumbs'], [class*='_headerUtilities']");
      for (var h = 0; h < hItems.length; h++) {
        var r = hItems[h].getBoundingClientRect();
        if (r.width >= 8 && r.height >= 8 && r.width < hdrRect.width * 0.68) {
          hdrObstacles.push(r);
          if ((r.left + r.right) / 2 > midX && r.left < rightAnchor) rightAnchor = r.left;
        }
      }
    }
    var candidates = [
      { left: Math.round(rightAnchor - mW - 14), top: headerTop },
      { left: Math.round(cr.right - mW - 168), top: headerTop },
      { left: Math.round(cr.right - mW - 22), top: headerTop },
      { left: Math.round(cr.right - mW - 108), top: Math.max(14, Math.round(hdrRect.bottom + 12)) },
    ];
    var chosen = null;
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (c.left < cr.left + 12 || c.left + mW > cr.right - 8) continue;
      if (c.top < 4 || c.top + mH > vh - 10) continue;
      var box = { left: c.left, top: c.top, right: c.left + mW, bottom: c.top + mH };
      var blocked = false;
      for (var k = 0; k < hdrObstacles.length; k++) {
        if (rectIntersects(box, hdrObstacles[k], 8)) {
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
      moonEl.classList.add("p3r-hidden");
      return;
    }
    moonEl.style.left = chosen.left + "px";
    moonEl.style.top = chosen.top + "px";
    moonEl.style.right = "auto";
    moonEl.style.bottom = "auto";
    moonEl.classList.remove("p3r-hidden");
  }

  function positionOverlayWidgets() {
    positionDockWidget();
    positionMoonWidget();
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
      watermark: "P3R 出界建筑水印",
      moonHud: "P3R 月相与状态 HUD",
      glassOpacity: "毛玻璃透明度",
      transparentZero: "0% (完全透明)",
      blurStrength: "模糊强度",
      peek: "全景预览",
      restore: "恢复界面",
      replay: "重播落水",
      resetPos: "重置位置",
      close: "收起",
      pillTitle: "Persona 3 Reload 设置（按住拖拽可移动位置）",
      moonTitle: "P3R 实时月相与会话同步 HUD（按住拖拽可移动位置）",
      effortDragHint: "左右按住拖拽切换思考等级 / 点击打开菜单",
      walletDefaultTitle: "当前余额（点击刷新 / 按住拖拽移动）",
      walletBalancePrefix: "当前余额: ",
      walletBonus: "含赠金 ",
      walletTodayUsage: "今日消耗: ",
      walletDragHint: "（点击刷新 / 按住拖拽移动）",
      walletRefreshFailed: "余额暂不可用（点击重试 / 按住拖拽移动）"
    },
    en: {
      enabled: "Dynamic Video Backdrop",
      chatGlass: "Chat Frosted Glass",
      chatScrim: "Chat Deep-Blue Scrim",
      sidebarGlass: "Sidebar Frosted Glass",
      sidebarScrim: "Sidebar Deep-Blue Scrim",
      btnFx: "P3R Button & Menu FX",
      btnSfx: "P3R Button SFX",
      watermark: "P3R Backdrop Watermark",
      moonHud: "P3R Moon & Sync HUD",
      glassOpacity: "Glass Opacity",
      transparentZero: "0% (Transparent)",
      blurStrength: "Blur Strength",
      peek: "Peek Backdrop",
      restore: "Restore UI",
      replay: "Replay Intro",
      resetPos: "Reset Pos",
      close: "Close",
      pillTitle: "Persona 3 Reload Settings (Drag to move)",
      moonTitle: "P3R Live Moon Phase & Sync HUD (Drag to move)",
      effortDragHint: "Drag left/right to shift thinking effort / Click for menu",
      walletDefaultTitle: "Current Balance (Click to refresh / Drag to move)",
      walletBalancePrefix: "Balance: ",
      walletBonus: "Bonus ",
      walletTodayUsage: "Today: ",
      walletDragHint: " (Click to refresh / Drag to move)",
      walletRefreshFailed: "Balance unavailable (Click to retry / Drag to move)"
    },
    ja: {
      enabled: "動的ビデオ背景を有効化",
      chatGlass: "チャットすりガラス",
      chatScrim: "チャット濃紺スクリーム",
      sidebarGlass: "サイドバーすりガラス",
      sidebarScrim: "サイドバー濃紺スクリーム",
      btnFx: "P3R ボタン・メニュー演出",
      btnSfx: "P3R ボタン効果音",
      watermark: "P3R 背景ウォーターマーク",
      moonHud: "P3R 月齢・同期 HUD",
      glassOpacity: "ガラス不透明度",
      transparentZero: "0% (完全透明)",
      blurStrength: "ぼかし強度",
      peek: "背景プレビュー",
      restore: "UI を復元",
      replay: "導入を再再生",
      resetPos: "位置リセット",
      close: "閉じる",
      pillTitle: "Persona 3 Reload 設定（ドラッグで移動）",
      moonTitle: "P3R リアルタイム月齢・同期 HUD（ドラッグで移動）",
      effortDragHint: "左右ドラッグで思考レベル切替 / クリックでメニュー",
      walletDefaultTitle: "現在の残高（クリックで更新 / ドラッグで移動）",
      walletBalancePrefix: "現在の残高: ",
      walletBonus: "ボーナス ",
      walletTodayUsage: "本日利用: ",
      walletDragHint: "（クリックで更新 / ドラッグで移動）",
      walletRefreshFailed: "残高を取得できません（クリックで再試行 / ドラッグで移動）"
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
    if (moonEl) moonEl.title = tr("moonTitle");
    if (walletEl) walletEl.title = formatWalletTitle(lastWalletData);
  }

  function setDockExpanded(open) {
    var next = Boolean(open);
    var changed = next !== cfg.dockExpanded;
    cfg.dockExpanded = next;
    var card = document.getElementById("p3r-dsh-card");
    var pill = document.getElementById("p3r-dsh-pill");
    if (card) card.classList.toggle("open", cfg.dockExpanded);
    if (pill) {
      pill.classList.toggle("p3r-open", cfg.dockExpanded);
      pill.setAttribute("aria-expanded", cfg.dockExpanded ? "true" : "false");
    }
    if (changed) playP3rTone(cfg.dockExpanded ? "open" : "close");
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
        if (!data || !data.ok) {
          throw new Error("wallet_unavailable");
        }
        var val = typeof data.totalBalance === "number" ? data.totalBalance : data.balance;
        if (typeof val !== "number" || !isFinite(val)) {
          throw new Error("wallet_invalid");
        }
        lastWalletData = data;
        walletEl.classList.remove("p3r-wallet-error");
        if (walletCurEl) walletCurEl.textContent = formatWalletCurrency(data.currency);
        if (walletAmtEl) walletAmtEl.textContent = formatWalletAmount(val);
        walletEl.title = formatWalletTitle(data);
        positionOverlayWidgets();
      })
      .catch(function () {
        if (walletEl && force) {
          walletEl.classList.add("p3r-wallet-error");
          if (!lastWalletData) walletEl.title = tr("walletRefreshFailed");
        }
      })
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
    var fxActive = Boolean(cfg.enabled && cfg.btnFx);

    html.classList.toggle("p3r-skin-on", cfg.enabled);
    html.classList.toggle("p3r-chat-scrim", Boolean(cfg.enabled && cfg.chatScrim));
    html.classList.toggle("p3r-peek", Boolean(cfg.enabled && cfg.peek));
    html.classList.toggle("p3r-btn-fx", fxActive);
    html.classList.toggle("p3r-wm-on", Boolean(cfg.enabled && cfg.watermark));

    if (stage) stage.classList.toggle("p3r-off", !cfg.enabled);
    if (!fxActive) {
      activeHoverTarget = null;
      teardownEffortUi();
    }
    if (!cfg.enabled) {
      if (streamingTimer) {
        clearTimeout(streamingTimer);
        streamingTimer = 0;
      }
      html.classList.remove("p3r-streaming");
    }
    updateMoonHudContent();
    positionOverlayWidgets();

    if (cfg.enabled) {
      initVideoLifecycle();
      if (videoPhase === "loop") {
        if (loopVid && loopVid.paused) safePlay(loopVid);
      } else if (videoPhase === "intro" && introVid && introVid.paused) {
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

    // Outlined Bleeding P3R Architectural Watermark Layer (toggleable)
    var wm = document.createElement("div");
    wm.id = "p3r-dsh-watermark";
    wm.setAttribute("aria-hidden", "true");
    wm.innerHTML = '<div class="p3r-wm-slash"></div><div class="p3r-wm-word">RELOAD</div>';
    stage.insertAdjacentElement("afterend", wm);

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
      buildSwitchRow("watermark", "p3r-chk-watermark") +
      buildSwitchRow("moonHud", "p3r-chk-moon-hud") +
      '  <div class="p3r-slider-wrap">' +
      '    <div class="p3r-slider-head"><span data-p3r-i18n="glassOpacity">' + tr("glassOpacity") + '</span><b id="p3r-alpha-val">48%</b></div>' +
      '    <input type="range" id="p3r-rng-alpha" min="0" max="' + MAX_PANEL_ALPHA + '" step="0.01">' +
      "  </div>" +
      '  <div class="p3r-slider-wrap">' +
      '    <div class="p3r-slider-head"><span data-p3r-i18n="blurStrength">' + tr("blurStrength") + '</span><b id="p3r-blur-val">14px</b></div>' +
      '    <input type="range" id="p3r-rng-blur" min="0" max="' + MAX_BLUR_PX + '" step="1">' +
      "  </div>" +
      '  <div class="p3r-btn-row">' +
      '    <button type="button" class="p3r-mini-btn primary" id="p3r-btn-peek"><span>' + tr("peek") + '</span></button>' +
      '    <button type="button" class="p3r-mini-btn" id="p3r-btn-replay"><span data-p3r-i18n="replay">' + tr("replay") + '</span></button>' +
      '    <button type="button" class="p3r-mini-btn" id="p3r-btn-reset-pos"><span data-p3r-i18n="resetPos">' + tr("resetPos") + '</span></button>' +
      '    <button type="button" class="p3r-mini-btn" id="p3r-btn-close"><span data-p3r-i18n="close">' + tr("close") + '</span></button>' +
      "  </div>" +
      "</div>" +
      '<button type="button" id="p3r-dsh-pill" draggable="false" aria-expanded="false" aria-controls="p3r-dsh-card" title="' + tr("pillTitle") + '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 156" width="100%" height="100%" aria-hidden="true"><defs><filter id="p3r-mk-rim" x="-15%" y="-15%" width="130%" height="130%"><feComponentTransfer in="SourceAlpha" result="thresh"><feFuncA type="discrete" tableValues="0 0 0.35 1 1 1 1 1 1 1"/></feComponentTransfer><feMorphology in="thresh" operator="dilate" radius="2.4" result="dilated"/><feGaussianBlur in="dilated" stdDeviation="0.55" result="soft"/><feFlood flood-color="#7beeff" result="cyan"/><feComposite in="cyan" in2="soft" operator="in" result="outline"/><feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge></filter><clipPath id="p3r-mk-headcrop"><polygon points="0,0 148,0 148,96 28,136 0,136"/></clipPath></defs><g filter="url(#p3r-mk-rim)"><g clip-path="url(#p3r-mk-headcrop)"><image href="/p3r-skin/makoto-avatar.png?v=1" x="14" y="4" width="108" height="119" preserveAspectRatio="xMidYMid meet"/></g><g transform="translate(80 121) rotate(-19.8)"><rect x="-56" y="-14.5" width="112" height="29" rx="2.5" fill="#0d5ad0" stroke="#7beeff" stroke-width="2"/><polygon class="p3r-mk-hp" points="-47,-8 39,-8 35,-1.5 -51,-1.5" fill="#3cf2ff"/><polygon class="p3r-mk-sp" points="-37,1.5 49,1.5 45,8 -41,8" fill="#f4d81c"/></g></g></svg>' +
      "</button>";

    document.body.appendChild(dock);

    // P3R Live Moon Phase & Sync Micro-HUD (draggable, header-safe, toggleable)
    moonEl = document.createElement("div");
    moonEl.id = "p3r-dsh-moon";
    moonEl.setAttribute("role", "status");
    moonEl.setAttribute("tabindex", "0");
    moonEl.title = tr("moonTitle");
    moonEl.innerHTML =
      '<span class="p3r-moon-disc" aria-hidden="true"><span class="p3r-moon-lit"></span><span class="p3r-moon-shadow"></span></span>' +
      '<span class="p3r-moon-meta">' +
      '  <span class="p3r-moon-date"></span>' +
      '  <span class="p3r-moon-sub"></span>' +
      "</span>";
    document.body.appendChild(moonEl);
    moonDateEl = moonEl.querySelector(".p3r-moon-date");
    moonSubEl = moonEl.querySelector(".p3r-moon-sub");
    moonShadowEl = moonEl.querySelector(".p3r-moon-shadow");
    makeWidgetDraggable(moonEl, moonEl, "moon");
    updateMoonHudContent();
    if (!moonTimer) {
      moonTimer = setInterval(function () {
        if (cfg.enabled && cfg.moonHud && !document.hidden) updateMoonHudContent();
      }, 60000);
    }

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
    installEffortDragEngine();
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
    var chkWatermark = document.getElementById("p3r-chk-watermark");
    var chkMoonHud = document.getElementById("p3r-chk-moon-hud");
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
    chkWatermark.checked = cfg.watermark;
    chkMoonHud.checked = cfg.moonHud;
    rngAlpha.value = String(cfg.panelAlpha);
    alphaVal.textContent = formatAlphaText(cfg.panelAlpha);
    rngBlur.value = String(cfg.blurPx);
    blurVal.textContent = cfg.blurPx + "px";

    makeWidgetDraggable(pill, dock, "dock");

    pill.addEventListener("click", function () {
      setDockExpanded(!cfg.dockExpanded);
    });

    btnResetPos.addEventListener("click", function () {
      customPos.dock = null;
      customPos.wallet = null;
      customPos.moon = null;
      saveCustomPos();
      positionOverlayWidgets();
    });

    btnClose.addEventListener("click", function () {
      setDockExpanded(false);
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

    chkWatermark.addEventListener("change", function () {
      cfg.watermark = chkWatermark.checked;
      saveCfg();
      syncStateToDom();
    });

    chkMoonHud.addEventListener("change", function () {
      cfg.moonHud = chkMoonHud.checked;
      saveCfg();
      syncStateToDom();
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

    var localeTimer = 0;
    var observer = new MutationObserver(function (mutations) {
      var needsPass = false;
      var animEnded = false;
      var localeDirty = false;
      var domLocaleDirty = false;
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
          if (mt && mt.closest && (mt.closest("#p3r-dsh-dock") || mt.closest("#p3r-fx-layer") || mt.closest("#p3r-dsh-wallet") || mt.closest("#p3r-dsh-moon") || mt.closest("#p3r-dsh-watermark") || mt.closest("#p3r-dsh-stage") || mt.closest("#p3r-effort-float") || mt.closest("#p3r-effort-canvas") || mt.closest(".p3r-effort-rail") || mt.closest("[data-p3r-brand]"))) continue;
          // Fast-path composer model/effort trigger & active effort pane spinner/check updates
          // so switching thinking levels NEVER triggers a 2400-node full-page applyGlassPass scan.
          if (mt && mt.closest) {
            var hitEffortPane = mt.closest("[role='menu'][data-p3r-effort-pane='1']");
            if (hitEffortPane) {
              if (!looksLikeEffortMenu(hitEffortPane)) enhanceEffortMenus();
              continue;
            }
            var hitTrigger = mt.closest("button[class*='_trigger']");
            if (hitTrigger && hitTrigger.querySelector("[class*='_triggerEffort']")) {
              syncComposerEffortBadges();
              continue;
            }
          }
          // Streamed tokens inside already-marked chat bubbles do not alter page
          // glass regions or UI chrome language; pulse live HUD state without rescanning.
          var hitBubble = mt && mt.closest ? mt.closest("[data-p3r-bubble]") : null;
          if (hitBubble) {
            if (hitBubble.getAttribute("data-p3r-bubble") === "assistant") {
              pulseStreamingState();
            }
            if (m.type === "characterData") continue;
            var hasStructuralAdd = false;
            for (var n = 0; n < m.addedNodes.length; n++) {
              var an = m.addedNodes[n];
              if (an && an.nodeType === 1 && /^(DIV|SECTION|ARTICLE|MAIN|ASIDE|NAV|HEADER|FOOTER)$/.test(an.tagName)) {
                hasStructuralAdd = true;
                break;
              }
            }
            if (!hasStructuralAdd) continue;
          }
          needsPass = true;
          domLocaleDirty = true;
        }
      }
      if (localeDirty) applyI18n(false);
      // Content mutations (e.g. streamed chat text) only matter for language
      // detection when the host locale bridge is absent, and then at most
      // twice a second.
      if (domLocaleDirty && !window.__P3R_DSH_LOCALE__ && !localeTimer) {
        localeTimer = setTimeout(function () {
          localeTimer = 0;
          applyI18n(false);
        }, 500);
      }
      if (animEnded) {
        if (glassTimer) {
          clearTimeout(glassTimer);
          glassTimer = 0;
        }
        scheduleGlassPass(false);
      } else if (needsPass) {
        if (cfg.enabled && cfg.btnFx) enhanceEffortMenus();
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
