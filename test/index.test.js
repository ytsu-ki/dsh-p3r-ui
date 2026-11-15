import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isLoopbackHostHeader,
  parseByteRange,
  pickCurrencyWallets,
  rejectIfUntrusted,
} from '../index.js';

function fakeRes() {
  return {
    status: null,
    writeHead(status) {
      this.status = status;
    },
    end() {},
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
