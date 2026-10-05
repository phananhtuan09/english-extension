// Runs in the page's MAIN world at document_start so it sees the player's own timedtext
// requests (which carry the signed URL parameters). Bodies are handed to the isolated
// content script through window.postMessage.
(() => {
  if (globalThis.__youtubeBilingualHook) return;
  globalThis.__youtubeBilingualHook = true;

  const CHANNEL = 'yt-bilingual';
  const captured = new Map();

  function parse(url) {
    try {
      const parsed = new URL(url, location.href);
      if (parsed.pathname !== '/api/timedtext') return null;
      const params = parsed.searchParams;
      return {
        videoId: params.get('v') || '',
        lang: params.get('lang') || '',
        kind: params.get('kind') || '',
        tlang: params.get('tlang') || '',
      };
    } catch {
      return null;
    }
  }

  function post(message) {
    window.postMessage({channel: CHANNEL, type: 'timedtext', ...message}, location.origin);
  }

  function capture(url, body) {
    const meta = parse(url);
    if (!meta || !meta.videoId || !body) return;
    const message = {...meta, body};
    // Keep only the latest video's tracks so a late-loading content script can ask for a replay.
    for (const [key, saved] of captured) if (saved.videoId !== meta.videoId) captured.delete(key);
    captured.set(`${meta.videoId}|${meta.lang}|${meta.kind}|${meta.tlang}`, message);
    post(message);
  }

  const nativeFetch = window.fetch;
  window.fetch = function (input, ...rest) {
    const promise = nativeFetch.call(this, input, ...rest);
    const url = typeof input === 'string' || input instanceof URL ? String(input) : input?.url;
    if (parse(url)) {
      promise.then(response => response.clone().text()).then(body => capture(url, body)).catch(() => {});
    }
    return promise;
  };

  const requestUrls = new WeakMap();
  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    requestUrls.set(this, String(url));
    return nativeOpen.call(this, method, url, ...rest);
  };
  const nativeSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args) {
    const url = requestUrls.get(this);
    if (parse(url)) {
      this.addEventListener('load', () => {
        if (this.responseType === '' || this.responseType === 'text') capture(url, this.responseText);
      });
    }
    return nativeSend.apply(this, args);
  };

  window.addEventListener('message', event => {
    if (event.source !== window || event.data?.channel !== CHANNEL || event.data.type !== 'request') return;
    for (const message of captured.values()) post(message);
  });
})();
