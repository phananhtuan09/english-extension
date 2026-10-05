(() => {
  if (globalThis.__youtubeBilingualLoaded) return;
  globalThis.__youtubeBilingualLoaded = true;

  const DEFAULTS = {enabled: false, position: 'bottom', size: 1, contrast: 'adaptive'};
  let settings = {...DEFAULTS};
  let player;
  let overlay;
  let shadow;
  let nativeCaptionStyle;
  let translator;
  let translatorPromise;
  let trackPoll;
  let captionObserver;
  let timelineTick;
  let timelineStatus = '';
  let lastTimelineKey = '';
  let loadedBody = '';

  const statusText = {
    idle: '', waiting: '', translating: 'Đang dịch…',
    unsupported: 'Chrome hiện không hỗ trợ dịch EN → VI.',
    unavailable: 'Chưa thể dịch câu này. Video vẫn tiếp tục phát.',
    gestureRequired: 'Chạm nút bên dưới để khởi tạo mô hình dịch.',
    noCaptions: 'Chưa thấy phụ đề. Hãy bật track tiếng Anh trong YouTube.',
  };

  function findPlayer() {
    return document.querySelector('#movie_player');
  }

  function setNativeCaptionsHidden(hidden) {
    if (!hidden) {
      nativeCaptionStyle?.remove();
      nativeCaptionStyle = null;
      return;
    }
    if (nativeCaptionStyle?.isConnected) return;
    nativeCaptionStyle = document.createElement('style');
    nativeCaptionStyle.id = 'yt-bilingual-hide-native-captions';
    nativeCaptionStyle.textContent = `
      #movie_player .ytp-caption-window-container,
      #movie_player .ytp-caption-window-bottom,
      #movie_player .ytp-caption-window-top {
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    (document.head || document.documentElement).append(nativeCaptionStyle);
  }

  function ensureOverlay() {
    const nextPlayer = findPlayer();
    if (!nextPlayer) return false;
    if (player === nextPlayer && overlay?.isConnected) return true;
    overlay?.remove();
    player = nextPlayer;
    if (getComputedStyle(player).position === 'static') player.style.position = 'relative';
    overlay = document.createElement('div');
    overlay.id = 'yt-bilingual-overlay';
    shadow = overlay.attachShadow({mode: 'closed'});
    const style = document.createElement('style');
    style.textContent = `
      :host { position:absolute; z-index:2147483000; left:5%; right:5%; display:none; pointer-events:none;
        box-sizing:border-box; text-align:center; font-family:Arial, "Noto Sans", sans-serif;
        --caption-size: clamp(18px, 2.3vw, 30px); --ink:#fff; --muted:#e9eef5; --shade:rgba(12,16,22,.52); }
      :host([data-position="bottom"]) { bottom:13%; }
      :host([data-position="top"]) { top:12%; }
      :host([data-contrast="high"]) { --shade:rgba(4,7,12,.82); --ink:#fff; --muted:#fff; }
      .wrap { display:flex; flex-direction:column; gap:.32em; width:min(76%, 900px); max-width:90%; margin:0 auto;
        padding:.2em .48em; border-radius:5px; background:var(--shade); box-decoration-break:clone;
        -webkit-box-decoration-break:clone; text-shadow:0 1px 2px #000, 0 0 5px #000; }
      .source { color:var(--ink); font-size:calc(var(--caption-size) * var(--scale, 1)); font-weight:650; line-height:1.22; text-align:left; }
      .translation { color:var(--muted); font-size:calc(var(--caption-size) * var(--scale, 1) * .88); font-weight:500; line-height:1.25; text-align:left; }
      .status { color:#d9e8fa; font-size:calc(var(--caption-size) * var(--scale, 1) * .58); font-weight:500; line-height:1.3; }
      .gesture { pointer-events:auto; margin:.25em auto 0; padding:.35em .7em; border:1px solid rgba(255,255,255,.48);
        border-radius:4px; background:rgba(20,35,48,.88); color:#fff; font:600 12px Arial,sans-serif; cursor:pointer; }
      [hidden] { display:none !important; }
    `;
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const source = document.createElement('div');
    source.className = 'source';
    const translation = document.createElement('div');
    translation.className = 'translation';
    const status = document.createElement('div');
    status.className = 'status';
    const gesture = document.createElement('button');
    gesture.className = 'gesture';
    gesture.type = 'button';
    gesture.textContent = 'Khởi tạo dịch EN → VI';
    gesture.hidden = true;
    gesture.addEventListener('click', () => translateCurrent({fromGesture: true}));
    wrap.append(source, translation, status, gesture);
    shadow.append(style, wrap);
    player.append(overlay);
    applySettings();
    return true;
  }

  function applySettings() {
    setNativeCaptionsHidden(settings.enabled);
    if (!overlay) return;
    overlay.dataset.position = settings.position;
    overlay.dataset.contrast = settings.contrast === 'high' ? 'high' : 'adaptive';
    overlay.style.setProperty('--scale', String(Math.min(1.4, Math.max(.8, Number(settings.size) || 1))));
    overlay.style.display = settings.enabled ? 'block' : 'none';
  }

  function render(state) {
    if (!ensureOverlay()) return;
    shadow.querySelector('.source').textContent = state.text;
    const translation = shadow.querySelector('.translation');
    translation.textContent = state.translation;
    translation.hidden = !state.translation;
    const status = shadow.querySelector('.status');
    status.textContent = statusText[state.status] || '';
    status.hidden = !status.textContent;
    shadow.querySelector('.wrap').hidden = !state.text && !status.textContent;
    shadow.querySelector('.gesture').hidden = state.status !== 'gestureRequired';
    applySettings();
  }

  const cue = BilingualCue.createCueController(render, 250, (_text, revision) => translateCurrent({revision}));

  const timeline = BilingualTimeline.createCueTimeline();
  const TRACK_CHANNEL = 'yt-bilingual';

  const currentVideoId = () => new URLSearchParams(location.search).get('v') || '';

  // Cues delivered by page-hook.js replace the DOM path for as long as they cover the current video.
  function onTrack(message) {
    if (message.tlang || !/^en(-|$)/i.test(message.lang)) return;
    if (!message.videoId || message.videoId !== currentVideoId()) return;
    if (timeline.videoId() === message.videoId && message.body === loadedBody) return;
    const cues = BilingualTimedText.parseTimedText(message.body, {kind: message.kind});
    if (!cues.length) return;
    loadedBody = message.body;
    timeline.load(message.videoId, cues);
    timelineStatus = '';
    if (settings.enabled) {
      cue.clear();
      startTimelineTick();
      translateCurrent();
    }
  }

  window.addEventListener('message', event => {
    const data = event.data;
    if (event.source !== window || data?.channel !== TRACK_CHANNEL || data.type !== 'timedtext') return;
    if (typeof data.body === 'string') onTrack(data);
  });
  const requestTracks = () => window.postMessage({channel: TRACK_CHANNEL, type: 'request'}, location.origin);

  function startTimelineTick() {
    clearInterval(timelineTick);
    lastTimelineKey = '';
    timelineTick = setInterval(renderTimeline, 100);
    renderTimeline();
  }

  function stopTimelineTick() {
    clearInterval(timelineTick);
    timelineTick = undefined;
  }

  function renderTimeline() {
    if (!settings.enabled || !timeline.hasCues()) return;
    const video = findPlayer()?.querySelector('video');
    if (!video) return;
    const item = timeline.at(video.currentTime * 1000);
    const status = !item ? 'idle'
      : item.translation ? 'translated'
        : item.failed ? 'unavailable'
          : timelineStatus || (timeline.isTranslating() ? 'translating' : 'waiting');
    const state = {text: item?.text || '', translation: item?.translation || '', status};
    const key = `${state.text}\n${state.translation}\n${state.status}`;
    if (key === lastTimelineKey) return;
    lastTimelineKey = key;
    render(state);
  }

  function readCaption() {
    if (timeline.hasCues()) return;
    const text = [...document.querySelectorAll('.ytp-caption-segment')]
      .map(node => node.textContent.trim()).filter(Boolean).join(' ');
    if (text) cue.update(text);
    else if (settings.enabled) {
      if (cue.snapshot().text) cue.clear();
      if (cue.snapshot().status !== 'noCaptions') cue.setStatus('noCaptions');
    }
  }

  async function translateTimeline(fromGesture) {
    if (typeof Translator === 'undefined') {
      timelineStatus = 'unsupported';
      return;
    }
    try {
      await ensureTranslator(fromGesture);
      timelineStatus = '';
      await timeline.translateAll(text => translator.translate(text));
    } catch (error) {
      timelineStatus = error?.name === 'NotAllowedError' ? 'gestureRequired'
        : error?.name === 'NotSupportedError' ? 'unsupported' : 'unavailable';
    }
  }

  async function translateCurrent({fromGesture = false, revision = cue.snapshot().revision} = {}) {
    if (!settings.enabled) return;
    if (timeline.hasCues()) return translateTimeline(fromGesture);
    if (!cue.snapshot().text) return;
    if (typeof Translator === 'undefined') {
      cue.setStatus('unsupported');
      return;
    }
    try {
      await ensureTranslator(fromGesture);
      if (revision !== cue.snapshot().revision) return;
      await cue.translate(text => translator.translate(text));
    } catch (error) {
      cue.setStatus(error?.name === 'NotAllowedError' ? 'gestureRequired'
        : error?.name === 'NotSupportedError' ? 'unsupported' : 'unavailable');
    }
  }

  function ensureTranslator(fromGesture) {
    if (translator) return Promise.resolve(translator);
    if (!translatorPromise) {
      translatorPromise = (async () => {
        if (!fromGesture) {
          const availability = await Translator.availability({sourceLanguage: 'en', targetLanguage: 'vi'});
          if (availability === 'unavailable') throw Object.assign(new Error('Unsupported language pair'), {name: 'NotSupportedError'});
        }
        // On an in-player click, call create before awaiting anything so Chrome
        // can use that user activation to download the local language model.
        return Translator.create({sourceLanguage: 'en', targetLanguage: 'vi', monitor: attachDownloadMonitor});
      })().then(instance => {
        translator = instance;
        return instance;
      }).finally(() => { translatorPromise = null; });
    }
    return translatorPromise;
  }

  function attachDownloadMonitor(monitor) {
    monitor.addEventListener('downloadprogress', event => {
      if (timeline.hasCues()) timelineStatus = event.loaded < 1 ? 'translating' : '';
      else cue.setStatus(event.loaded < 1 ? 'translating' : 'waiting');
    });
  }

  function startWatching() {
    if (!ensureOverlay()) return;
    if (!captionObserver) {
      captionObserver = new MutationObserver(readCaption);
      captionObserver.observe(player, {subtree: true, childList: true, characterData: true});
    }
    clearInterval(trackPoll);
    trackPoll = setInterval(() => {
      const caption = document.querySelector('.ytp-caption-segment');
      if (!caption) readCaption();
    }, 1000);
    if (timeline.hasCues()) {
      startTimelineTick();
      translateCurrent();
    } else readCaption();
  }

  function onNavigate() {
    timeline.clear();
    loadedBody = '';
    if (!settings.enabled) {
      requestTracks();
      return;
    }
    stopTimelineTick();
    cue.clear();
    captionObserver?.disconnect();
    captionObserver = null;
    translator?.destroy();
    translator = null;
    player = null;
    overlay?.remove();
    overlay = null;
    requestTracks();
    if (settings.enabled) startWatching();
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'BILINGUAL_TOGGLE') {
      settings.enabled = Boolean(message.enabled);
      applySettings();
      if (settings.enabled) startWatching();
      else { timeline.abort(); stopTimelineTick(); cue.clear(); clearInterval(trackPoll); }
      sendResponse({ok: true});
      return;
    }
    if (message.type === 'BILINGUAL_TRANSLATE') {
      translateCurrent().then(() => sendResponse({ok: true}));
      return true;
    }
    if (message.type === 'BILINGUAL_STATUS') {
      sendResponse({ok: true, enabled: settings.enabled, caption: cue.snapshot()});
    }
  });

  document.addEventListener('yt-navigate-finish', onNavigate);
  requestTracks();

  chrome.storage.sync.get(DEFAULTS, stored => {
    settings = {...DEFAULTS, ...stored};
    if (settings.enabled) startWatching();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const [key, value] of Object.entries(changes)) settings[key] = value.newValue;
    applySettings();
  });

  globalThis.__youtubeBilingual = {translateCurrent, cue};
})();
