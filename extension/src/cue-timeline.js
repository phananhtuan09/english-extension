(() => {
  const FATAL_ERRORS = new Set(['NotAllowedError', 'NotSupportedError']);

  const api = {
    // Holds every cue of one video, looks them up by playback time and translates them ahead of time.
    createCueTimeline() {
      let videoId = '';
      let cues = [];
      let translations = [];
      let failed = new Set();
      let cursor = 0;
      let generation = 0;
      let running = null;

      // First cue that has not ended at `ms`.
      const lowerBound = ms => {
        let lo = 0;
        let hi = cues.length;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (cues[mid].end > ms) hi = mid; else lo = mid + 1;
        }
        return lo;
      };

      const nextPending = () => {
        for (let step = 0; step < cues.length; step += 1) {
          const index = (cursor + step) % cues.length;
          if (!translations[index] && !failed.has(index)) return index;
        }
        return -1;
      };

      const api = {
        load(nextVideoId, nextCues) {
          api.abort();
          generation += 1;
          videoId = nextVideoId;
          cues = nextCues;
          translations = new Array(cues.length).fill('');
          failed = new Set();
          cursor = 0;
        },

        clear() {
          api.load('', []);
        },

        videoId() { return videoId; },

        hasCues() { return cues.length > 0; },

        // Returns the cue active at `ms` (or null) and moves translation priority to the cues from there on.
        at(ms) {
          const index = lowerBound(ms);
          cursor = index < cues.length ? index : 0;
          const cue = cues[index];
          if (!cue || cue.start > ms) return null;
          return {index, text: cue.text, words: cue.words, translation: translations[index], failed: failed.has(index)};
        },

        isTranslating() { return running !== null; },

        // Stops the translation loop; a later translateAll resumes with the cues still missing.
        abort() {
          running = null;
        },

        // Translates cues one at a time, nearest to the playback position first. Resolves when every
        // cue is done or the loop was aborted; rejects on errors that need user action or a different engine.
        translateAll(translateText) {
          if (running) return running.promise;
          const myGeneration = generation;
          const run = {};
          const isCurrent = () => running === run && generation === myGeneration;
          running = run;
          run.promise = (async () => {
            try {
              while (isCurrent()) {
                const index = nextPending();
                if (index < 0) break;
                try {
                  const result = String(await translateText(cues[index].text) || '').replace(/\s+/g, ' ').trim();
                  if (!isCurrent()) return;
                  if (result) translations[index] = result; else failed.add(index);
                } catch (error) {
                  if (!isCurrent()) return;
                  if (FATAL_ERRORS.has(error?.name)) throw error;
                  failed.add(index);
                }
              }
            } finally {
              if (running === run) running = null;
            }
          })();
          return run.promise;
        },
      };
      return api;
    },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  globalThis.BilingualTimeline = api;
})();
