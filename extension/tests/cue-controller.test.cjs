const test = require('node:test');
const assert = require('node:assert/strict');
const {createCueController, cleanCaption} = require('../src/cue-controller.js');

const tick = ms => new Promise(resolve => setTimeout(resolve, ms));

test('normalizes whitespace without changing caption text', () => {
  assert.equal(cleanCaption('  Hello\n  there   friend '), 'Hello there friend');
});

test('clears prior translation immediately when caption changes', async () => {
  const states = [];
  const cue = createCueController(state => states.push(state), 5);
  cue.update('First caption');
  await cue.translate(async () => 'Bản dịch thứ nhất');
  assert.equal(cue.snapshot().translation, 'Bản dịch thứ nhất');
  cue.update('Second caption');
  assert.equal(cue.snapshot().text, 'Second caption');
  assert.equal(cue.snapshot().translation, '');
  assert.equal(cue.snapshot().status, 'waiting');
  assert.ok(states.some(state => state.text === 'Second caption' && state.translation === ''));
});

test('ignores a translation that resolves after the cue changed', async () => {
  const cue = createCueController(() => {}, 1000);
  cue.update('Old cue');
  let finish;
  const pending = cue.translate(() => new Promise(resolve => { finish = resolve; }));
  cue.update('New cue');
  finish('Old translation');
  await pending;
  assert.deepEqual(cue.snapshot(), {text: 'New cue', translation: '', status: 'waiting', revision: 2});
});

test('settles only the latest incremental caption', async () => {
  const settled = [];
  const cue = createCueController(() => {}, 15, text => settled.push(text));
  cue.update('an incremental');
  await tick(5);
  cue.update('an incremental caption');
  await tick(25);
  assert.deepEqual(settled, ['an incremental caption']);
});

test('sentence-ending punctuation commits before the fallback quiet period', async () => {
  const settled = [];
  const cue = createCueController(() => {}, 1000, text => settled.push(text), 20);
  cue.update('This is the complete sentence.');
  await tick(40);
  assert.deepEqual(settled, ['This is the complete sentence.']);
});

test('clearing caption invalidates in-flight translation and removes old result', async () => {
  const cue = createCueController(() => {}, 1000);
  cue.update('Caption');
  let finish;
  const pending = cue.translate(() => new Promise(resolve => { finish = resolve; }));
  cue.clear();
  finish('Late translation');
  await pending;
  assert.equal(cue.snapshot().text, '');
  assert.equal(cue.snapshot().translation, '');
  assert.equal(cue.snapshot().status, 'idle');
});
