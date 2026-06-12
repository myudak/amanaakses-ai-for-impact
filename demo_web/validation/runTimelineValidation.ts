import assert from 'node:assert/strict'
import { createDeterministicTimeline, validateTimelineResponse } from '../src/lib/timelineAssistant'
import { timelineFixtures } from './timelineFixtures'

let passed = 0

for (const fixture of timelineFixtures) {
  const result = createDeterministicTimeline(fixture.notes)
  const validated = validateTimelineResponse(result, fixture.notes.map((note) => note.id), 'fallback')
  const first = validated.events[0]

  assert.equal(validated.events.length, fixture.expected.eventCount, `${fixture.id}: event count`)
  assert.equal(first.date, fixture.expected.firstDate, `${fixture.id}: date`)
  assert.equal(first.time, fixture.expected.firstTime, `${fixture.id}: time`)
  assert.equal(first.location, fixture.expected.firstLocation, `${fixture.id}: location`)
  assert.equal(first.uncertainty, fixture.expected.firstUncertainty, `${fixture.id}: uncertainty`)
  assert.equal(first.requiresReview, true, `${fixture.id}: requiresReview`)
  assert.ok(first.sourceNoteIds.length > 0, `${fixture.id}: source required`)
  assert.ok(first.sourceNoteIds.every((id) => fixture.notes.some((note) => note.id === id)), `${fixture.id}: source must exist`)

  passed += 1
  console.log(`PASS ${fixture.id}: ${fixture.description}`)
}

assert.throws(
  () =>
    validateTimelineResponse(
      {
        events: [
          {
            id: 'invalid',
            sourceNoteIds: ['invented-source'],
            date: null,
            time: null,
            location: null,
            title: 'Tanpa sumber',
            neutralSummary: 'Harus ditolak.',
            uncertainty: 'missing',
            requiresReview: true,
          },
        ],
        warnings: [],
      },
      ['allowed-source'],
      'live',
    ),
  /sumber yang valid/,
)

console.log(`\n${passed}/${timelineFixtures.length} fixture lolos. Respons tanpa sumber valid juga berhasil ditolak.`)
