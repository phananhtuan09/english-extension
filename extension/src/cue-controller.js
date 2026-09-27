(() => {
  const api = {
    cleanCaption(text) {
      return String(text || '').replace(/\s+/g, ' ').trim();
    },

    createCueController(onChange, settleMs = 900, onSettled = () => {}, sentenceSettleMs = 160) {
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
          currentText = next;
          revision += 1;
          clearTimeout(timer);
          translatedText = '';
          status = next ? 'waiting' : 'idle';
          const expectedRevision = revision;
          publish();
          if (next) {
            const isSentenceEnd = /[.!?…][”"'’\])}]*$/u.test(next);
            timer = setTimeout(() => {
              if (revision !== expectedRevision) return;
              status = 'translating';
              publish();
              onSettled(currentText, expectedRevision);
            }, isSentenceEnd ? Math.min(settleMs, sentenceSettleMs) : settleMs);
          }
        },

        async translate(translateText) {
          if (!currentText) return;
          const expectedRevision = revision;
          const source = currentText;
          clearTimeout(timer);
          status = 'translating';
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
