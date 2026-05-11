// Polyfill Promise.try (ES2025) – absent in Chrome < 134 / Samsung Internet < ~30.
// This wrapper is loaded as the PDF.js workerSrc so the polyfill is in the
// worker's own global scope before the real worker module executes.
if (typeof Promise.try === 'undefined') {
  Promise.try = (f, ...a) => new Promise(r => r(f(...a)));
}
const src = new URL(self.location.href).searchParams.get('src');
if (src) await import(src);
