const test = require('node:test');
const assert = require('node:assert/strict');
const {createCueTimeline} = require('../src/cue-timeline.js');

const cues = [
  {start: 0, end: 1000, text: 'one'},
  {start: 1000, end: 2000, text: 'two'},
  {start: 3000, end: 4000, text: 'three'},
];
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

test('finds the active cue by time and nothing in gaps or outside the track', () => {
  const timeline = createCueTimeline();
  timeline.load('v1', cues);
  assert.equal(timeline.at(0).text, 'one');
  assert.equal(timeline.at(999).text, 'one');
  assert.equal(timeline.at(1000).text, 'two');
  assert.equal(timeline.at(2500), null);
  assert.equal(timeline.at(3500).text, 'three');
  assert.equal(timeline.at(9000), null);
});

test('translates every cue ahead of time, starting at the playback position', async () => {
  const timeline = createCueTimeline();
  timeline.load('v1', cues);
  timeline.at(3000);
  const order = [];
  await timeline.translateAll(async text => { order.push(text); return `vi ${text}`; });
  assert.deepEqual(order, ['three', 'one', 'two']);
  assert.equal(timeline.at(1500).translation, 'vi two');
  assert.equal(timeline.isTranslating(), false);
});

test('seeking re-prioritises the cues still missing', async () => {
  const timeline = createCueTimeline();
  timeline.load('v1', cues);
  const order = [];
  const done = timeline.translateAll(async text => {
    order.push(text);
    if (text === 'one') timeline.at(3000);
    await tick();
    return `vi ${text}`;
  });
  await done;
  assert.deepEqual(order, ['one', 'three', 'two']);
});

test('a failed cue is skipped and marked, other cues continue', async () => {
  const timeline = createCueTimeline();
  timeline.load('v1', cues);
  await timeline.translateAll(async text => {
    if (text === 'two') throw new Error('boom');
    return `vi ${text}`;
  });
  assert.equal(timeline.at(1500).failed, true);
  assert.equal(timeline.at(1500).translation, '');
  assert.equal(timeline.at(0).translation, 'vi one');
});

test('errors that need user action stop the loop and can be retried', async () => {
  const timeline = createCueTimeline();
  timeline.load('v1', cues);
  await assert.rejects(timeline.translateAll(async () => {
    throw Object.assign(new Error('gesture'), {name: 'NotAllowedError'});
  }), {name: 'NotAllowedError'});
  assert.equal(timeline.isTranslating(), false);
  await timeline.translateAll(async text => `vi ${text}`);
  assert.equal(timeline.at(0).translation, 'vi one');
});

test('results that arrive after a reload or abort are dropped', async () => {
  const timeline = createCueTimeline();
  timeline.load('v1', cues);
  let finish;
  const pending = timeline.translateAll(() => new Promise(resolve => { finish = resolve; }));
  timeline.load('v2', [{start: 0, end: 1000, text: 'other'}]);
  finish('stale');
  await pending;
  assert.equal(timeline.videoId(), 'v2');
  assert.equal(timeline.at(0).translation, '');

  const aborted = timeline.translateAll(() => new Promise(resolve => { finish = resolve; }));
  timeline.abort();
  finish('late');
  await aborted;
  assert.equal(timeline.at(0).translation, '');
  assert.equal(timeline.isTranslating(), false);
});

test('concurrent translateAll calls share one loop', async () => {
  const timeline = createCueTimeline();
  timeline.load('v1', cues);
  let calls = 0;
  const run = () => timeline.translateAll(async text => { calls += 1; return text; });
  await Promise.all([run(), run()]);
  assert.equal(calls, 3);
});
