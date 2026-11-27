import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  apply,
  isLoopbackHostHeader,
  parseByteRange,
  pickCurrencyWallets,
  rejectIfUntrusted,
} from '../index.js';

function fakeRes() {
  const res = new EventEmitter();
  res.status = null;
  res.headers = {};
  res.chunks = [];
  res.headersSent = false;
  res.ended = false;
  let resolveDone;
  res.done = new Promise((r) => {
    resolveDone = r;
  });
  res.writeHead = (status, headers = {}) => {
    res.status = status;
    res.headers = headers;
    res.headersSent = true;
  };
  res.write = (chunk) => {
    res.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    return true;
  };
  res.end = (chunk) => {
    if (chunk !== undefined) res.write(chunk);
    res.ended = true;
    res.emit('finish');
    res.emit('close');
    resolveDone();
  };
  res.destroy = () => {
    res.ended = true;
    res.emit('close');
    resolveDone();
  };
  res.bodyBuffer = () => Buffer.concat(res.chunks);
  res.bodyText = () => res.bodyBuffer().toString('utf8');
  return res;
}

function createFakeHost(services = {}) {
  const routes = new Map();
  const injectListeners = [];
  const tapIndexListeners = [];
  const effectCleanups = [];
  const ctx = {
    get(name) {
      return services[name];
    },
    on(event, fn) {
      if (event === 'webserver/index-inject') injectListeners.push(fn);
      return () => {
        const idx = injectListeners.indexOf(fn);
        if (idx >= 0) injectListeners.splice(idx, 1);
      };
    },
    effect(fn) {
      const cleanup = fn();
      if (typeof cleanup === 'function') effectCleanups.push(cleanup);
    },
    inject(_deps, fn) {
      const scoped = {
        webServer: {
          register({ path, handler }) {
            routes.set(path, handler);
            return () => routes.delete(path);
          },
          tapIndex(fnTap) {
            tapIndexListeners.push(fnTap);
            return () => {
              const idx = tapIndexListeners.indexOf(fnTap);
              if (idx >= 0) tapIndexListeners.splice(idx, 1);
            };
          },
        },
        effect(cb) {
          const cleanup = cb();
          if (typeof cleanup === 'function') effectCleanups.push(cleanup);
        },
      };
      fn(scoped);
    },
  };
  return {
    ctx,
    routes,
    injectListeners,
    tapIndexListeners,
    dispose() {
      for (const fn of effectCleanups) fn();
    },
  };
}

test('isLoopbackHostHeader accepts only loopback hosts', () => {
  for (const h of ['localhost', 'localhost:8080', 'app.localhost', '127.0.0.1:3000', '127.8.9.1', '[::1]:9000']) {
    assert.equal(isLoopbackHostHeader(h), true, h);
  }
  for (const h of ['', undefined, 'example.com', '127.0.0.1.evil.com', 'localhost.evil.com', '192.168.1.2', '128.0.0.1']) {
    assert.equal(isLoopbackHostHeader(h), false, String(h));
  }
});

test('rejectIfUntrusted allows same-origin, navigation and non-browser loopback requests', () => {
  for (const site of ['same-origin', 'none', undefined]) {
    const res = fakeRes();
    const headers = { host: '127.0.0.1:1234' };
    if (site) headers['sec-fetch-site'] = site;
    assert.equal(rejectIfUntrusted({ headers }, res, null), false, String(site));
    assert.equal(res.status, null);
  }
});

test('rejectIfUntrusted refuses cross-site and same-site browser requests', () => {
  for (const site of ['cross-site', 'same-site', 'Same-Site']) {
    const res = fakeRes();
    assert.equal(rejectIfUntrusted({ headers: { host: 'localhost', 'sec-fetch-site': site } }, res, null), true, site);
    assert.equal(res.status, 403);
  }
});

test('rejectIfUntrusted refuses non-loopback hosts when the host offers no connection check', () => {
  const res = fakeRes();
  assert.equal(rejectIfUntrusted({ headers: { host: 'evil.example' } }, res, null), true);
  assert.equal(res.status, 403);
});

test('rejectIfUntrusted defers to connection.requestRejection and fails closed when it throws', () => {
  const ctxWith = (requestRejection) => ({ get: (name) => (name === 'connection' ? { requestRejection } : undefined) });
  const req = { headers: { host: 'remote.example' } };

  let res = fakeRes();
  assert.equal(rejectIfUntrusted(req, res, ctxWith(() => undefined)), false);

  res = fakeRes();
  assert.equal(rejectIfUntrusted(req, res, ctxWith(() => 401)), true);
  assert.equal(res.status, 401);

  res = fakeRes();
  assert.equal(rejectIfUntrusted(req, res, ctxWith(() => { throw new Error('boom'); })), true);
  assert.equal(res.status, 403);
});

test('parseByteRange handles explicit, open-ended and suffix ranges', () => {
  assert.deepEqual(parseByteRange('bytes=0-9', 100), { start: 0, end: 9 });
  assert.deepEqual(parseByteRange('bytes=90-', 100), { start: 90, end: 99 });
  assert.deepEqual(parseByteRange('bytes=-10', 100), { start: 90, end: 99 });
  assert.deepEqual(parseByteRange('bytes=-500', 100), { start: 0, end: 99 });
  assert.deepEqual(parseByteRange('bytes=50-5000', 100), { start: 50, end: 99 });
});

test('parseByteRange ignores unsupported syntax and flags unsatisfiable ranges', () => {
  for (const h of ['', 'bytes=-', 'items=0-1', 'bytes=0-1,5-6', 'bytes=a-b', 'bytes=-0']) {
    assert.equal(parseByteRange(h, 100), null, h);
  }
  for (const h of ['bytes=100-', 'bytes=9-2', 'bytes=' + '9'.repeat(400) + '-']) {
    assert.deepEqual(parseByteRange(h, 100), { invalid: true }, h.slice(0, 20));
  }
});

test('pickCurrencyWallets sums one currency, preferring CNY', () => {
  assert.deepEqual(pickCurrencyWallets([], undefined), {
    currency: 'CNY',
    normalBalance: 0,
    bonusBalance: 0,
    totalBalance: 0,
  });
  assert.deepEqual(
    pickCurrencyWallets(
      [{ currency: 'USD', balance: '3' }, { currency: 'CNY', balance: '12.5' }, null],
      [{ currency: 'CNY', balance: 1 }, { currency: 'CNY', balance: 'oops' }]
    ),
    { currency: 'CNY', normalBalance: 12.5, bonusBalance: 1, totalBalance: 13.5 }
  );
  assert.equal(pickCurrencyWallets([{ currency: 'USD', balance: 2 }], []).currency, 'USD');
});

test('apply mounts routes, handles boot-state, range mp4, png ETag, and cleans up on dispose', async () => {
  const host = createFakeHost();
  apply(host.ctx);

  assert.equal(host.routes.has('/p3r-skin/boot-state'), true);
  assert.equal(host.routes.has('/p3r-skin/makoto-avatar.png'), true);
  assert.equal(host.routes.has('/p3r-skin/loop.mp4'), true);
  assert.equal(host.routes.has('/p3r-skin/wallet.json'), true);

  // Method guard on boot-state
  let res = fakeRes();
  host.routes.get('/p3r-skin/boot-state')({ method: 'DELETE', headers: { host: 'localhost' } }, res);
  assert.equal(res.status, 405);

  // GET -> POST boot-state
  res = fakeRes();
  host.routes.get('/p3r-skin/boot-state')({ method: 'GET', headers: { host: 'localhost' } }, res);
  assert.equal(res.status, 200);
  const s1 = JSON.parse(res.bodyText());
  assert.equal(typeof s1.bootId, 'string');

  res = fakeRes();
  host.routes.get('/p3r-skin/boot-state')({ method: 'POST', headers: { host: 'localhost' } }, res);
  assert.equal(res.status, 200);
  assert.equal(JSON.parse(res.bodyText()).introPlayed, true);

  // PNG GET + 304 ETag
  res = fakeRes();
  await host.routes.get('/p3r-skin/makoto-avatar.png')({ method: 'GET', headers: { host: 'localhost' } }, res);
  assert.equal(res.status, 200);
  assert.equal(Number(res.headers['Content-Length']), res.bodyBuffer().length);
  const etag = res.headers.ETag;

  res = fakeRes();
  await host.routes.get('/p3r-skin/makoto-avatar.png')(
    { method: 'GET', headers: { host: 'localhost', 'if-none-match': etag } },
    res
  );
  assert.equal(res.status, 304);

  // MP4 206 byte range + 416 out-of-range
  res = fakeRes();
  await host.routes.get('/p3r-skin/loop.mp4')(
    { method: 'GET', headers: { host: 'localhost', range: 'bytes=0-15' } },
    res
  );
  await res.done;
  assert.equal(res.status, 206);
  assert.equal(res.bodyBuffer().length, 16);

  res = fakeRes();
  await host.routes.get('/p3r-skin/loop.mp4')(
    { method: 'GET', headers: { host: 'localhost', range: 'bytes=999999999-' } },
    res
  );
  assert.equal(res.status, 416);

  // tapIndex injects once and does not duplicate
  const injected = host.tapIndexListeners[0]('<html><body>ok</body></html>');
  assert.equal(injected.includes('__P3R_DSH_SKIN_INSTALLED__'), true);
  assert.equal(host.tapIndexListeners[0](injected), injected);

  host.dispose();
  assert.equal(host.routes.size, 0);
  assert.equal(host.injectListeners.length, 0);
  assert.equal(host.tapIndexListeners.length, 0);
});

test('wallet route caches upstream calls, throttles force refresh, and keeps null todayUsage as null', async () => {
  const prevHome = process.env.DSH_HOME;
  const tmpHome = mkdtempSync(join(tmpdir(), 'p3r-dsh-test-'));
  try {
    writeFileSync(
      join(tmpHome, '.dshw-usage.json'),
      JSON.stringify({ lastBalance: 42.5, todayUsage: null }),
      'utf8'
    );
    process.env.DSH_HOME = tmpHome;

    // 1. Fallback when deepseekAccount is absent: todayUsage: null must NOT coerce to 0
    let host = createFakeHost();
    apply(host.ctx);
    let res = fakeRes();
    await host.routes.get('/p3r-skin/wallet.json')({ method: 'GET', url: '/p3r-skin/wallet.json', headers: { host: 'localhost' } }, res);
    assert.equal(res.status, 200);
    const body1 = JSON.parse(res.bodyText());
    assert.equal(body1.ok, true);
    assert.equal(body1.source, 'dshw-usage');
    assert.equal(body1.totalBalance, 42.5);
    assert.equal(body1.todayUsage, null);

    // 2. Immediate ?force=1 hits 3s cache floor and does not re-hit upstream
    let upstreamCalls = 0;
    host.dispose();
    host = createFakeHost({
      deepseekAccount: {
        async getBalance() {
          upstreamCalls++;
          return { status: 'ready', value: [{ currency: 'CNY', balance: '99' }], bonusWallets: [] };
        },
      },
    });
    apply(host.ctx);
    res = fakeRes();
    await host.routes.get('/p3r-skin/wallet.json')(
      { method: 'GET', url: '/p3r-skin/wallet.json?force=1', headers: { host: 'localhost' } },
      res
    );
    assert.equal(res.status, 200);
    assert.equal(upstreamCalls, 0);
    host.dispose();
  } finally {
    if (prevHome === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = prevHome;
    rmSync(tmpHome, { recursive: true, force: true });
  }
});

test('skin runtime removes legacy red-on-blue clashes and wires A2+M1+G2 tokens and guards', () => {
  const src = readFileSync(new URL('../src/skin-runtime.js', import.meta.url), 'utf8');
  assert.equal(/#d80018|#d90429|rgba\(216,\s*0,\s*24/i.test(src), false, 'legacy clashing red tokens must not remain');
  assert.equal(src.includes('--p3r-cyan:#3cf2ff'), true);
  assert.equal(src.includes('--p3r-crimson-edge:#ff175a'), true);
  assert.equal(src.includes('#p3r-dsh-watermark'), true);
  assert.equal(src.includes('#p3r-dsh-moon'), true);
  assert.equal(src.includes('p3r-streaming'), true);
  assert.equal(src.includes('prefers-reduced-motion:reduce'), true);
  assert.equal(src.includes('margin:-6px -10px'), false, 'header title buttons must not inject negative margins that overlap utility buttons');
  assert.equal(src.includes('#p3r-effort-canvas'), true);
  assert.equal(src.includes('#p3r-effort-float'), true);
  assert.equal(src.includes('installEffortDragEngine'), true);
  assert.equal(src.includes('data-p3r-effort-pane'), true, 'must visually hide duplicate legacy effort list');
  assert.equal(src.includes('anchorEffortCanvas'), true, 'must use localized bounded canvas');
  assert.equal(src.includes('EFFORT_POOL_CAP'), true, 'must use pre-allocated typed particle pool');
  assert.equal(src.includes('void thumb.offsetWidth'), false, 'must not trigger forced synchronous reflow on drag');
  assert.equal(src.includes('p3r-er-dragging'), true, 'must disable glide transition only during raw drag');
  assert.equal(src.includes('emitEffortGlideArc'), true, 'must emit glide trail arc on click-to-switch');
  assert.equal(src.includes("[class*='_triggerEffort']"), true);
  assert.equal(src.includes('function scheduleEffortFrame()'), true, 'effort rAF scheduling must be centralized');
  assert.equal(
    (src.match(/requestAnimationFrame\(stepEffortParticles\)/g) || []).length,
    1,
    'stepEffortParticles must only be scheduled through scheduleEffortFrame to prevent exponential rAF duplication'
  );
});

test('effort particle loop never spawns duplicate rAF callbacks while dragging in High/Max tiers', () => {
  const src = readFileSync(new URL('../src/skin-runtime.js', import.meta.url), 'utf8');
  const startMark = 'var effortCanvas = null;';
  const endMark = 'function getBridgeEffortSnapshot()';
  const startIdx = src.indexOf(startMark);
  const endIdx = src.indexOf(endMark);
  assert.ok(startIdx > 0 && endIdx > startIdx, 'effort particle engine block must exist');
  const snippet = src.slice(startIdx, endIdx);

  let rafSeq = 0;
  const rafQueue = new Map();
  let drawOps = 0;
  const fakeCtx = {
    globalAlpha: 1,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    setTransform() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    arc() {},
    stroke() { drawOps++; },
    fill() { drawOps++; },
  };
  const fakeCanvas = {
    id: '',
    width: 0,
    height: 0,
    style: { left: '', top: '', width: '', height: '', visibility: 'hidden' },
    setAttribute() {},
    getContext() { return fakeCtx; },
  };
  const fakeWindow = { innerWidth: 1280, innerHeight: 800, devicePixelRatio: 2 };
  const fakeDocument = {
    body: { appendChild() {} },
    createElement() { return fakeCanvas; },
  };

  const factory = new Function(
    'window',
    'document',
    'cfg',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'matchMedia',
    snippet + '\nreturn { anchorEffortCanvas, emitEffortTrail, emitEffortBurst, scheduleEffortFrame, setDrag: function(d){ activeEffortDrag = d; }, getPoolCount: function(){ return effortPoolCount; } };'
  );

  const api = factory(
    fakeWindow,
    fakeDocument,
    { enabled: true, btnFx: true, btnSfx: false },
    (cb) => {
      const id = ++rafSeq;
      rafQueue.set(id, cb);
      return id;
    },
    (id) => rafQueue.delete(id),
    () => ({ matches: false })
  );

  api.anchorEffortCanvas({ left: 900, top: 680, width: 240, height: 10 });
  let pendingX = 1135;
  api.setDrag({
    thumbX: 1135,
    thumbY: 685,
    tier: 3,
    flushPending() {
      if (pendingX === null) return;
      const x = pendingX;
      pendingX = null;
      api.emitEffortTrail(x, 685, 6, 3);
    },
  });
  api.emitEffortBurst(1135, 685, 3, false);

  let maxQueuedPerFrame = 0;
  for (let frame = 0; frame < 60; frame++) {
    pendingX = 1130 + (frame % 10);
    api.scheduleEffortFrame();
    assert.ok(rafQueue.size <= 1, `frame ${frame} queued ${rafQueue.size} duplicate rAF callbacks`);
    maxQueuedPerFrame = Math.max(maxQueuedPerFrame, rafQueue.size);
    const batch = Array.from(rafQueue.entries());
    rafQueue.clear();
    for (const [, cb] of batch) cb();
    assert.ok(rafQueue.size <= 1, `after stepping frame ${frame}, queued ${rafQueue.size} duplicate rAF callbacks`);
  }
  assert.equal(maxQueuedPerFrame, 1);
  assert.ok(drawOps > 0, 'particles should actually render during drag');

  // Release drag and drain all remaining particles cleanly
  api.setDrag(null);
  for (let frame = 0; frame < 80 && rafQueue.size > 0; frame++) {
    assert.ok(rafQueue.size <= 1, `drain frame ${frame} queued ${rafQueue.size} callbacks`);
    const batch = Array.from(rafQueue.entries());
    rafQueue.clear();
    for (const [, cb] of batch) cb();
  }
  assert.equal(rafQueue.size, 0, 'rAF loop must stop completely once drag ends and particles expire');
  assert.equal(api.getPoolCount(), 0);
  assert.equal(fakeCanvas.style.visibility, 'hidden');
});

test('client locale-bridge exposes optional __P3R_DSH_EFFORT__ over Cordis modelDirectories, projects optimistic pending effort without snapback, and rolls back on failure', async () => {
  const code = readFileSync(new URL('../client/locale-bridge.js', import.meta.url), 'utf8');
  let registeredModule = null;
  const dispatched = [];
  const fakeWindow = {
    __ModuleLoader__: {
      load(mod) {
        registeredModule = mod;
      },
    },
    dispatchEvent(ev) {
      dispatched.push(ev);
    },
  };
  const FakeCustomEvent = function (type, init) {
    this.type = type;
    this.detail = init && init.detail;
  };
  const fn = new Function('window', 'CustomEvent', code);
  fn(fakeWindow, FakeCustomEvent);
  assert.ok(registeredModule);
  const exportsObj = registeredModule.factory();
  assert.deepEqual(exportsObj.inject, ['locale']);

  let currentEffort = 'medium';
  let status = 'ready';
  let pendingSel = null;
  let shouldFailNext = false;
  const dirListeners = new Set();
  const selectCalls = [];
  const dir = {
    store: {
      getSnapshot() {
        return {
          current: { provider: 'deepseek', model: 'deepseek-r1', reasoningEffort: currentEffort },
          groups: [
            {
              id: 'deepseek',
              models: [
                {
                  id: 'deepseek-r1',
                  name: 'DeepSeek-R1',
                  reasoning: {
                    defaultEffort: 'medium',
                    efforts: [
                      { id: 'low', name: '低' },
                      { id: 'medium', name: '中' },
                      { id: 'high', name: '高' },
                      { id: 'max', name: '极高' },
                    ],
                  },
                },
              ],
            },
          ],
          status,
          pending: pendingSel,
          error: null,
        };
      },
      subscribe(cb) {
        dirListeners.add(cb);
        return () => dirListeners.delete(cb);
      },
    },
    async load() {
      return this.store.getSnapshot();
    },
    async select(sel) {
      selectCalls.push(sel);
      status = 'selecting';
      pendingSel = sel;
      for (const cb of dirListeners) cb();
      await new Promise((r) => setTimeout(r, 10));
      if (shouldFailNext) {
        shouldFailNext = false;
        status = 'ready';
        pendingSel = null;
        for (const cb of dirListeners) cb();
        return { ok: false, error: 'rpc failed' };
      }
      currentEffort = sel.reasoningEffort;
      status = 'ready';
      pendingSel = null;
      for (const cb of dirListeners) cb();
      return { ok: true, value: undefined };
    },
  };

  const cleanupFns = [];
  const fakeCtx = {
    locale: {
      getSnapshot: () => ({ active: 'zh-CN' }),
      subscribe: () => () => {},
    },
    effect(factory) {
      cleanupFns.push(factory());
    },
    inject(deps, cb) {
      if (deps.includes('modelDirectories')) {
        cb({
          uiSession: {
            adapter: {
              current: {
                getSnapshot: () => ({ key: 'sess-1' }),
                subscribe: () => () => {},
              },
            },
          },
          modelDirectories: {
            directoryFor: (id) => (id === 'sess-1' ? dir : null),
          },
          effect(factory) {
            cleanupFns.push(factory());
          },
        });
      }
    },
  };

  exportsObj.apply(fakeCtx);
  assert.ok(fakeWindow.__P3R_DSH_EFFORT__, 'effort bridge should mount when uiSession + modelDirectories exist');
  const snap = fakeWindow.__P3R_DSH_EFFORT__.getSnapshot();
  assert.equal(snap.available, true);
  assert.equal(snap.choices.length, 4);
  assert.equal(snap.activeIndex, 1);
  assert.equal(snap.effectiveEffort, 'medium');

  dispatched.length = 0;
  const pendingPromise = fakeWindow.__P3R_DSH_EFFORT__.selectEffort('max');
  // Synchronously while RPC is in-flight, snapshot must project pending 'max' (activeIndex 3) — zero snapback!
  const midSnap = fakeWindow.__P3R_DSH_EFFORT__.getSnapshot();
  assert.equal(midSnap.busy, true);
  assert.equal(midSnap.activeIndex, 3);
  assert.equal(midSnap.effectiveEffort, 'max');
  assert.equal(dispatched.some((e) => e.type === 'p3r-dsh-effort-change' && e.detail.activeIndex === 3 && e.detail.busy === true), true);

  const res = await pendingPromise;
  assert.equal(res.ok, true);
  assert.deepEqual(selectCalls[0], { provider: 'deepseek', model: 'deepseek-r1', reasoningEffort: 'max' });
  const doneSnap = fakeWindow.__P3R_DSH_EFFORT__.getSnapshot();
  assert.equal(doneSnap.busy, false);
  assert.equal(doneSnap.activeIndex, 3);

  // If an RPC fails and clears pending, snapshot rolls back cleanly to current ('max')
  shouldFailNext = true;
  const failPromise = fakeWindow.__P3R_DSH_EFFORT__.selectEffort('low');
  assert.equal(fakeWindow.__P3R_DSH_EFFORT__.getSnapshot().activeIndex, 0);
  const failRes = await failPromise;
  assert.equal(failRes.ok, false);
  assert.equal(fakeWindow.__P3R_DSH_EFFORT__.getSnapshot().activeIndex, 3);
  assert.equal(fakeWindow.__P3R_DSH_EFFORT__.getSnapshot().effectiveEffort, 'max');

  for (const c of cleanupFns) c();
  assert.equal(fakeWindow.__P3R_DSH_EFFORT__, undefined);
  assert.equal(fakeWindow.__P3R_DSH_LOCALE__, undefined);
});
