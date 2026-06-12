import type { TimelineSourceNote } from '../src/types'

export interface TimelineFixture {
  id: string
  description: string
  notes: TimelineSourceNote[]
  expected: {
    eventCount: number
    firstDate: string | null
    firstTime: string | null
    firstLocation: string | null
    firstUncertainty: 'explicit' | 'ambiguous' | 'missing'
  }
}

const note = (id: string, text: string): TimelineSourceNote => ({
  id,
  title: `Fixture ${id}`,
  text,
  sourceType: 'jurnal',
  tags: [],
  linkedEvidenceIds: [],
})

export const timelineFixtures: TimelineFixture[] = [
  {
    id: 'clear-all-fields',
    description: 'Tanggal, waktu, dan lokasi ditulis eksplisit.',
    notes: [note('n1', 'Tanggal: 3 Juni 2026. Waktu: 09:15. Lokasi: perpustakaan kampus. Aku menulis catatan singkat.')],
    expected: { eventCount: 1, firstDate: '3 Juni 2026', firstTime: '09:15', firstLocation: 'perpustakaan kampus', firstUncertainty: 'explicit' },
  },
  {
    id: 'missing-date',
    description: 'Tanggal tidak dicatat dan tidak boleh ditebak.',
    notes: [note('n2', 'Aku berbicara dengan pendamping. Waktu dan lokasi tidak dicatat.')],
    expected: { eventCount: 1, firstDate: null, firstTime: null, firstLocation: null, firstUncertainty: 'missing' },
  },
  {
    id: 'approximate-time',
    description: 'Kata sekitar membuat status ambigu.',
    notes: [note('n3', 'Tanggal: 4 Juni 2026. Waktu: sekitar 13:20. Lokasi: halte kampus. Aku menunggu transportasi.')],
    expected: { eventCount: 1, firstDate: '4 Juni 2026', firstTime: '13:20', firstLocation: 'halte kampus', firstUncertainty: 'ambiguous' },
  },
  {
    id: 'missing-time',
    description: 'Waktu kosong ditandai ambigu, bukan diisi dari recordedAt.',
    notes: [note('n4', 'Tanggal: 5 Juni 2026. Lokasi: ruang layanan. Aku meminta informasi aksesibilitas.')],
    expected: { eventCount: 1, firstDate: '5 Juni 2026', firstTime: null, firstLocation: 'ruang layanan', firstUncertainty: 'ambiguous' },
  },
  {
    id: 'missing-location',
    description: 'Lokasi yang tidak ada tetap null.',
    notes: [note('n5', 'Tanggal: 6 Juni 2026. Waktu: 11.00. Aku menyimpan salinan dokumen sintetis.')],
    expected: { eventCount: 1, firstDate: '6 Juni 2026', firstTime: '11:00', firstLocation: null, firstUncertainty: 'explicit' },
  },
  {
    id: 'dot-time',
    description: 'Format waktu Indonesia dengan titik dinormalisasi.',
    notes: [note('n6', 'Tanggal: 7 Juni 2026. Waktu: 08.05. Lokasi: aplikasi AmanAkses. Aku memperbarui preferensi akses.')],
    expected: { eventCount: 1, firstDate: '7 Juni 2026', firstTime: '08:05', firstLocation: 'aplikasi AmanAkses', firstUncertainty: 'explicit' },
  },
  {
    id: 'two-notes',
    description: 'Dua catatan menghasilkan dua event dengan sumber masing-masing.',
    notes: [
      note('n7a', 'Tanggal: 8 Juni 2026. Waktu: 10:00. Lokasi: kampus. Aku membuat jurnal.'),
      note('n7b', 'Tanggal: 9 Juni 2026. Waktu: 12:00. Lokasi: rumah. Aku meninjau jurnal.'),
    ],
    expected: { eventCount: 2, firstDate: '8 Juni 2026', firstTime: '10:00', firstLocation: 'kampus', firstUncertainty: 'explicit' },
  },
  {
    id: 'alias-safe',
    description: 'Alias tetap berada dalam ringkasan tanpa perlu identifikasi tambahan.',
    notes: [note('n8', 'Tanggal: 9 Juni 2026. Waktu: 14:10. Lokasi: ruang publik. Aku bertemu orang dengan alias R.')],
    expected: { eventCount: 1, firstDate: '9 Juni 2026', firstTime: '14:10', firstLocation: 'ruang publik', firstUncertainty: 'explicit' },
  },
  {
    id: 'uncertain-memory',
    description: 'Pernyataan seingat ditandai ambigu.',
    notes: [note('n9', 'Tanggal: 10 Juni 2026. Waktu: 15:30. Lokasi: koridor. Seingatku aku meninggalkan lokasi setelah itu.')],
    expected: { eventCount: 1, firstDate: '10 Juni 2026', firstTime: '15:30', firstLocation: 'koridor', firstUncertainty: 'ambiguous' },
  },
  {
    id: 'irrelevant-safe-note',
    description: 'Catatan non-kasus tetap diproses netral dan tidak diberi kesimpulan.',
    notes: [note('n10', 'Tanggal: 11 Juni 2026. Waktu: 07:45. Lokasi: rumah. Aku mengecek jadwal kelas.')],
    expected: { eventCount: 1, firstDate: '11 Juni 2026', firstTime: '07:45', firstLocation: 'rumah', firstUncertainty: 'explicit' },
  },
]
