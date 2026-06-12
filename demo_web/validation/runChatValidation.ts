import assert from 'node:assert/strict'
import {
  createDeterministicChatReply,
  validateChatResponse,
} from '../src/lib/chatAssistant'
import { chatFixtures } from './chatFixtures'

let passed = 0

for (const fixture of chatFixtures) {
  const result = createDeterministicChatReply(fixture.message)
  const validated = validateChatResponse(result, 'fallback')

  assert.equal(validated.safetyLevel, fixture.expectedLevel, `${fixture.id}: safety level`)
  assert.ok(
    validated.suggestedActions.some((item) => item.route === fixture.expectedRoute),
    `${fixture.id}: expected route`,
  )
  assert.ok(validated.reply.length > 20, `${fixture.id}: meaningful reply`)
  assert.equal(validated.mode, 'fallback', `${fixture.id}: fallback mode`)
  if (fixture.expectedTool) {
    assert.ok(
      validated.toolCalls.some((item) => item.name === fixture.expectedTool),
      `${fixture.id}: expected tool`,
    )
    assert.ok(
      validated.toolCalls.every((item) => item.requiresConfirmation),
      `${fixture.id}: tools require confirmation`,
    )
  }

  passed += 1
  console.log(`PASS ${fixture.id}: ${fixture.expectedLevel} -> ${fixture.expectedRoute}`)
}

const sanitized = validateChatResponse(
  {
    reply: 'Jawaban aman.',
    suggestedActions: [
      { label: 'Route valid', route: '/app/dashboard' },
      { label: 'Route berbahaya', route: 'https://example.com/collect-data' },
    ],
    toolCalls: [
      {
        id: 'valid-tool',
        name: 'draft_timeline',
        label: 'Buat draft',
        description: 'Memproses catatan demo.',
        requiresConfirmation: false,
        arguments: { sourcePreset: 'recent-notes' },
      },
      {
        id: 'invalid-tool',
        name: 'send_private_data',
        label: 'Kirim data',
        description: 'Tidak boleh.',
        requiresConfirmation: false,
        arguments: {},
      },
    ],
    safetyLevel: 'normal',
    disclaimer: 'Batasan.',
  },
  'live',
)

assert.deepEqual(sanitized.suggestedActions, [
  { label: 'Route valid', route: '/app/dashboard' },
])
assert.equal(sanitized.toolCalls.length, 1)
assert.equal(sanitized.toolCalls[0].name, 'draft_timeline')
assert.equal(sanitized.toolCalls[0].requiresConfirmation, true)

const urgentSanitized = validateChatResponse(
  {
    reply: 'Prioritaskan keselamatan.',
    suggestedActions: [{ label: 'Keluar cepat', route: '/safe-exit' }],
    toolCalls: [
      {
        id: 'unsafe-urgent-tool',
        name: 'draft_timeline',
        label: 'Buat draft',
        description: 'Tidak relevan saat darurat.',
        requiresConfirmation: true,
        arguments: { sourcePreset: 'recent-notes' },
      },
    ],
    safetyLevel: 'urgent',
    disclaimer: 'Batasan.',
  },
  'live',
)

assert.equal(urgentSanitized.toolCalls.length, 0)

console.log(
  `\n${passed}/${chatFixtures.length} fixture chatbot lolos. Route eksternal dan tool tidak dikenal ditolak; tool darurat non-bantuan diblokir.`,
)
