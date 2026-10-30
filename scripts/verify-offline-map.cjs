// Browser integration check for the exact HTML used by the native WebView.
// Run: node scripts/verify-offline-map.cjs (requires a local Playwright installation).
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(
  fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText, filename);
const { buildRouteMapHtml } = require('../src/lib/trip-map-html.ts');
const { offlineMapHtml } = require('../src/lib/offline-map.ts');

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 430, height: 600 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const messages = [];
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.exposeFunction('testBridge', data => messages.push(JSON.parse(data)));
    const html = buildRouteMapHtml([
      { lat: 16.0611, lng: 108.2275, name: 'Cầu Rồng', order: 1 },
      { lat: 16.0677, lng: 108.2244, name: 'Chợ Hàn', order: 2 },
      { lat: 16.0701, lng: 108.2313, name: 'Cầu sông Hàn', order: 3 },
    ], { loadingRoute: 'Đang tải tuyến đường', yourLocation: 'Bạn', minUnit: 'phút' });
    await page.setContent(html.replace('<head>', '<head><script>window.ReactNativeWebView={postMessage:window.testBridge};</script>'));
    await page.waitForFunction(() => window._offlineRouteReady === true, null, { timeout: 45000 });
    const baseFeatures = await page.evaluate(() => map.queryRenderedFeatures().filter(feature => !feature.layer.id.startsWith('trip-route')).length);
    assert.ok(baseFeatures > 10, 'The background must contain actual geographic features, not a placeholder');
    await page.evaluate(() => window.captureOfflineMap('integration'));
    // postMessage crosses the bridge asynchronously.
    await page.waitForTimeout(150);
    const snapshot = messages.find(message => message.requestId === 'integration');
    assert.equal(snapshot?.type, 'snapshot', JSON.stringify({ messages, pageErrors }));
    assert.ok(snapshot.image.startsWith('data:image/png;base64,'));
    const output = path.resolve('.expo/offline-map-qa');
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'route.png'), Buffer.from(snapshot.image.split(',')[1], 'base64'));
    const saved = { version: 1, tripId: 'fixture', day: 1, title: 'Đà Nẵng', stops: [], signature: '[]', savedAt: new Date().toISOString(), image: snapshot.image };
    // A fresh offline context has no network/browser cache from the online map.
    const offline = await browser.newContext({ viewport: { width: 430, height: 600 }, offline: true });
    const offlinePage = await offline.newPage();
    const requests = [];
    offlinePage.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await offlinePage.setContent(offlineMapHtml(saved));
    await offlinePage.waitForFunction(() => document.getElementById('map').naturalWidth > 0);
    const before = await offlinePage.locator('#map').boundingBox();
    await offlinePage.getByRole('button', { name: 'Zoom in', exact: true }).click();
    const after = await offlinePage.locator('#map').boundingBox();
    assert.ok(after.width > before.width, 'Offline zoom should enlarge the saved image');
    await offlinePage.getByRole('button', { name: 'Fit map', exact: true }).click();
    const fitted = await offlinePage.locator('#map').boundingBox();
    assert.ok(fitted.width <= 430 && fitted.height <= 600, 'The complete saved image must fit without cropping');
    assert.deepEqual(requests, [], 'Offline viewing must not request network resources');
    await offlinePage.screenshot({ path: path.join(output, 'offline-viewer.png') });

    // A road-service failure must not produce a straight-line "successful" snapshot.
    const failed = await context.newPage();
    const failedMessages = [];
    await failed.exposeFunction('testBridge', data => failedMessages.push(JSON.parse(data)));
    await failed.route('**/router.project-osrm.org/**', route => route.fulfill({ json: { code: 'NoRoute', routes: [] } }));
    await failed.setContent(html.replace('<head>', '<head><script>window.ReactNativeWebView={postMessage:window.testBridge};</script>'));
    await failed.waitForFunction(() => mapFailed === true);
    await failed.evaluate(() => window.captureOfflineMap('unroutable'));
    await failed.waitForTimeout(100);
    assert.equal(failedMessages.find(message => message.requestId === 'unroutable')?.type, 'snapshot-error');

    // Missing background data must not be accepted as an offline map either.
    const missing = await context.newPage();
    const missingMessages = [];
    await missing.exposeFunction('testBridge', data => missingMessages.push(JSON.parse(data)));
    await missing.route('https://tiles.openfreemap.org/**', route => route.abort());
    await missing.setContent(html.replace('<head>', '<head><script>window.ReactNativeWebView={postMessage:window.testBridge};</script>'));
    await missing.waitForFunction(() => mapFailed === true);
    await missing.evaluate(() => window.captureOfflineMap('missing-background'));
    await missing.waitForTimeout(100);
    assert.equal(missingMessages.find(message => message.requestId === 'missing-background')?.type, 'snapshot-error');
    console.log(JSON.stringify({ result: 'PASS', baseFeatures, realRoadRoute: true, offlineImage: true, zoom: true, noCropping: true, failedRouteRejected: true, missingBackgroundRejected: true, networkRequestsWhileOffline: requests.length, pageErrors, output }));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
