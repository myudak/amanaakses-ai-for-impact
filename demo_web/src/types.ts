export type AccessibilityNeed =
  | 'screen-reader'
  | 'high-contrast'
  | 'large-controls'
  | 'easy-read'
  | 'voice-note'
  | 'sign-language'
  | 'reduced-motion'

export type EvidenceType = 'foto' | 'audio' | 'chat' | 'dokumen' | 'catatan-medis'
export type ConsentScope = 'ringkasan' | 'kronologi' | 'bukti-terpilih' | 'kebutuhan-akses' | 'kontak'
export type HelpChannel = 'WhatsApp' | 'Telepon' | 'Tatap muka' | 'Online'

export interface AccessibilityProfile {
  textScale: 'normal' | 'besar' | 'sangat-besar'
  highContrast: boolean
  easyRead: boolean
  largeControls: boolean
  reducedMotion: boolean
  enabledNeeds: AccessibilityNeed[]
}

export interface UserProfile {
  alias: string
  pronoun: string
  safetyPhrase: string
  lastSavedAt: string
  accessibilityNeeds: AccessibilityNeed[]
}

export interface LearningModule {
  id: string
  title: string
  summary: string
  duration: string
  category: string
  level: 'Dasar' | 'Praktis'
  progress: number
  updatedAt: string
  format: Array<'teks' | 'audio' | 'video-isyarat' | 'easy-read'>
  status: 'belum' | 'dibaca' | 'disimpan'
  objectives: string[]
  sections: Array<{
    title: string
    body: string
    example?: string
  }>
  checklist: string[]
  supportPhrase: string
}

export interface JournalEntry {
  id: string
  date: string
  mood: string
  title: string
  summary: string
  tags: string[]
  hasVoiceNote: boolean
  linkedEvidenceIds: string[]
}

export interface EvidenceFile {
  id: string
  type: EvidenceType
  title: string
  capturedAt: string
  size: string
  hash: string
  tags: string[]
  note: string
}

export interface TimelineEvent {
  id: string
  date: string
  time: string
  title: string
  location: string
  summary: string
  evidenceIds: string[]
  included: boolean
}

export interface TimelineSourceNote {
  id: string
  title: string
  text: string
  recordedAt?: string
  sourceType: 'jurnal' | 'bukti' | 'pendamping' | 'aksesibilitas'
  tags: string[]
  linkedEvidenceIds: string[]
}

export type TimelineUncertainty = 'explicit' | 'ambiguous' | 'missing'

export interface TimelineCandidate {
  id: string
  sourceNoteIds: string[]
  date: string | null
  time: string | null
  location: string | null
  title: string
  neutralSummary: string
  uncertainty: TimelineUncertainty
  requiresReview: true
}

export interface TimelineAssistantResponse {
  events: TimelineCandidate[]
  warnings: string[]
  mode: 'live' | 'fallback'
}

export type ChatSafetyLevel = 'normal' | 'sensitive' | 'urgent'

export interface ChatSuggestedAction {
  label: string
  route: string
}

interface ChatToolBase {
  id: string
  label: string
  description: string
  requiresConfirmation: true
}

export type ChatToolCall =
  | (ChatToolBase & {
      name: 'draft_timeline'
      arguments: {
        sourcePreset: 'recent-notes' | 'all-demo-notes'
      }
    })
  | (ChatToolBase & {
      name: 'prepare_journal'
      arguments: {
        template: 'free-write' | 'facts-feelings-needs' | 'support-request'
      }
    })
  | (ChatToolBase & {
      name: 'update_accessibility'
      arguments: {
        easyRead: boolean
        textScale: 'besar' | 'sangat-besar'
        reducedMotion: boolean
      }
    })
  | (ChatToolBase & {
      name: 'open_support'
      arguments: {
        destination: 'pendamping' | 'pusat-bantuan' | 'safe-exit'
      }
    })

export interface ChatAssistantResponse {
  reply: string
  suggestedActions: ChatSuggestedAction[]
  toolCalls: ChatToolCall[]
  safetyLevel: ChatSafetyLevel
  disclaimer: string
  mode: 'live' | 'fallback'
}

export interface TrustedCompanion {
  id: string
  name: string
  role: string
  status: 'aktif' | 'tersedia' | 'belum-diizinkan'
  channel: HelpChannel
  contact: string
  scopes: ConsentScope[]
}

export interface ConsentGrant {
  id: string
  recipient: string
  scopes: ConsentScope[]
  expiresAt: string
  status: 'aktif' | 'dicabut' | 'draft'
}

export interface ServiceProvider {
  id: string
  name: string
  category: string
  city: string
  channels: HelpChannel[]
  accessibility: AccessibilityNeed[]
  availability: string
}

export interface ReportDraft {
  id: string
  title: string
  updatedAt: string
  sections: Array<{
    title: string
    status: 'siap' | 'perlu-cek'
    summary: string
  }>
}

export interface AuditLogEntry {
  id: string
  at: string
  action: string
  actor: string
}
