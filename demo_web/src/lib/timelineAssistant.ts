import type {
  TimelineAssistantResponse,
  TimelineCandidate,
  TimelineSourceNote,
  TimelineUncertainty,
} from '../types'

const DATE_PATTERN =
  /\b(\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+\d{4})\b/i
const TIME_PATTERN = /\b(?:Waktu:\s*)?(sekitar\s+)?([01]?\d|2[0-3])[.:]([0-5]\d)\b/i
const LOCATION_PATTERN = /\bLokasi:\s*([^.\n]+)/i
const LABEL_PATTERN = /(?:Tanggal|Waktu|Lokasi):\s*[^.]+\.?\s*/gi

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function shortTitle(note: TimelineSourceNote) {
  if (note.title.trim()) return note.title.trim().slice(0, 90)
  const firstSentence = cleanText(note.text).split(/[.!?]/)[0]
  return firstSentence.slice(0, 90) || 'Peristiwa dari catatan pengguna'
}

function extractSummary(text: string) {
  const withoutLabels = cleanText(text.replace(LABEL_PATTERN, ''))
  return (withoutLabels || cleanText(text)).slice(0, 600)
}

function uncertaintyFor(note: TimelineSourceNote, date: string | null, time: string | null): TimelineUncertainty {
  if (!date) return 'missing'
  if (/\b(sekitar|mungkin|seingat\w*|kurang yakin|tidak dicatat)\b/i.test(note.text) || !time) return 'ambiguous'
  return 'explicit'
}

export function createDeterministicTimeline(notes: TimelineSourceNote[]): TimelineAssistantResponse {
  const events = notes.map<TimelineCandidate>((note, index) => {
    const date = note.text.match(DATE_PATTERN)?.[1] ?? null
    const timeMatch = note.text.match(TIME_PATTERN)
    const time = timeMatch ? `${timeMatch[2].padStart(2, '0')}:${timeMatch[3]}` : null
    const location = cleanText(note.text.match(LOCATION_PATTERN)?.[1] ?? '') || null

    return {
      id: `fallback-${index + 1}-${note.id}`,
      sourceNoteIds: [note.id],
      date,
      time,
      location,
      title: shortTitle(note),
      neutralSummary: extractSummary(note.text),
      uncertainty: uncertaintyFor(note, date, time),
      requiresReview: true,
    }
  })

  return {
    events,
    warnings: [
      'Mode fallback aktif. Data disusun secara deterministik dari label yang tertulis dan tetap harus ditinjau pengguna.',
    ],
    mode: 'fallback',
  }
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

export function validateTimelineResponse(
  value: unknown,
  allowedNoteIds: string[],
  mode: TimelineAssistantResponse['mode'],
): TimelineAssistantResponse {
  if (!value || typeof value !== 'object') throw new Error('Respons AI bukan objek.')

  const input = value as Record<string, unknown>
  if (!Array.isArray(input.events)) throw new Error('Respons AI tidak memiliki daftar events.')

  const allowed = new Set(allowedNoteIds)
  const events = input.events.map((raw, index): TimelineCandidate => {
    if (!raw || typeof raw !== 'object') throw new Error(`Event ${index + 1} tidak valid.`)
    const event = raw as Record<string, unknown>
    const sourceNoteIds = Array.isArray(event.sourceNoteIds)
      ? event.sourceNoteIds.filter((id): id is string => typeof id === 'string' && allowed.has(id))
      : []

    if (!sourceNoteIds.length) throw new Error(`Event ${index + 1} tidak memiliki sumber yang valid.`)
    if (typeof event.title !== 'string' || !event.title.trim()) throw new Error(`Event ${index + 1} tidak memiliki judul.`)
    if (typeof event.neutralSummary !== 'string' || !event.neutralSummary.trim()) {
      throw new Error(`Event ${index + 1} tidak memiliki ringkasan.`)
    }
    if (!isNullableString(event.date) || !isNullableString(event.time) || !isNullableString(event.location)) {
      throw new Error(`Event ${index + 1} memiliki bidang waktu/lokasi yang tidak valid.`)
    }
    if (!['explicit', 'ambiguous', 'missing'].includes(String(event.uncertainty))) {
      throw new Error(`Event ${index + 1} memiliki status ketidakpastian yang tidak valid.`)
    }

    return {
      id: typeof event.id === 'string' && event.id ? event.id : `ai-event-${index + 1}`,
      sourceNoteIds,
      date: event.date,
      time: event.time,
      location: event.location,
      title: event.title.trim().slice(0, 120),
      neutralSummary: event.neutralSummary.trim().slice(0, 1000),
      uncertainty: event.uncertainty as TimelineUncertainty,
      requiresReview: true,
    }
  })

  return {
    events,
    warnings: Array.isArray(input.warnings)
      ? input.warnings.filter((warning): warning is string => typeof warning === 'string').slice(0, 10)
      : [],
    mode,
  }
}

export async function requestTimeline(notes: TimelineSourceNote[]): Promise<TimelineAssistantResponse> {
  try {
    const response = await fetch('/api/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: notes.map(({ id, text, recordedAt }) => ({ id, text, recordedAt })),
      }),
    })

    if (!response.ok) throw new Error(`API merespons ${response.status}.`)

    const payload: unknown = await response.json()
    const mode =
      payload &&
      typeof payload === 'object' &&
      (payload as { mode?: unknown }).mode === 'fallback'
        ? 'fallback'
        : 'live'

    return validateTimelineResponse(payload, notes.map((note) => note.id), mode)
  } catch {
    return createDeterministicTimeline(notes)
  }
}
