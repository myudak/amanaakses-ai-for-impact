import { env } from 'node:process'
import {
  createDeterministicTimeline,
  validateTimelineResponse,
} from '../src/lib/timelineAssistant.js'
import type { TimelineSourceNote } from '../src/types.js'

const MODEL = env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
const MAX_NOTES = 10
const MAX_NOTE_LENGTH = 4000

interface ApiRequest {
  method?: string
  body?: unknown
}

interface ApiResponse {
  setHeader: (name: string, value: string) => void
  status: (code: number) => ApiResponse
  json: (payload: unknown) => unknown
}

const SYSTEM_INSTRUCTION = `
Anda adalah Safe Timeline Assistant untuk AmanAkses.
Tugas Anda hanya mengekstrak peristiwa dari catatan sintetis yang dipilih pengguna.

Aturan wajib:
1. Gunakan hanya fakta yang tertulis eksplisit dalam catatan.
2. Jangan menambah fakta, menyimpulkan niat, menilai kebenaran, menyalahkan pihak, membuat diagnosis, atau memberi klasifikasi/nasihat hukum.
3. Jika tanggal, waktu, atau lokasi tidak tertulis jelas, isi dengan null.
4. Gunakan bahasa Indonesia yang netral, singkat, dan tidak grafis.
5. Setiap event wajib mencantumkan sourceNoteIds yang benar.
6. uncertainty harus "explicit", "ambiguous", atau "missing".
7. requiresReview selalu true.
8. Semua hasil adalah draft untuk ditinjau manusia.
`.trim()

const responseSchema = {
  type: 'object',
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sourceNoteIds: { type: 'array', items: { type: 'string' } },
          date: { type: ['string', 'null'] },
          time: { type: ['string', 'null'] },
          location: { type: ['string', 'null'] },
          title: { type: 'string' },
          neutralSummary: { type: 'string' },
          uncertainty: { type: 'string', enum: ['explicit', 'ambiguous', 'missing'] },
          requiresReview: { type: 'boolean' },
        },
        required: [
          'id',
          'sourceNoteIds',
          'date',
          'time',
          'location',
          'title',
          'neutralSummary',
          'uncertainty',
          'requiresReview',
        ],
        additionalProperties: false,
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['events', 'warnings'],
  additionalProperties: false,
}

function normalizeNotes(body: unknown): TimelineSourceNote[] {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { notes?: unknown }).notes)) return []

  return (body as { notes: unknown[] }).notes
    .filter((note): note is Record<string, unknown> => Boolean(note) && typeof note === 'object')
    .slice(0, MAX_NOTES)
    .map((note) => ({
      id: typeof note.id === 'string' ? note.id.slice(0, 100) : '',
      title: '',
      text: typeof note.text === 'string' ? note.text.slice(0, MAX_NOTE_LENGTH) : '',
      recordedAt: typeof note.recordedAt === 'string' ? note.recordedAt.slice(0, 100) : undefined,
      sourceType: 'jurnal' as const,
      tags: [],
      linkedEvidenceIds: [],
    }))
    .filter((note) => note.id && note.text.trim())
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Gunakan metode POST.' })
  }

  const notes = normalizeNotes(request.body)
  if (!notes.length) return response.status(400).json({ error: 'Pilih setidaknya satu catatan.' })

  if (!env.GEMINI_API_KEY) {
    return response.status(200).json(createDeterministicTimeline(notes))
  }

  try {
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent` +
      `?key=${encodeURIComponent(env.GEMINI_API_KEY)}`
    const geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Susun timeline dari JSON berikut:\n${JSON.stringify(
                  notes.map(({ id, text, recordedAt }) => ({ id, text, recordedAt })),
                )}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseJsonSchema: responseSchema,
        },
      }),
    })

    if (!geminiResponse.ok) throw new Error(`Gemini API ${geminiResponse.status}`)
    const payload = await geminiResponse.json() as {
      candidates?: Array<{ content?: { parts?: unknown[] } }>
    }
    const parts: unknown[] = Array.isArray(payload?.candidates?.[0]?.content?.parts)
      ? payload.candidates[0].content.parts
      : []
    const text = parts
      .map((part) => (part && typeof part === 'object' && typeof (part as { text?: unknown }).text === 'string'
        ? (part as { text: string }).text
        : ''))
      .join('')
    if (!text) throw new Error('Gemini tidak mengembalikan teks.')

    const result = validateTimelineResponse(JSON.parse(text), notes.map((note) => note.id), 'live')
    result.warnings.unshift('Draft AI wajib diperiksa. AmanAkses tidak menilai kebenaran atau status hukum.')
    return response.status(200).json(result)
  } catch {
    const fallback = createDeterministicTimeline(notes)
    fallback.warnings.unshift('Layanan Gemini tidak tersedia; sistem beralih ke mode fallback lokal.')
    return response.status(200).json(fallback)
  }
}
