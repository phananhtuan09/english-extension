(() => {
  const SENTENCE_END = /[.!?…][”"'’\])}]*$/u;
  const PAUSE_MS = 1500;
  const MAX_CUE_CHARS = 90;
  const MIN_CUE_MS = 500;
  const FALLBACK_CUE_MS = 2000;

  const clean = text => String(text || '').replace(/\s+/g, ' ').trim();

  // Creator tracks: one cue per json3 event.
  function creatorCues(events) {
    return events.flatMap(event => {
      const text = clean((event.segs || []).map(seg => seg.utf8).join(''));
      if (!text) return [];
      const start = event.tStartMs || 0;
      return [{start, end: start + (event.dDurationMs || FALLBACK_CUE_MS), text}];
    });
  }

  // ASR tracks repeat and overlap windows, so rebuild cues from timed words.
  function asrWords(events) {
    const seen = new Set();
    const words = [];
    for (const event of events) {
      const eventStart = event.tStartMs || 0;
      for (const seg of event.segs || []) {
        const text = clean(seg.utf8);
        if (!text) continue;
        const start = eventStart + (seg.tOffsetMs || 0);
        const key = `${start}|${text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        words.push({start, text, eventEnd: eventStart + (event.dDurationMs || 0)});
      }
    }
    return words.sort((a, b) => a.start - b.start);
  }

  function asrCues(events) {
    const groups = [];
    let group;
    for (const word of asrWords(events)) {
      const prev = group?.at(-1);
      const chars = group ? group.reduce((sum, w) => sum + w.text.length + 1, 0) : 0;
      if (group && (SENTENCE_END.test(prev.text) || word.start - prev.start > PAUSE_MS
        || chars + word.text.length > MAX_CUE_CHARS)) group = undefined;
      if (!group) groups.push(group = []);
      group.push(word);
    }
    return groups.map((words, index) => {
      const last = words.at(-1);
      const nextStart = groups[index + 1]?.[0].start ?? Infinity;
      const ownEnd = last.eventEnd > last.start ? last.eventEnd : last.start + FALLBACK_CUE_MS;
      return {
        start: words[0].start,
        end: Math.min(Math.max(ownEnd, last.start + MIN_CUE_MS), nextStart),
        text: words.map(w => w.text).join(' '),
      };
    });
  }

  const api = {
    // Returns cues sorted by start, in milliseconds: [{start, end, text}]. Unknown formats give [].
    parseTimedText(body, {kind = ''} = {}) {
      let data;
      try { data = JSON.parse(body); } catch { return []; }
      const events = Array.isArray(data?.events) ? data.events.filter(e => Array.isArray(e.segs)) : [];
      const cues = kind === 'asr' ? asrCues(events) : creatorCues(events);
      return cues.sort((a, b) => a.start - b.start);
    },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  globalThis.BilingualTimedText = api;
})();
