import { randomUUID } from 'node:crypto';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BOOT_STATE_KEY = Symbol.for('p3r.dsh.skin.bootState');
function getBootState() {
  if (!globalThis[BOOT_STATE_KEY]) {
    globalThis[BOOT_STATE_KEY] = {
      bootId: randomUUID(),
      introPlayed: false,
    };
  }
  return globalThis[BOOT_STATE_KEY];
}

function resolveFirstExisting(candidates) {
  for (const url of candidates) {
    const p = fileURLToPath(url);
    if (existsSync(p)) return p;
  }
  return null;
}

function isLoopbackHostHeader(hostHeader) {
  try {
    const u = new URL('http://' + String(hostHeader || ''));
    const h = u.hostname.toLowerCase().replace(/^\[/, '').replace(/\]$/, '');
    if (h === 'localhost' || h.endsWith('.localhost') || h === '::1') return true;
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
    return Boolean(m && Number(m[1]) === 127 && [m[2], m[3], m[4]].every((x) => Number(x) <= 255));
  } catch {
    return false;
  }
}

function rejectIfUntrusted(req, res, ctx) {
  const headers = (req && req.headers) || {};
  if (String(headers['sec-fetch-site'] || '').toLowerCase() === 'cross-site') {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('forbidden');
    return true;
  }
  let conn = null;
  try {
    conn = ctx && typeof ctx.get === 'function' ? ctx.get('connection') : ctx && ctx.connection;
  } catch {
    conn = null;
  }
  if (conn && typeof conn.requestRejection === 'function') {
    try {
      const code = conn.requestRejection(req);
      if (code !== undefined && code !== null && code !== false) {
        res.writeHead(typeof code === 'number' ? code : 403, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end('forbidden');
        return true;
      }
      return false;
    } catch {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('forbidden');
      return true;
    }
  }
  if (!isLoopbackHostHeader(headers.host)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('forbidden');
    return true;
  }
  return false;
}

function parseByteRange(rangeHeader, totalSize) {
  const m = /^bytes=(\d*)-(\d*)$/i.exec(String(rangeHeader || '').trim());
  if (!m) return null;
  const rawStart = m[1];
  const rawEnd = m[2];
  if (rawStart === '' && rawEnd === '') return null;
  let start = 0;
  let end = totalSize - 1;
  if (rawStart === '') {
    const suffix = Number(rawEnd);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, totalSize - suffix);
  } else {
    start = Number(rawStart);
    end = rawEnd === '' ? totalSize - 1 : Math.min(totalSize - 1, Number(rawEnd));
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || end >= totalSize) {
    return { invalid: true };
  }
  return { start, end };
}

async function serveMp4(req, res, filePath) {
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('video unavailable');
    return;
  }
  const method = String(req.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' });
    res.end('method not allowed');
    return;
  }
  let info;
  try {
    info = await stat(filePath);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('video unavailable');
    return;
  }

  const size = info.size;
  const etag = `"p3r-${size}-${Math.floor(info.mtimeMs)}"`;
  if (req.headers['if-none-match'] === etag && !req.headers.range) {
    res.writeHead(304, { ETag: etag, 'Cache-Control': 'no-cache' });
    res.end();
    return;
  }

  const baseHeaders = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
    ETag: etag,
  };

  if (req.headers.range) {
    const parsed = parseByteRange(req.headers.range, size);
    if (parsed && parsed.invalid) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}`, 'Cache-Control': 'no-store' });
      res.end();
      return;
    }
    if (parsed) {
      const len = parsed.end - parsed.start + 1;
      res.writeHead(206, {
        ...baseHeaders,
        'Content-Range': `bytes ${parsed.start}-${parsed.end}/${size}`,
        'Content-Length': String(len),
      });
      if (method === 'HEAD') {
        res.end();
        return;
      }
      const stream = createReadStream(filePath, { start: parsed.start, end: parsed.end });
      stream.on('error', () => {
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
      res.on('close', () => stream.destroy());
      stream.pipe(res);
      return;
    }
  }

  res.writeHead(200, {
    ...baseHeaders,
    'Content-Length': String(size),
  });
  if (method === 'HEAD') {
    res.end();
    return;
  }
  const stream = createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(500);
    res.end();
  });
  res.on('close', () => stream.destroy());
  stream.pipe(res);
}

async function servePng(req, res, filePath) {
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('image unavailable');
    return;
  }
  const method = String(req.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' });
    res.end('method not allowed');
    return;
  }
  try {
    const info = await stat(filePath);
    const etag = `"p3r-png-${info.size}-${Math.floor(info.mtimeMs)}"`;
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { ETag: etag, 'Cache-Control': 'public, max-age=3600' });
      res.end();
      return;
    }
    const buf = method === 'HEAD' ? null : await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
      ETag: etag,
      'Content-Length': String(info.size),
    });
    res.end(buf || undefined);
  } catch {
    if (!res.headersSent) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    }
    res.end('image unavailable');
  }
}

let walletCache = null;
let walletCacheAt = 0;

function pickCurrencyWallets(normalWallets, bonusWallets) {
  const normals = Array.isArray(normalWallets) ? normalWallets : [];
  const bonuses = Array.isArray(bonusWallets) ? bonusWallets : [];
  const all = normals.concat(bonuses);
  if (all.length === 0) return { currency: 'CNY', normalBalance: 0, bonusBalance: 0, totalBalance: 0 };
  const hasCny = all.some((w) => w && w.currency === 'CNY');
  const currency = hasCny ? 'CNY' : (all[0] && all[0].currency) || 'CNY';
  const sumFor = (list) =>
    list.reduce((acc, w) => {
      if (!w || w.currency !== currency) return acc;
      const n = Number(w.balance);
      return Number.isFinite(n) ? acc + n : acc;
    }, 0);
  const normalBalance = sumFor(normals);
  const bonusBalance = sumFor(bonuses);
  return {
    currency,
    normalBalance,
    bonusBalance,
    totalBalance: normalBalance + bonusBalance,
  };
}

async function readDshwUsageFallback() {
  const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh');
  const candidates = [
    join(dshHome, '.dshw-usage.json'),
    join(dshHome, 'profiles', 'desktop', '.dshw-usage.json'),
  ];
  for (const p of candidates) {
    try {
      const raw = await readFile(p, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lastBalance === 'number' && Number.isFinite(parsed.lastBalance)) {
        return {
          ok: true,
          source: 'dshw-usage',
          currency: 'CNY',
          totalBalance: parsed.lastBalance,
          normalBalance: parsed.lastBalance,
          bonusBalance: 0,
          todayUsage: Number.isFinite(Number(parsed.todayUsage)) ? Number(parsed.todayUsage) : null,
          updatedAt: Date.now(),
        };
      }
    } catch {}
  }
  return null;
}

async function readWalletSummary(ctx, force) {
  const now = Date.now();
  if (!force && walletCache && now - walletCacheAt < 12000) {
    return walletCache;
  }

  try {
    const acct = ctx && typeof ctx.get === 'function' ? ctx.get('deepseekAccount') : null;
    if (acct && typeof acct.getBalance === 'function') {
      const clientMeta = {
        version: '0.2.2-rc.3',
        locale: 'zh-CN',
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      };
      const res = await Promise.race([
        acct.getBalance(clientMeta),
        new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      if (res && res.status === 'ready') {
        const picked = pickCurrencyWallets(res.value, res.bonusWallets);
        walletCache = {
          ok: true,
          source: 'deepseekAccount',
          ...picked,
          updatedAt: now,
        };
        walletCacheAt = now;
        return walletCache;
      }
    }
  } catch {}

  const fallback = await readDshwUsageFallback();
  if (fallback) {
    walletCache = fallback;
    walletCacheAt = now;
    return fallback;
  }

  return {
    ok: false,
    source: 'none',
    currency: 'CNY',
    totalBalance: null,
    updatedAt: now,
  };
}

export function apply(ctx) {
  const bootState = getBootState();

  try {
    const text = readFileSync(new URL('./dist/p3r-skin.js', import.meta.url), 'utf8');
    if (!text.trim() || /<\/script/i.test(text)) {
      throw new Error('Invalid p3r-skin runtime script');
    }
    const disposeInject = ctx.on('webserver/index-inject', (table) => {
      if (!Array.isArray(table)) return;
      if (table.some((row) => row && row.id === 'p3r-dsh-skin-inline')) return;
      table.push({
        id: 'p3r-dsh-skin-inline',
        kind: 'script',
        placement: 'body',
        text,
      });
    });
    ctx.effect(() => () => {
      try {
        disposeInject();
      } catch {}
    });
  } catch (error) {
    console.warn('[dsh-p3r-ui] Skipped injection:', error);
  }

  ctx.inject(['webServer'], (scoped) => {
    const introPath = resolveFirstExisting([
      new URL('../menu-clean-4k60-h264.mp4', import.meta.url),
      new URL('./assets/menu-clean-4k60-h264.mp4', import.meta.url),
      new URL('../menu-clean-h264.mp4', import.meta.url),
      new URL('./assets/menu-clean-h264.mp4', import.meta.url),
    ]);
    const loopPath = resolveFirstExisting([
      new URL('./assets/menu-loop-fv2-60fps-h264.mp4', import.meta.url),
      new URL('../fv2-60fps.mp4', import.meta.url),
      new URL('./assets/menu-loop-4k60-h264.mp4', import.meta.url),
      new URL('../menu-clean-4k60-h264.mp4', import.meta.url),
      new URL('./assets/menu-loop-h264.mp4', import.meta.url),
      new URL('../menu-clean-h264.mp4', import.meta.url),
    ]);
    const makotoAvatarPath = resolveFirstExisting([
      new URL('./assets/makoto-avatar.png', import.meta.url),
    ]);

    const disposers = [];
    disposers.push(
      scoped.webServer.register({
        kind: 'exact',
        path: '/p3r-skin/makoto-avatar.png',
        handler: async (req, res) => {
          if (rejectIfUntrusted(req, res, ctx)) return;
          await servePng(req, res, makotoAvatarPath);
        },
      })
    );
    disposers.push(
      scoped.webServer.register({
        kind: 'exact',
        path: '/p3r-skin/intro.mp4',
        handler: async (req, res) => {
          if (rejectIfUntrusted(req, res, ctx)) return;
          await serveMp4(req, res, introPath);
        },
      })
    );
    disposers.push(
      scoped.webServer.register({
        kind: 'exact',
        path: '/p3r-skin/loop.mp4',
        handler: async (req, res) => {
          if (rejectIfUntrusted(req, res, ctx)) return;
          await serveMp4(req, res, loopPath);
        },
      })
    );
    disposers.push(
      scoped.webServer.register({
        kind: 'exact',
        path: '/p3r-skin/boot-state',
        handler: (req, res) => {
          if (rejectIfUntrusted(req, res, ctx)) return;
          const method = String(req.method || 'GET').toUpperCase();
          if (method === 'POST') {
            bootState.introPlayed = true;
          }
          const body = JSON.stringify({
            bootId: bootState.bootId,
            introPlayed: bootState.introPlayed,
          });
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'Content-Length': String(Buffer.byteLength(body)),
          });
          res.end(body);
        },
      })
    );
    disposers.push(
      scoped.webServer.register({
        kind: 'exact',
        path: '/p3r-skin/wallet.json',
        handler: async (req, res) => {
          if (rejectIfUntrusted(req, res, ctx)) return;
          const force = String(req.url || '').includes('force=1');
          const payload = await readWalletSummary(ctx, force);
          const body = JSON.stringify(payload);
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'Content-Length': String(Buffer.byteLength(body)),
          });
          res.end(body);
        },
      })
    );

    if (typeof scoped.webServer.tapIndex === 'function') {
      disposers.push(
        scoped.webServer.tapIndex((html) => {
          try {
            if (html.indexOf('__P3R_DSH_SKIN_INSTALLED__') !== -1) return html;
            const scriptText = readFileSync(new URL('./dist/p3r-skin.js', import.meta.url), 'utf8');
            if (!scriptText.trim() || /<\/script/i.test(scriptText)) return html;
            const tag = '<script>' + scriptText + '</script>';
            if (html.indexOf('</body>') !== -1) return html.replace('</body>', tag + '</body>');
            return html + tag;
          } catch {
            return html;
          }
        })
      );
    }

    scoped.effect(() => () => {
      for (const d of disposers) {
        try {
          d();
        } catch {}
      }
    });
  });
}
