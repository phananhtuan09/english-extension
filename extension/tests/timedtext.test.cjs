const test = require('node:test');
const assert = require('node:assert/strict');
const {parseTimedText} = require('../src/timedtext.js');

const json3 = events => JSON.stringify({events});

test('creator track keeps one cue per event and drops blank events', () => {
  const body = json3([
    {tStartMs: 0, dDurationMs: 2000, segs: [{utf8: 'Hello\nthere'}]},
    {tStartMs: 2000, dDurationMs: 100, segs: [{utf8: '\n'}]},
    {tStartMs: 2500, dDurationMs: 1500, segs: [{utf8: 'General '}, {utf8: 'Kenobi.'}]},
    {tStartMs: 5000},
  ]);
  assert.deepEqual(parseTimedText(body), [
    {start: 0, end: 2000, text: 'Hello there', words: [{start: 0, text: 'Hello'}, {start: 1000, text: 'there'}]},
    {start: 2500, end: 4000, text: 'General Kenobi.', words: [{start: 2500, text: 'General'}, {start: 3250, text: 'Kenobi.'}]},
  ]);
});

test('ASR track removes overlapping repeats and splits on sentence end', () => {
  const body = json3([
    {tStartMs: 0, dDurationMs: 4000, wWinId: 1, segs: [{utf8: 'we'}, {utf8: ' are', tOffsetMs: 300}, {utf8: ' here.', tOffsetMs: 600}]},
    {tStartMs: 600, dDurationMs: 3000, aAppend: 1, segs: [{utf8: '\n'}]},
    {tStartMs: 600, dDurationMs: 3000, segs: [{utf8: ' here.'}, {utf8: ' next', tOffsetMs: 400}, {utf8: ' one', tOffsetMs: 800}]},
  ]);
  const cues = parseTimedText(body, {kind: 'asr'});
  assert.deepEqual(cues.map(cue => cue.text), ['we are here.', 'next one']);
});

test('ASR words split on pauses and keep cues sorted without overlap', () => {
  const body = json3([
    {tStartMs: 0, dDurationMs: 6000, segs: [{utf8: 'first'}, {utf8: ' part', tOffsetMs: 400}]},
    {tStartMs: 3000, dDurationMs: 6000, segs: [{utf8: 'second'}, {utf8: ' part', tOffsetMs: 400}]},
  ]);
  const cues = parseTimedText(body, {kind: 'asr'});
  assert.deepEqual(cues, [
    {start: 0, end: 3000, text: 'first part', words: [{start: 0, text: 'first'}, {start: 400, text: 'part'}]},
    {start: 3000, end: 9000, text: 'second part', words: [{start: 3000, text: 'second'}, {start: 3400, text: 'part'}]},
  ]);
});

test('ASR cues are capped in length at a word boundary', () => {
  const segs = Array.from({length: 40}, (_, i) => ({utf8: ` word${i}`, tOffsetMs: i * 300}));
  const cues = parseTimedText(json3([{tStartMs: 0, dDurationMs: 20000, segs}]), {kind: 'asr'});
  assert.ok(cues.length > 1);
  assert.ok(cues.every(cue => cue.text.length <= 90));
  assert.equal(cues.map(cue => cue.text).join(' ').split(' ').length, 40);
});

test('unknown or invalid bodies give no cues', () => {
  assert.deepEqual(parseTimedText('<transcript></transcript>'), []);
  assert.deepEqual(parseTimedText(''), []);
  assert.deepEqual(parseTimedText('{"events":"x"}'), []);
});
