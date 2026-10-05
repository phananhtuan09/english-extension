(() => {
  const api = {
    cleanCaption(text) {
      return String(text || '').replace(/\s+/g, ' ').trim();
    },

    createCueController(onChange, settleMs = 250, onSettled = () => {}, sentenceSettleMs = 160) {
      let currentText = '';
      let translatedText = '';
      let status = 'idle';
      let revision = 0;
      let timer;

      const publish = () => onChange({text: currentText, translation: translatedText, status, revision});

      return {
        update(text) {
          const next = api.cleanCaption(text);
          if (next === currentText) return;
          // ASR captions grow word by word inside one cue; keep the translation of the
          // shorter text on screen until the refreshed one arrives. Anything else is a new cue.
          const isGrowth = Boolean(currentText && translatedText && next.startsWith(currentText));
          currentText = next;
          revision += 1;
          if (!isGrowth) translatedText = '';
          status = !next ? 'idle' : translatedText ? 'translated' : 'waiting';
          publish();
          if (!next) {
            clearTimeout(timer);
            timer = undefined;
            return;
          }
          const isSentenceEnd = /[.!?…][”"'’\])}]*$/u.test(next);
          // Throttle, not debounce: continuous speech must not keep postponing translation.
          if (timer && !isSentenceEnd) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            timer = undefined;
            if (!translatedText) status = 'translating';
            publish();
            onSettled(currentText, revision);
          }, isSentenceEnd ? Math.min(settleMs, sentenceSettleMs) : settleMs);
        },

        async translate(translateText) {
          if (!currentText) return;
          const expectedRevision = revision;
          const source = currentText;
          clearTimeout(timer);
          timer = undefined;
          if (!translatedText) status = 'translating';
          publish();
          try {
            const result = await translateText(source);
            if (revision !== expectedRevision || source !== currentText) return;
            translatedText = api.cleanCaption(result);
            status = translatedText ? 'translated' : 'unavailable';
          } catch (error) {
            if (revision !== expectedRevision) return;
            status = error?.name === 'NotSupportedError' ? 'unsupported' : 'unavailable';
          }
          publish();
        },

        setStatus(nextStatus) {
          status = nextStatus;
          publish();
        },

        clear() {
          clearTimeout(timer);
          timer = undefined;
          currentText = '';
          translatedText = '';
          revision += 1;
          status = 'idle';
          publish();
        },

        snapshot() {
          return {text: currentText, translation: translatedText, status, revision};
        },
      };
    },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  globalThis.BilingualCue = api;
})();
