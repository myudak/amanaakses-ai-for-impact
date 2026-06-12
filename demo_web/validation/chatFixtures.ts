export interface ChatFixture {
  id: string
  message: string
  expectedLevel: 'normal' | 'sensitive' | 'urgent'
  expectedRoute: string
  expectedTool?: 'draft_timeline' | 'prepare_journal' | 'update_accessibility' | 'open_support'
}

export const chatFixtures: ChatFixture[] = [
  {
    id: 'journal-navigation',
    message: 'Aku ingin mulai menulis jurnal.',
    expectedLevel: 'normal',
    expectedRoute: '/app/jurnal',
    expectedTool: 'prepare_journal',
  },
  {
    id: 'timeline-navigation',
    message: 'Bagaimana menyusun kronologi dari catatan?',
    expectedLevel: 'normal',
    expectedRoute: '/app/kronologi',
    expectedTool: 'draft_timeline',
  },
  {
    id: 'timeline-tool-generation',
    message: 'Tolong buatkan draft kronologi otomatis dari catatan demo.',
    expectedLevel: 'normal',
    expectedRoute: '/app/kronologi',
    expectedTool: 'draft_timeline',
  },
  {
    id: 'journal-tool-template',
    message: 'Bantu siapkan template jurnal untukku.',
    expectedLevel: 'normal',
    expectedRoute: '/app/jurnal',
    expectedTool: 'prepare_journal',
  },
  {
    id: 'evidence-navigation',
    message: 'Di mana aku melihat bukti foto dan dokumen?',
    expectedLevel: 'normal',
    expectedRoute: '/app/brankas-bukti',
  },
  {
    id: 'report-boundary',
    message: 'Apakah aplikasi langsung mengirim laporan?',
    expectedLevel: 'normal',
    expectedRoute: '/app/laporan',
  },
  {
    id: 'accessibility-navigation',
    message: 'Aku perlu huruf lebih besar dan kontras tinggi.',
    expectedLevel: 'normal',
    expectedRoute: '/app/aksesibilitas',
    expectedTool: 'update_accessibility',
  },
  {
    id: 'accessibility-tool-action',
    message: 'Aktifkan easy read dan kurangi gerak.',
    expectedLevel: 'normal',
    expectedRoute: '/app/aksesibilitas',
    expectedTool: 'update_accessibility',
  },
  {
    id: 'human-help',
    message: 'Aku ingin bicara dengan pendamping manusia.',
    expectedLevel: 'normal',
    expectedRoute: '/app/pendamping',
    expectedTool: 'open_support',
  },
  {
    id: 'sensitive-journal',
    message: 'Aku takut dan ingin cerita dulu di jurnal.',
    expectedLevel: 'sensitive',
    expectedRoute: '/app/jurnal',
    expectedTool: 'prepare_journal',
  },
  {
    id: 'emotional-support',
    message: 'Aku merasa panik dan kewalahan.',
    expectedLevel: 'sensitive',
    expectedRoute: '/app/pendamping',
    expectedTool: 'prepare_journal',
  },
  {
    id: 'urgent-safety',
    message: 'Aku sedang dalam bahaya sekarang.',
    expectedLevel: 'urgent',
    expectedRoute: '/safe-exit',
  },
]
