import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error Node runs this test directly with native TypeScript stripping.
import { safeLearningUrl, validatePathwayEvidence, isPathwayStepUnlocked } from '../src/lib/pathway-progress.ts';

test('evidence preserves the learning record and rejects empty or excessive submissions', () => {
  assert.deepEqual(validatePathwayEvidence({ prediction: '  tăng  ', response: ' N = 500 ', nextStep: ' giải thích ', correctAnswer: 'secret' }), { prediction: 'tăng', response: 'N = 500', nextStep: 'giải thích' });
  for (const input of [null, [], {}, { prediction: '', response: ' ', nextStep: '' }, { prediction: '', response: 'x'.repeat(2001), nextStep: '' }, { prediction: 1, response: 'ok', nextStep: '' }]) assert.equal(validatePathwayEvidence(input), null);
});

test('learning links reject executable and protocol-relative URLs', () => {
  for (const input of ['javascript:alert(1)', 'data:text/html,test', '//example.org', '/\\example.org', 'https://user:password@example.org', ' https://example.org', 'https:\n//example.org']) assert.equal(safeLearningUrl(input), null);
  assert.equal(safeLearningUrl('/phiếu học tập.pdf'), '/phi%E1%BA%BFu%20h%E1%BB%8Dc%20t%E1%BA%ADp.pdf');
  assert.equal(safeLearningUrl('https://example.org/lesson'), 'https://example.org/lesson');
});

test('unfinished earlier required steps block later work; optional steps do not', () => {
  const make = (id: string, order: number, required: boolean, completed: boolean) => ({ id, order, required, completed, title: '', instructions: '', type: 'document', url: null, activityKey: null, evidence: null });
  const steps = [make('required', 1, true, false), make('optional', 2, false, false), make('later', 3, true, false)];
  assert.equal(isPathwayStepUnlocked(steps, steps[0]), true);
  assert.equal(isPathwayStepUnlocked(steps, steps[2]), false);
  steps[0].completed = true;
  assert.equal(isPathwayStepUnlocked(steps, steps[2]), true);
  // Mirrors the database's strict comparison when two concurrent inserts share an order.
  steps[0].order = 3; steps[0].completed = false;
  assert.equal(isPathwayStepUnlocked(steps, steps[2]), true);
});
