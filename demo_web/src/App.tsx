import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { BrowserRouter, Link, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  Accessibility,
  AlertTriangle,
  ArrowRight,
  AudioLines,
  Bell,
  Bot,
  Bookmark,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  HandHeart,
  Heart,
  Home,
  Info,
  Languages,
  LifeBuoy,
  ListChecks,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  Paperclip,
  PencilLine,
  PlayCircle,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRoundCheck,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react'
import amanaaksesHero from './assets/amanaakses-hero.webp'
import profileSitiSynthetic from './assets/profile-siti-synthetic.webp'
import {
  accessibilityProfile as initialAccessibility,
  auditLog,
  consentGrants,
  evidenceFiles,
  journalEntries,
  learningModules,
  reportDraft,
  serviceProviders,
  timelineEvents,
  timelineSourceNotes,
  trustedCompanions,
  userProfile,
} from './data/mockData'
import type {
  AccessibilityNeed,
  AccessibilityProfile,
  ChatAssistantResponse,
  ChatToolCall,
  EvidenceFile,
  EvidenceType,
  TimelineCandidate,
} from './types'
import { Badge, Button, Card, Dialog, Input, Progress, Switch, Textarea } from './components/ui'
import { cn } from './lib/utils'
import { requestChatReply } from './lib/chatAssistant'
import { requestTimeline } from './lib/timelineAssistant'

type Toast = {
  id: number
  title: string
  description: string
}

type ReviewedTimelineCandidate = TimelineCandidate & {
  reviewStatus: 'pending' | 'accepted' | 'rejected'
}

type TimelineAssistantHandoff = {
  selectedNoteIds: string[]
  events: TimelineCandidate[]
  warnings: string[]
  mode: 'live' | 'fallback'
  createdAt: string
}

type ChatUiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  response?: ChatAssistantResponse
}

type DemoContext = {
  accessibility: AccessibilityProfile
  discreetMode: boolean
  setDiscreetMode: (value: boolean) => void
  toggleAccessibility: (key: keyof Pick<AccessibilityProfile, 'highContrast' | 'easyRead' | 'largeControls' | 'reducedMotion'>) => void
  setTextScale: (value: AccessibilityProfile['textScale']) => void
  applyAccessibilityPatch: (
    patch: Partial<Pick<AccessibilityProfile, 'easyRead' | 'reducedMotion' | 'textScale'>>,
  ) => void
  showToast: (title: string, description: string) => void
}

const DemoContext = createContext<DemoContext | null>(null)

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}

const TIMELINE_HANDOFF_KEY = 'amanaakses.timeline-assistant-handoff'
const JOURNAL_STARTER_KEY = 'amanaakses.journal-starter'

function readTimelineAssistantHandoff(): TimelineAssistantHandoff | null {
  try {
    const raw = window.sessionStorage.getItem(TIMELINE_HANDOFF_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<TimelineAssistantHandoff>
    if (
      !Array.isArray(value.selectedNoteIds) ||
      !Array.isArray(value.events) ||
      !Array.isArray(value.warnings) ||
      (value.mode !== 'live' && value.mode !== 'fallback')
    ) {
      return null
    }
    return {
      selectedNoteIds: value.selectedNoteIds.filter((id): id is string => typeof id === 'string'),
      events: value.events as TimelineCandidate[],
      warnings: value.warnings.filter((warning): warning is string => typeof warning === 'string'),
      mode: value.mode,
      createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    }
  } catch {
    return null
  }
}

const navItems: Array<{ label: string; to: string; icon: LucideIcon }> = [
  { label: 'Dashboard', to: '/app/dashboard', icon: Home },
  { label: 'Pahami Kekerasan', to: '/app/pahami-kekerasan', icon: BookOpen },
  { label: 'Jurnal Aman', to: '/app/jurnal', icon: PencilLine },
  { label: 'Kronologi Kejadian', to: '/app/kronologi', icon: CalendarClock },
  { label: 'Asisten Aman AI', to: '/app/asisten', icon: Bot },
  { label: 'Brankas Bukti', to: '/app/brankas-bukti', icon: Lock },
  { label: 'Pendamping', to: '/app/pendamping', icon: HandHeart },
  { label: 'Laporan Awal', to: '/app/laporan', icon: FileCheck2 },
  { label: 'Pusat Bantuan', to: '/app/pusat-bantuan', icon: LifeBuoy },
  { label: 'Aksesibilitas', to: '/app/aksesibilitas', icon: Accessibility },
  { label: 'Pengaturan', to: '/app/settings', icon: Settings },
]

const evidenceTypeLabels: Record<EvidenceType, string> = {
  foto: 'Foto',
  audio: 'Audio',
  chat: 'Chat',
  dokumen: 'Dokumen',
  'catatan-medis': 'Catatan akses',
}

const accessibilityLabels: Record<AccessibilityNeed, string> = {
  'screen-reader': 'Screen reader',
  'high-contrast': 'Kontras tinggi',
  'large-controls': 'Tombol besar',
  'easy-read': 'Easy read',
  'voice-note': 'Catatan suara',
  'sign-language': 'Bahasa isyarat',
  'reduced-motion': 'Kurangi gerak',
}

function useDemo() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemo must be used inside DemoProvider')
  }
  return context
}

function DemoProvider({ children }: { children: ReactNode }) {
  const [accessibility, setAccessibility] = useState(initialAccessibility)
  const [discreetMode, setDiscreetMode] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (title: string, description: string) => {
    const nextToast = { id: Date.now(), title, description }
    setToast(nextToast)
    window.setTimeout(() => {
      setToast((current) => (current?.id === nextToast.id ? null : current))
    }, 3600)
  }

  const value = useMemo<DemoContext>(
    () => ({
      accessibility,
      discreetMode,
      setDiscreetMode,
      toggleAccessibility: (key) => {
        setAccessibility((current) => ({ ...current, [key]: !current[key] }))
      },
      setTextScale: (textScale) => {
        setAccessibility((current) => ({ ...current, textScale }))
      },
      applyAccessibilityPatch: (patch) => {
        setAccessibility((current) => ({ ...current, ...patch }))
      },
      showToast,
    }),
    [accessibility, discreetMode],
  )

  return (
    <DemoContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-5 right-5 z-[80] max-w-sm rounded-3xl border border-teal-200 bg-white p-4 shadow-2xl shadow-slate-950/15"
            role="status"
          >
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-800">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="font-bold text-slate-950">{toast.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{toast.description}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DemoContext.Provider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/safe-exit" element={<SafeExitPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pahami-kekerasan" element={<LearningPage />} />
            <Route path="jurnal" element={<JournalPage />} />
            <Route path="kronologi" element={<TimelinePage />} />
            <Route path="asisten" element={<ChatAssistantPage />} />
            <Route path="brankas-bukti" element={<EvidenceVaultPage />} />
            <Route path="pendamping" element={<CompanionsPage />} />
            <Route path="laporan" element={<ReportPage />} />
            <Route path="pusat-bantuan" element={<HelpCenterPage />} />
            <Route path="aksesibilitas" element={<AccessibilityPage />} />
            <Route path="mobile-preview" element={<MobilePreviewPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </DemoProvider>
    </BrowserRouter>
  )
}

const landingFeatures: Array<{ title: string; copy: string; icon: LucideIcon; tint: keyof typeof featureTints }> = [
  { title: 'Pahami Kekerasan', copy: 'Materi easy-read tentang hak, batas aman, dan pilihan bantuan.', icon: BookOpen, tint: 'teal' },
  { title: 'Jurnal Aman', copy: 'Catatan bertahap dengan autosave — teks maupun suara.', icon: PencilLine, tint: 'violet' },
  { title: 'Kronologi Otomatis', copy: 'AI menyusun draft urutan kejadian; kamu yang meninjau dan memutuskan.', icon: CalendarClock, tint: 'emerald' },
  { title: 'Brankas Bukti', copy: 'Foto, audio, dan dokumen tersimpan dengan metadata terenkripsi.', icon: Lock, tint: 'sky' },
  { title: 'Pendamping Tepercaya', copy: 'Pilih siapa yang boleh melihat — izin selalu bisa dicabut.', icon: HandHeart, tint: 'amber' },
  { title: 'Laporan Awal', copy: 'Ringkasan terstruktur yang siap ditinjau manusia, bukan keputusan AI.', icon: FileCheck2, tint: 'rose' },
]

const landingSteps = [
  { title: 'Pahami', copy: 'Pelajari hak dan pilihanmu dengan bahasa sederhana.', icon: BookOpen },
  { title: 'Catat', copy: 'Tulis atau rekam pengalaman sesuai ritmemu.', icon: PencilLine },
  { title: 'Simpan Bukti', copy: 'Amankan bukti penting di brankas terenkripsi.', icon: Lock },
  { title: 'Tinjau', copy: 'Periksa kronologi dan laporan awal buatanmu.', icon: FileCheck2 },
  { title: 'Bagikan', copy: 'Bagikan hanya kepada pihak yang kamu izinkan.', icon: HandHeart },
]

function LandingPage() {
  const { accessibility } = useDemo()

  return (
    <main className={cn('relative min-h-screen overflow-hidden bg-[#f3faf8] text-slate-950', accessibility.highContrast && 'bg-white')}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] soft-grid opacity-45" />
      <div className="pointer-events-none absolute right-[-14rem] top-[-14rem] h-[38rem] w-[38rem] rounded-full bg-teal-200/50 blur-3xl" />
      <div className="pointer-events-none absolute left-[-10rem] top-[24rem] h-[28rem] w-[28rem] rounded-full bg-violet-200/40 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-slate-900/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-teal-950">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-lg shadow-teal-900/25 ring-1 ring-inset ring-white/25">
              <ShieldCheck className="size-5" />
            </span>
            AmanAkses
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex" aria-label="Navigasi landing">
            <a className="transition hover:text-teal-800" href="#fitur">Fitur</a>
            <a className="transition hover:text-teal-800" href="#aksesibilitas">Aksesibilitas</a>
            <a className="transition hover:text-teal-800" href="#alur">Alur Aman</a>
          </nav>
          <Link
            to="/app/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-b from-teal-600 to-teal-700 px-5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 ring-1 ring-inset ring-white/20 transition hover:from-teal-700 hover:to-teal-800"
          >
            Buka Demo
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20">
        <motion.div {...pageMotion}>
          <Badge tone="teal" className="mb-5">
            <Sparkles className="size-3.5" /> Data simulasi · Platform aksesibel
          </Badge>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] md:text-6xl">
            Pahami. Catat.{' '}
            <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-violet-600 bg-clip-text text-transparent">Lindungi.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            AmanAkses adalah ruang digital aksesibel bagi penyandang disabilitas untuk menyimpan jurnal, mengatur bukti, menyusun
            kronologi, dan berbagi laporan awal — hanya dengan izin yang jelas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/app/dashboard"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-teal-600 to-teal-700 px-7 text-base font-bold text-white shadow-lg shadow-teal-900/25 ring-1 ring-inset ring-white/20 transition hover:-translate-y-0.5 hover:from-teal-700 hover:to-teal-800 hover:shadow-xl hover:shadow-teal-900/30"
            >
              Mulai ruang aman <ChevronRight className="size-5" />
            </Link>
            <Link
              to="/app/mobile-preview"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-teal-200 bg-white/85 px-7 text-base font-bold text-teal-900 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50"
            >
              Lihat mobile preview <Eye className="size-5" />
            </Link>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [UserRoundCheck, 'Aksesibel', 'Dirancang inklusif'],
              [Lock, 'Aman', 'Enkripsi & kendali data'],
              [Heart, 'Berpusat padamu', 'Tanpa paksaan'],
              [Shield, 'Rahasia', 'Privasi terjaga'],
            ].map(([Icon, title, copy]) => (
              <div key={String(title)} className="rounded-2xl border border-slate-900/6 bg-white/80 p-3 backdrop-blur">
                <Icon className="size-5 text-teal-700" />
                <dt className="mt-2 text-sm font-extrabold text-slate-900">{title as string}</dt>
                <dd className="mt-0.5 text-xs leading-5 text-slate-500">{copy as string}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="relative mx-auto w-full max-w-[540px]"
        >
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-teal-200/60 via-white/0 to-violet-200/60 blur-xl" />
          <div className="relative rounded-[2rem] border border-white/60 bg-white/80 p-3 shadow-2xl shadow-teal-950/15 backdrop-blur">
            <img
              src={amanaaksesHero}
              alt="Ilustrasi tiga pengguna dengan disabilitas menggunakan AmanAkses bersama simbol keamanan digital"
              className="h-[26rem] w-full rounded-[1.6rem] object-cover object-center"
            />
            <div className="absolute -left-5 top-10 hidden rounded-2xl border border-slate-900/6 bg-white/95 px-4 py-3 shadow-xl shadow-slate-950/10 backdrop-blur md:block">
              <p className="flex items-center gap-2 text-sm font-extrabold text-teal-900">
                <span className="grid size-7 place-items-center rounded-lg bg-teal-100 text-teal-800"><Lock className="size-4" /></span>
                Ruang pribadi terkunci
              </p>
            </div>
            <div className="absolute -right-4 bottom-24 hidden rounded-2xl border border-slate-900/6 bg-white/95 px-4 py-3 shadow-xl shadow-slate-950/10 backdrop-blur md:block">
              <p className="flex items-center gap-2 text-sm font-extrabold text-violet-900">
                <span className="grid size-7 place-items-center rounded-lg bg-violet-100 text-violet-800"><AudioLines className="size-4" /></span>
                Screen reader siap
              </p>
            </div>
            <div className="absolute bottom-8 left-6 right-6 rounded-2xl border border-white/40 bg-teal-950/70 px-4 py-3 text-white backdrop-blur">
              <p className="text-sm font-extrabold">Anda tidak sendiri. Kendali ada di tangan Anda.</p>
              <p className="mt-0.5 text-xs text-teal-100/90">Semua tindakan penting meminta konfirmasi sebelum dibagikan.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="teal" className="mb-4">Fitur Utama</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Satu ruang aman, enam langkah kecil</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Setiap fitur dirancang agar kamu bisa mulai dari mana saja, berhenti kapan saja, dan tetap memegang kendali penuh.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {landingFeatures.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (index % 3) * 0.05 }}
            >
              <Card className="group h-full transition hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-950/10">
                <span className={cn('grid size-12 place-items-center rounded-2xl', featureTints[item.tint].chip)}>
                  <item.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AKSESIBILITAS */}
      <section id="aksesibilitas" className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 p-8 shadow-xl shadow-teal-950/25 md:p-12">
          <div className="pointer-events-none absolute inset-0 hero-orbs" />
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border-[2rem] border-white/6" />
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-teal-50 ring-1 ring-inset ring-white/20">
                <Accessibility className="size-3.5" /> Aksesibilitas
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">Dirancang untuk semua, sejak awal</h2>
              <p className="mt-4 max-w-md leading-7 text-teal-100/90">
                Aksesibilitas bukan fitur tambahan. Screen reader, catatan suara, bahasa isyarat, dan easy-read terpasang di seluruh
                alur — bukan hanya di satu halaman.
              </p>
              <Link
                to="/app/aksesibilitas"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-teal-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-50"
              >
                Coba pengaturan akses <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [Volume2, 'Ramah Pembaca Layar', 'Navigasi semantik dan label yang konsisten.'],
                [Mic, 'Catatan Suara', 'Merekam tanpa harus mengetik.'],
                [BookOpen, 'Baca Mudah', 'Kalimat pendek dan bahasa sederhana.'],
                [Languages, 'Video Bahasa Isyarat', 'Materi edukasi dengan isyarat.'],
                [Eye, 'Kontras & Tombol Besar', 'Mudah dilihat, mudah dijangkau.'],
                [LogOut, 'Keluar Cepat', 'Satu tombol menuju halaman netral.'],
              ].map(([Icon, title, copy]) => (
                <div key={String(title)} className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur transition hover:bg-white/14">
                  <span className="grid size-9 place-items-center rounded-xl bg-white/12 text-teal-50">
                    <Icon className="size-4.5" />
                  </span>
                  <p className="mt-3 text-sm font-extrabold text-white">{title as string}</p>
                  <p className="mt-1 text-xs leading-5 text-teal-100/85">{copy as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ALUR */}
      <section id="alur" className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="purple" className="mb-4">Alur Penggunaan</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Langkah kecil hari ini, perlindungan besar esok hari</h2>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {landingSteps.map((step, index) => (
            <li key={step.title} className="relative">
              <Card className="h-full">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-sm font-extrabold text-white shadow-md shadow-teal-900/25">
                    {index + 1}
                  </span>
                  <step.icon className="size-5 text-teal-700" />
                </div>
                <h3 className="mt-3 font-extrabold">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{step.copy}</p>
              </Card>
              {index < landingSteps.length - 1 ? (
                <ChevronRight className="absolute -right-3.5 top-1/2 hidden size-5 -translate-y-1/2 text-teal-300 lg:block" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-teal-900/8 bg-gradient-to-r from-teal-50 via-white to-violet-50 p-8 text-center shadow-lg shadow-teal-950/8 md:p-12">
          <div className="pointer-events-none absolute inset-0 soft-grid opacity-40" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
              Pahami. Catat.{' '}
              <span className="bg-gradient-to-r from-teal-700 to-violet-600 bg-clip-text text-transparent">Lindungi.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              AmanAkses adalah ruang digital yang mendukung langkah Anda, dengan empati dan rasa hormat.
            </p>
            <Link
              to="/app/dashboard"
              className="mt-7 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-teal-600 to-teal-700 px-8 text-base font-bold text-white shadow-lg shadow-teal-900/25 ring-1 ring-inset ring-white/20 transition hover:-translate-y-0.5 hover:from-teal-700 hover:to-teal-800"
            >
              Buka demo sekarang <ChevronRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-900/6 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-slate-500 lg:px-8">
          <p className="flex items-center gap-2 font-semibold text-teal-900">
            <ShieldCheck className="size-4 text-teal-700" /> AmanAkses
          </p>
          <p>Prototype Tugas Besar AI For Real Impact 2026 · Seluruh data bersifat sintetis.</p>
        </div>
      </footer>
    </main>
  )
}

function SidebarLink({ item, onNavigate }: { item: (typeof navItems)[number]; onNavigate: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-teal-900/5 hover:text-teal-950',
          isActive &&
            ' bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-lg shadow-teal-900/25 ring-1 ring-inset ring-white/15 hover:bg-none hover:bg-teal-700 hover:text-white !text-white ',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'grid size-8 place-items-center rounded-xl bg-teal-900/5 text-teal-800 transition group-hover:bg-teal-900/10',
              isActive && 'bg-white/15 text-white group-hover:bg-white/15',
            )}
          >
            <item.icon className="size-4.5" />
          </span>
          {item.label}
        </>
      )}
    </NavLink>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const { accessibility, discreetMode, setDiscreetMode, showToast } = useDemo()
  const [mobileOpen, setMobileOpen] = useState(false)

  const textScaleClass = accessibility.textScale === 'sangat-besar' ? 'text-[18px]' : accessibility.textScale === 'besar' ? 'text-[16px]' : 'text-[15px]'

  return (
    <div
      className={cn(
        'min-h-screen bg-[#f6fbfa] text-slate-950',
        textScaleClass,
        accessibility.highContrast && 'bg-white high-contrast',
        accessibility.easyRead && 'easy-read',
      )}
    >
      <div className="pointer-events-none fixed inset-0 soft-grid opacity-40" />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-teal-900/8 bg-gradient-to-b from-white via-white to-teal-50/70 p-4 backdrop-blur-xl transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-1">
            <Link to="/app/dashboard" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-lg shadow-teal-900/25 ring-1 ring-inset ring-white/25">
                <ShieldCheck className="size-6" />
              </span>
              <span className="leading-tight">
                <span className="block text-lg font-extrabold tracking-tight text-teal-950">AmanAkses</span>
                <span className="block text-[11px] font-semibold text-teal-700/80">Aman. Tepercaya. Untuk semua.</span>
              </span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
              <X className="size-5" />
            </Button>
          </div>

          <nav className="mt-7" aria-label="Navigasi utama">
            <p className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-900/40">Menu utama</p>
            <div className="space-y-1">
              {navItems.slice(0, 8).map((item) => (
                <SidebarLink key={item.to} item={item} onNavigate={() => setMobileOpen(false)} />
              ))}
            </div>
            <p className="px-3 pb-2 pt-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-900/40">Dukungan</p>
            <div className="space-y-1">
              {navItems.slice(8).map((item) => (
                <SidebarLink key={item.to} item={item} onNavigate={() => setMobileOpen(false)} />
              ))}
            </div>
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            <div className="rounded-2xl border border-teal-100 bg-teal-50/80 p-4">
              <div className="flex gap-3">
                <Lock className="mt-1 size-5 shrink-0 text-teal-700" />
                <div>
                  <p className="text-sm font-bold text-teal-950">Privasi terjaga</p>
                  <p className="mt-1 text-xs leading-5 text-teal-800">Data simulasi hanya untuk demo lokal.</p>
                </div>
              </div>
            </div>
            <Button variant="danger" className="w-full" onClick={() => navigate('/safe-exit')}>
              <LogOut className="size-4" /> Keluar Cepat
            </Button>
          </div>
        </div>
      </aside>

      {mobileOpen ? <button aria-label="Tutup menu" className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-900/6 bg-white/78 backdrop-blur-xl">
          <div className="flex min-h-[4.5rem] items-center gap-3 px-4 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
              <Menu className="size-5" />
            </Button>
            <div className="hidden min-w-0 max-w-xl flex-1 items-center gap-3 rounded-full border border-slate-900/8 bg-slate-900/4 px-4 py-2.5 transition focus-within:border-teal-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100 md:flex">
              <Search className="size-4 shrink-0 text-slate-400" />
              <input
                aria-label="Cari catatan, bukti, atau pendamping"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Cari catatan, bukti, pendamping..."
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge tone={discreetMode ? 'slate' : 'green'} className="hidden sm:inline-flex">
                <Shield className="size-3.5" />
                {discreetMode ? 'Mode tersembunyi' : userProfile.safetyPhrase}
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setDiscreetMode(!discreetMode)
                  showToast('Mode tampilan diperbarui', !discreetMode ? 'Label sensitif disamarkan dalam demo.' : 'Tampilan normal kembali aktif.')
                }}
              >
                <Moon className="size-4" /> Discreet
              </Button>
              <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifikasi">
                <Bell className="size-5" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </Button>
              <div className="hidden items-center gap-3 rounded-full border border-slate-900/8 bg-white py-1.5 pl-1.5 pr-4 shadow-sm shadow-slate-950/4 sm:flex">
                <img
                  src={profileSitiSynthetic}
                  alt="Foto profil sintetis Siti"
                  className="size-9 rounded-full object-cover ring-2 ring-teal-100"
                />
                <div className="text-sm leading-tight">
                  <p className="font-bold">Hai, {userProfile.alias}</p>
                  <p className="text-xs text-slate-500">Tersimpan {userProfile.lastSavedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-8">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

const featureTints = {
  teal: { chip: 'bg-teal-100 text-teal-800', button: 'border-teal-200 text-teal-900 hover:bg-teal-50' },
  violet: { chip: 'bg-violet-100 text-violet-800', button: 'border-violet-200 text-violet-900 hover:bg-violet-50' },
  emerald: { chip: 'bg-emerald-100 text-emerald-800', button: 'border-emerald-200 text-emerald-900 hover:bg-emerald-50' },
  sky: { chip: 'bg-sky-100 text-sky-800', button: 'border-sky-200 text-sky-900 hover:bg-sky-50' },
  amber: { chip: 'bg-amber-100 text-amber-800', button: 'border-amber-200 text-amber-900 hover:bg-amber-50' },
  rose: { chip: 'bg-rose-100 text-rose-700', button: 'border-rose-200 text-rose-800 hover:bg-rose-50' },
} as const

function DashboardPage() {
  const { showToast } = useDemo()
  const quickActions: Array<{ title: string; copy: string; icon: LucideIcon; to: string; cta: string; tint: keyof typeof featureTints }> = [
    { title: 'Pahami Kekerasan', copy: 'Pelajari hak dan bentuk kekerasan dengan bahasa sederhana.', icon: BookOpen, to: '/app/pahami-kekerasan', cta: 'Pelajari', tint: 'teal' },
    { title: 'Jurnal Aman', copy: 'Tulis catatan bertahap dengan autosave dan privasi terjaga.', icon: PencilLine, to: '/app/jurnal', cta: 'Tulis Jurnal', tint: 'violet' },
    { title: 'Kronologi Otomatis', copy: 'Susun urutan kejadian dari catatan dan bukti dengan bantuan AI.', icon: CalendarClock, to: '/app/kronologi', cta: 'Buat Kronologi', tint: 'emerald' },
    { title: 'Asisten Aman AI', copy: 'Tanyakan cara memakai fitur dan temukan langkah berikutnya tanpa membagikan detail sensitif.', icon: Bot, to: '/app/asisten', cta: 'Buka Asisten', tint: 'teal' },
    { title: 'Brankas Bukti', copy: 'Kelola foto, audio, dan dokumen sintetis beserta metadata demo.', icon: Lock, to: '/app/brankas-bukti', cta: 'Simpan Bukti', tint: 'sky' },
    { title: 'Pendamping Tepercaya', copy: 'Pilih siapa yang boleh melihat informasimu, dengan izin penuh.', icon: HandHeart, to: '/app/pendamping', cta: 'Atur Akses', tint: 'amber' },
    { title: 'Laporan Awal', copy: 'Siapkan ringkasan laporan yang siap ditinjau manusia.', icon: FileCheck2, to: '/app/laporan', cta: 'Mulai Laporan', tint: 'violet' },
  ]

  const accessibilityFeatures: Array<{ icon: LucideIcon; label: string; copy: string; tint: keyof typeof featureTints }> = [
    { icon: Volume2, label: 'Screen Reader', copy: 'Kompatibel dengan pembaca layar untuk navigasi lancar.', tint: 'teal' },
    { icon: Mic, label: 'Catatan Suara', copy: 'Rekam pengalaman dengan suara, tanpa harus mengetik.', tint: 'violet' },
    { icon: BookOpen, label: 'Baca Mudah', copy: 'Bahasa sederhana dan kalimat singkat (easy read).', tint: 'emerald' },
    { icon: Languages, label: 'Bahasa Isyarat', copy: 'Video bahasa isyarat untuk materi edukasi.', tint: 'sky' },
    { icon: Eye, label: 'Kontras Tinggi', copy: 'Tampilan kontras dan tombol besar yang mudah dijangkau.', tint: 'amber' },
    { icon: LogOut, label: 'Keluar Cepat', copy: 'Alihkan layar ke halaman netral dalam satu tombol.', tint: 'rose' },
  ]

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <Card className="overflow-hidden border-none p-0 shadow-xl shadow-teal-950/20">
            <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600">
              <div className="pointer-events-none absolute inset-0 hero-orbs" />
              <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border-[2.5rem] border-white/6" />
              <div className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full border-[2rem] border-white/5" />
              <div className="relative grid gap-5 p-6 md:grid-cols-[1fr_320px] md:p-8">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-teal-50 ring-1 ring-inset ring-white/20">
                    <Sparkles className="size-3.5" /> Dashboard AmanAkses
                  </p>
                  <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                    Hai, kamu tidak sendirian <span aria-hidden="true">💜</span>
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-teal-100/90">
                    AmanAkses hadir untuk mendukungmu memahami, mencatat, dan mengambil langkah sesuai kebutuhanmu — dengan aman, sesuai ritmemu sendiri.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button
                      className="border-none bg-white from-white to-white text-teal-900 ring-0 hover:bg-teal-50 hover:from-teal-50 hover:to-white"
                      onClick={() => showToast('Catatan cepat dibuat', 'Demo menyiapkan draft jurnal baru tanpa mengirim data ke mana pun.')}
                    >
                      <Plus className="size-4" /> Catatan Baru
                    </Button>
                    <Badge className="border-white/25 bg-white/10 text-teal-50">
                      <Lock className="size-3.5" /> Ruang pribadi terkunci
                    </Badge>
                  </div>
                </div>
                <div className="relative self-center">
                  <div className="absolute -inset-2 rounded-[1.6rem] bg-white/10 blur-sm" />
                  <img
                    src={amanaaksesHero}
                    alt="Ilustrasi AmanAkses dengan pengguna disabilitas dan simbol keamanan digital"
                    className="relative h-48 w-full rounded-[1.35rem] object-cover object-center shadow-lg shadow-teal-950/40 ring-1 ring-white/30"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Card className="group flex h-full flex-col transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/8">
                  <span className={cn('grid size-12 place-items-center rounded-2xl transition', featureTints[item.tint].chip)}>
                    <item.icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.copy}</p>
                  <Link
                    to={item.to}
                    className={cn(
                      'mt-4 inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-xl border bg-white px-3.5 text-sm font-bold transition',
                      featureTints[item.tint].button,
                    )}
                  >
                    {item.cta} <ChevronRight className="size-4" />
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black">Fitur Aksesibilitas</h3>
                <p className="mt-1 text-sm text-slate-600">Disesuaikan untuk pengalaman yang nyaman dan mudah diakses semua orang.</p>
              </div>
              <Link to="/app/aksesibilitas" className="text-sm font-bold text-teal-800 hover:text-teal-900">
                Atur preferensi
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {accessibilityFeatures.map((feature) => (
                <div key={feature.label} className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition hover:border-teal-200 hover:bg-teal-50/40">
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', featureTints[feature.tint].chip)}>
                    <feature.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{feature.label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">{feature.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="bg-violet-50/70">
            <div className="flex items-start gap-3">
              <Heart className="mt-1 size-5 text-violet-700" />
              <div>
                <h3 className="font-black text-violet-950">Untukmu hari ini</h3>
                <p className="mt-2 text-sm leading-6 text-violet-900">
                  Setiap langkah kecil yang kamu pilih tetap berarti. Kamu boleh jeda kapan saja.
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50/70">
            <h3 className="flex items-center gap-2 font-black text-rose-800">
              <LifeBuoy className="size-5" /> Butuh bantuan segera?
            </h3>
            <p className="mt-2 text-sm leading-6 text-rose-700">
              Demo ini tidak menghubungi layanan sungguhan. Jika dalam bahaya, hubungi orang tepercaya atau layanan darurat setempat.
            </p>
            <Button variant="danger" className="mt-4 w-full" onClick={() => showToast('Pusat bantuan simulasi', 'Daftar layanan dummy dibuka di halaman Pusat Bantuan.')}>
              Lihat opsi bantuan
            </Button>
          </Card>
          <Card>
            <h3 className="font-black">Progress ruang aman</h3>
            <div className="mt-4 space-y-4">
              {[
                ['Jurnal tersimpan', 72],
                ['Bukti diberi label', 64],
                ['Laporan awal', 58],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="mb-2 flex justify-between text-sm font-semibold">
                    <span>{label as string}</span>
                    <span>{value as number}%</span>
                  </div>
                  <Progress value={value as number} />
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm text-teal-900">
        <ShieldCheck className="size-5 shrink-0 text-teal-700" />
        <p>
          Semua data dalam demo ini bersifat sintetis. Kamu yang memegang kendali penuh: tidak ada data yang dikirim atau dibagikan tanpa persetujuanmu.
        </p>
      </div>
    </motion.div>
  )
}

function LearningPage() {
  const [active, setActive] = useState(learningModules[0].id)
  const [readingMode, setReadingMode] = useState<'ringkas' | 'lengkap'>('ringkas')
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [completedIds, setCompletedIds] = useState(
    () => new Set(learningModules.filter((item) => item.status === 'dibaca').map((item) => item.id)),
  )
  const [savedIds, setSavedIds] = useState(
    () => new Set(learningModules.filter((item) => item.status === 'disimpan').map((item) => item.id)),
  )
  const module = learningModules.find((item) => item.id === active) ?? learningModules[0]
  const { showToast } = useDemo()
  const completedCount = completedIds.size
  const visibleSections = readingMode === 'ringkas' ? module.sections.slice(0, 2) : module.sections
  const formatLabels = {
    teks: 'Teks',
    audio: 'Audio',
    'video-isyarat': 'Video isyarat',
    'easy-read': 'Easy Read',
  }

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Pusat belajar aksesibel"
        title="Pahami Situasi dan Pilihanmu"
        description="Materi non-grafis untuk memahami persetujuan, tekanan, dokumentasi aman, dukungan, dan kebutuhan akses. Materi ini bersifat edukasi umum, bukan penilaian hukum."
        action={
          <Link
            to="/app/asisten"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-4 text-sm font-bold text-teal-900 shadow-sm transition hover:bg-teal-50"
          >
            <Bot className="size-4" /> Tanya Asisten
          </Link>
        }
      />

      <Card className="overflow-hidden border-none bg-gradient-to-r from-teal-900 via-teal-800 to-violet-900 p-0 text-white">
        <div className="grid gap-5 p-6 md:grid-cols-[1fr_280px] md:items-center">
          <div>
            <Badge className="border-white/20 bg-white/10 text-white">Jalur belajar pribadi</Badge>
            <h2 className="mt-4 text-2xl font-black">Pelajari satu topik, lalu pilih langkah yang terasa aman.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-teal-50/85">
              Progres hanya untuk simulasi antarmuka. Kamu dapat berhenti, mengulang, atau menyimpan materi tanpa membuka catatan pribadi.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-inset ring-white/15">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-100">Progres belajar</p>
                <p className="mt-1 text-3xl font-black">{completedCount}/{learningModules.length}</p>
              </div>
              <CheckCircle2 className="size-9 text-teal-200" />
            </div>
            <Progress value={(completedCount / learningModules.length) * 100} className="mt-4 bg-white/15" />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[350px_1fr]">
        <aside className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-teal-700">Daftar materi</p>
                <h2 className="mt-1 text-xl font-black">5 modul singkat</h2>
              </div>
              <BookOpen className="size-6 text-teal-700" />
            </div>
            <div className="mt-5 space-y-3">
              {learningModules.map((item, index) => {
                const completed = completedIds.has(item.id)
                const saved = savedIds.has(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActive(item.id)
                      setAudioPlaying(false)
                    }}
                    className={cn(
                      'w-full rounded-3xl border p-4 text-left transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
                      active === item.id
                        ? 'border-teal-300 bg-teal-50 shadow-sm ring-2 ring-teal-100'
                        : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50',
                    )}
                    aria-current={active === item.id ? 'step' : undefined}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-full text-xs font-black',
                          completed ? 'bg-emerald-100 text-emerald-800' : active === item.id ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {completed ? <Check className="size-4" /> : index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black leading-5">{item.title}</p>
                          {saved && !completed ? <Bookmark className="size-3.5 fill-violet-200 text-violet-700" /> : null}
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-500">{item.category} · {item.duration}</p>
                        <Progress value={completed ? 100 : item.progress} className="mt-3" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
          <Card className="border-amber-100 bg-amber-50/70">
            <div className="flex gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-amber-700" />
              <div>
                <h3 className="font-black text-amber-950">Batas materi</h3>
                <p className="mt-1 text-sm leading-6 text-amber-900">
                  Informasi ini membantu mengenali pilihan dan menyiapkan pertanyaan. Penilaian kasus tetap memerlukan tenaga manusia yang kompeten.
                </p>
              </div>
            </div>
          </Card>
        </aside>

        <article className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-violet-50 p-6 md:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full bg-violet-200/30 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="teal">{module.category}</Badge>
                  <Badge tone="purple">{module.level}</Badge>
                  <Badge tone="slate"><Clock3 className="size-3.5" /> {module.duration}</Badge>
                </div>
                <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight md:text-4xl">{module.title}</h2>
                <p className="mt-3 max-w-3xl leading-8 text-slate-650">{module.summary}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {module.format.map((format) => (
                    <Badge key={format} tone="slate">{formatLabels[format]}</Badge>
                  ))}
                  <span className="text-xs font-semibold text-slate-500">{module.updatedAt}</span>
                </div>
              </div>
            </div>

            <div className="border-y border-slate-100 bg-white px-6 py-4 md:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2" aria-label="Mode membaca">
                  <Button variant={readingMode === 'ringkas' ? 'primary' : 'secondary'} size="sm" onClick={() => setReadingMode('ringkas')}>
                    Ringkas
                  </Button>
                  <Button variant={readingMode === 'lengkap' ? 'primary' : 'secondary'} size="sm" onClick={() => setReadingMode('lengkap')}>
                    Lengkap
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setAudioPlaying((current) => !current)
                    showToast('Audio simulasi', audioPlaying ? 'Pemutaran dihentikan.' : 'Kontrol audio aktif. Tidak ada audio otomatis pada prototype.')
                  }}
                >
                  {audioPlaying ? <AudioLines className="size-4" /> : <PlayCircle className="size-4" />}
                  {audioPlaying ? 'Jeda audio' : 'Dengarkan'}
                </Button>
              </div>
            </div>

            <div className="space-y-8 p-6 md:p-8">
              <section>
                <h3 className="flex items-center gap-2 text-lg font-black">
                  <ListChecks className="size-5 text-teal-700" /> Setelah membaca, kamu dapat
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {module.objectives.map((objective) => (
                    <div key={objective} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm font-semibold leading-6 text-slate-700">
                      <CheckCircle2 className="mb-3 size-5 text-teal-700" />
                      {objective}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                {visibleSections.map((section, index) => (
                  <div key={section.title} className="grid gap-4 md:grid-cols-[44px_1fr]">
                    <span className="grid size-10 place-items-center rounded-2xl bg-teal-100 font-black text-teal-800">{index + 1}</span>
                    <div>
                      <h3 className="text-xl font-black">{section.title}</h3>
                      <p className="mt-2 max-w-4xl leading-8 text-slate-650">{section.body}</p>
                      {section.example ? (
                        <div className="mt-4 rounded-2xl border-l-4 border-violet-400 bg-violet-50 p-4 text-sm font-semibold leading-6 text-violet-950">
                          {section.example}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {readingMode === 'ringkas' && module.sections.length > visibleSections.length ? (
                  <button
                    type="button"
                    onClick={() => setReadingMode('lengkap')}
                    className="inline-flex items-center gap-2 text-sm font-black text-teal-800 hover:text-teal-950"
                  >
                    Baca {module.sections.length - visibleSections.length} bagian lainnya <ArrowRight className="size-4" />
                  </button>
                ) : null}
              </section>

              <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h3 className="flex items-center gap-2 text-lg font-black">
                    <CircleDot className="size-5 text-teal-700" /> Checklist pribadi
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {module.checklist.map((item) => (
                      <label key={item} className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                        <input type="checkbox" className="mt-1 size-4 accent-teal-700" />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-violet-900 to-teal-800 p-5 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-violet-100">Kalimat bantu</p>
                  <blockquote className="mt-4 text-lg font-black leading-8">“{module.supportPhrase}”</blockquote>
                  <p className="mt-4 text-sm leading-6 text-white/75">Ubah kalimat ini agar sesuai dengan cara komunikasimu.</p>
                </div>
              </section>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black">Lanjutkan dengan tindakan kecil</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Catat refleksi pribadi atau cari layanan berdasarkan kebutuhan, tanpa harus membuat laporan.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/app/jurnal" className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  <PencilLine className="size-4" /> Buka jurnal
                </Link>
                <Link to="/app/pusat-bantuan" className="inline-flex h-10 items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 text-sm font-bold text-teal-900 hover:bg-teal-100">
                  <LifeBuoy className="size-4" /> Cari bantuan
                </Link>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <Button
                variant="secondary"
                onClick={() => {
                  setSavedIds((current) => new Set(current).add(module.id))
                  showToast('Materi disimpan', 'Modul masuk ke daftar baca demo.')
                }}
              >
                <Bookmark className="size-4" /> {savedIds.has(module.id) ? 'Sudah disimpan' : 'Simpan modul'}
              </Button>
              <Button
                onClick={() => {
                  setCompletedIds((current) => new Set(current).add(module.id))
                  showToast('Modul selesai', 'Progres belajar demo diperbarui.')
                }}
              >
                <Check className="size-4" /> {completedIds.has(module.id) ? 'Sudah selesai' : 'Tandai selesai'}
              </Button>
            </div>
          </Card>
        </article>
      </div>
    </motion.div>
  )
}

function JournalPage() {
  const [mood, setMood] = useState('Biasa saja')
  const [assistantStarter] = useState(() => window.sessionStorage.getItem(JOURNAL_STARTER_KEY))
  const [journalText, setJournalText] = useState(() => window.sessionStorage.getItem(JOURNAL_STARTER_KEY) ?? '')
  const { showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Tersimpan otomatis"
        title="Jurnal Aman"
        description="Ruang pribadi untuk menulis, menyimpan suara, dan menandai hal yang ingin kamu ingat. Semua contoh di sini sintetis."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Buat Catatan Baru</h2>
            <Badge tone="green">
              <Lock className="size-3.5" /> Draft privat simulasi
            </Badge>
          </div>
          {assistantStarter ? (
            <div className="mt-5 flex gap-3 rounded-3xl border border-violet-200 bg-violet-50 p-4">
              <Bot className="mt-0.5 size-5 shrink-0 text-violet-700" />
              <div>
                <p className="font-black text-violet-950">Kerangka dari Asisten Aman</p>
                <p className="mt-1 text-sm leading-6 text-violet-900">
                  Pertanyaan panduan ini belum disimpan sebagai jurnal. Ubah, hapus, atau abaikan bagian mana pun.
                </p>
              </div>
            </div>
          ) : null}
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Tanggal
              <Input value="22 Mei 2026" readOnly />
            </label>
            <div>
              <p className="text-sm font-bold text-slate-700">Perasaan hari ini</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {['Sangat baik', 'Baik', 'Biasa saja', 'Sedih', 'Sangat sedih'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMood(item)}
                    className={cn(
                      'rounded-2xl border px-3 py-3 text-sm font-semibold transition',
                      mood === item ? 'border-violet-300 bg-violet-50 text-violet-800' : 'border-slate-200 bg-white hover:bg-slate-50',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Apa yang ingin dicatat?
              <Textarea
                value={journalText}
                onChange={(event) => setJournalText(event.target.value)}
                placeholder="Tuliskan dengan bahasamu sendiri. Kamu bisa berhenti kapan saja."
                className="min-h-48"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Siapa yang terlibat? <span className="font-normal text-slate-500">Opsional dan bisa dikosongkan.</span>
              <Input placeholder="Gunakan alias jika lebih nyaman." />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Hal yang ingin diingat
              <Textarea placeholder="Catatan penting untuk dirimu di masa depan." />
            </label>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="grid size-10 place-items-center rounded-2xl bg-teal-100 text-teal-800">
                  <Mic className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="h-2 rounded-full bg-white">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-teal-600 to-violet-500" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">00:00 / 03:00 · Catatan suara simulasi</p>
                </div>
                <Button variant="secondary">Rekam</Button>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => showToast('Draft tersimpan', 'Catatan tersimpan sebagai draft lokal demo.')}>
                Simpan sebagai draft
              </Button>
              <Button onClick={() => showToast('Catatan tersimpan', 'Jurnal aman diperbarui. Tidak ada data dikirim.')}>
                Simpan Catatan
              </Button>
            </div>
          </div>
        </Card>
        <aside className="space-y-5">
          <Card className="bg-violet-50/70">
            <h3 className="flex items-center gap-2 font-black text-violet-950">
              <Heart className="size-5" /> Tips untukmu hari ini
            </h3>
            <p className="mt-3 text-sm leading-6 text-violet-900">
              Menulis sedikit saja sudah cukup. Kamu tidak perlu mengingat semuanya sekaligus.
            </p>
          </Card>
          <Card>
            <h3 className="font-black">Catatan sebelumnya</h3>
            <div className="mt-4 space-y-3">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 p-3">
                  <p className="font-bold">{entry.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{entry.date} · {entry.mood}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{entry.summary}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-black">Status penyimpanan</h3>
            <p className="mt-2 text-sm font-semibold text-teal-800">Tersimpan otomatis · Draft terakhir 10:24 WIB</p>
          </Card>
        </aside>
      </div>
    </motion.div>
  )
}

function EvidenceVaultPage() {
  const [filter, setFilter] = useState<EvidenceType | 'semua'>('semua')
  const [selectedId, setSelectedId] = useState(evidenceFiles[0].id)
  const { showToast } = useDemo()
  const filteredEvidence = useMemo(() => (filter === 'semua' ? evidenceFiles : evidenceFiles.filter((item) => item.type === filter)), [filter])
  const selected = evidenceFiles.find((item) => item.id === selectedId) ?? evidenceFiles[0]

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Brankas pribadi"
        title="Brankas Bukti"
        description="Simpan dan pilih bukti sintetis untuk laporan awal. Setiap item menampilkan metadata, hash simulasi, dan konteks aman."
        action={
          <Button onClick={() => showToast('Unggah bukti simulasi', 'Panel demo menambahkan contoh metadata tanpa file sungguhan.')}>
            <Upload className="size-4" /> Unggah Bukti
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={filter === 'semua' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('semua')}>Semua</Button>
            {Object.entries(evidenceTypeLabels).map(([key, label]) => (
              <Button key={key} variant={filter === key ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(key as EvidenceType)}>
                {label}
              </Button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvidence.map((item) => (
              <EvidenceCard key={item.id} item={item} selected={selected.id === item.id} onSelect={() => setSelectedId(item.id)} />
            ))}
          </div>
        </Card>
        <aside className="space-y-5">
          <Card className="bg-gradient-to-br from-teal-50 to-white">
            <div className="mx-auto grid size-28 place-items-center rounded-[2rem] bg-teal-700 text-white shadow-xl shadow-teal-900/20">
              <Lock className="size-12" />
            </div>
            <h3 className="mt-5 text-center text-xl font-black">Keamanan Brankas Bukti</h3>
            <div className="mt-5 space-y-4">
              {['Penyimpanan lokal simulasi', 'PIN dan hash bersifat demonstrasi', 'Pemilihan akses oleh pengguna'].map((item) => (
                <div key={item} className="flex gap-3 text-sm font-semibold text-slate-700">
                  <Check className="size-5 text-teal-700" /> {item}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-black">Detail terpilih</h3>
            <p className="mt-3 font-bold text-teal-900">{selected.title}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Detail label="Jenis" value={evidenceTypeLabels[selected.type]} />
              <Detail label="Waktu" value={selected.capturedAt} />
              <Detail label="Ukuran" value={selected.size} />
              <Detail label="Hash" value={selected.hash} />
            </dl>
            <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{selected.note}</p>
          </Card>
        </aside>
      </div>
    </motion.div>
  )
}

function TimelinePage() {
  const [assistantHandoff] = useState(() => readTimelineAssistantHandoff())
  const [selectedNoteIds, setSelectedNoteIds] = useState(
    () => new Set(
      assistantHandoff?.selectedNoteIds.filter((id) => timelineSourceNotes.some((note) => note.id === id)) ??
      timelineSourceNotes.slice(0, 4).map((note) => note.id),
    ),
  )
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(timelineSourceNotes[0].id)
  const [generatedEvents, setGeneratedEvents] = useState<ReviewedTimelineCandidate[]>(
    () => assistantHandoff?.events.map((event) => ({ ...event, reviewStatus: 'pending' })) ?? [],
  )
  const [warnings, setWarnings] = useState<string[]>(() => assistantHandoff?.warnings ?? [])
  const [assistantMode, setAssistantMode] = useState<'live' | 'fallback' | null>(() => assistantHandoff?.mode ?? null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { showToast } = useDemo()
  const selectedNotes = timelineSourceNotes.filter((note) => selectedNoteIds.has(note.id))
  const selectedEvidenceCount = new Set(selectedNotes.flatMap((note) => note.linkedEvidenceIds)).size
  const acceptedCount = generatedEvents.filter((event) => event.reviewStatus === 'accepted').length
  const rejectedCount = generatedEvents.filter((event) => event.reviewStatus === 'rejected').length
  const pendingCount = generatedEvents.length - acceptedCount - rejectedCount
  const reviewedCount = acceptedCount + rejectedCount
  const sourceTypeMeta = {
    jurnal: { label: 'Jurnal Aman', icon: PencilLine, className: 'bg-violet-100 text-violet-800' },
    bukti: { label: 'Bukti terkait', icon: Paperclip, className: 'bg-sky-100 text-sky-800' },
    pendamping: { label: 'Catatan pendamping', icon: HandHeart, className: 'bg-amber-100 text-amber-800' },
    aksesibilitas: { label: 'Kebutuhan akses', icon: Accessibility, className: 'bg-teal-100 text-teal-800' },
  } as const

  const generateTimeline = async () => {
    if (!selectedNotes.length) {
      showToast('Pilih catatan', 'Pilih setidaknya satu catatan sintetis sebelum menyusun timeline.')
      return
    }

    setIsGenerating(true)
    try {
      const result = await requestTimeline(selectedNotes)
      setGeneratedEvents(result.events.map((event) => ({ ...event, reviewStatus: 'pending' })))
      setWarnings(result.warnings)
      setAssistantMode(result.mode)
      showToast(
        result.mode === 'live' ? 'Draft AI selesai' : 'Draft fallback selesai',
        `${result.events.length} peristiwa perlu diperiksa satu per satu sebelum masuk laporan.`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const updateCandidate = (id: string, patch: Partial<ReviewedTimelineCandidate>) => {
    setGeneratedEvents((current) => current.map((event) => (event.id === id ? { ...event, ...patch } : event)))
  }

  const resetWorkspace = () => {
    setGeneratedEvents([])
    setWarnings([])
    setAssistantMode(null)
    showToast('Draft AI dihapus', 'Catatan sumber tetap tersimpan dan dapat dipilih kembali.')
  }

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Ruang kerja kronologi"
        title="Susun Kronologi dengan Kendali Penuh"
        description="Pilih sumber secara eksplisit, minta AI menyusun draft netral, lalu edit dan putuskan sendiri peristiwa yang boleh masuk ke laporan awal."
        action={
          <Button onClick={generateTimeline} disabled={isGenerating || selectedNoteIds.size === 0}>
            <Sparkles className={cn('size-4', isGenerating && 'animate-spin')} />
            {isGenerating ? 'Menyusun draft...' : 'Susun dengan AI'}
          </Button>
        }
      />

      <Card className="overflow-hidden border-none bg-slate-950 p-0 text-white">
        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/15 bg-white/10 text-white">AA-SYN-2026-014</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">Draft pribadi</Badge>
              {assistantHandoff ? (
                <Badge className="border-violet-300/20 bg-violet-300/10 text-violet-100">
                  Dibuat lewat Asisten Aman
                </Badge>
              ) : null}
              <span className="text-xs font-semibold text-slate-400">Terakhir diperbarui 22 Mei 2026, 18.24 WIB</span>
            </div>
            <h2 className="mt-4 text-2xl font-black">Skenario sintetis: kegiatan organisasi kampus</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Ruang kerja ini menghubungkan catatan, bukti, dan kebutuhan akses tanpa mengirim seluruh jurnal. Semua nama, waktu, dan file digunakan khusus untuk demonstrasi.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-2xl font-black">{selectedNoteIds.size}</p>
              <p className="text-xs font-semibold text-slate-400">Sumber dipilih</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-2xl font-black">{selectedEvidenceCount}</p>
              <p className="text-xs font-semibold text-slate-400">Bukti terkait</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-2xl font-black">{acceptedCount}</p>
              <p className="text-xs font-semibold text-slate-400">Siap laporan</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-3" aria-label="Tahapan penyusunan kronologi">
        {[
          { step: '01', title: 'Pilih sumber', copy: 'Catatan yang tidak dipilih tidak diproses.', active: true },
          { step: '02', title: 'Susun draft AI', copy: 'Tanggal kosong tetap kosong dan sumber wajib tercantum.', active: generatedEvents.length > 0 },
          { step: '03', title: 'Review manusia', copy: 'Edit, terima, atau tolak setiap peristiwa.', active: reviewedCount > 0 },
        ].map((item) => (
          <div
            key={item.step}
            className={cn(
              'rounded-3xl border p-4 transition',
              item.active ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-white',
            )}
          >
            <div className="flex items-start gap-3">
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-2xl text-xs font-black', item.active ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500')}>
                {item.step}
              </span>
              <div>
                <h2 className="font-black">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.copy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-violet-100 bg-violet-50/60">
        <div className="flex gap-3">
          <ShieldCheck className="mt-1 size-5 shrink-0 text-violet-700" />
          <div>
            <h2 className="font-black text-violet-950">Apa yang AI lakukan dan tidak lakukan</h2>
            <p className="mt-1 text-sm leading-6 text-violet-900">
              AI hanya merapikan informasi tertulis menjadi struktur tanggal, waktu, lokasi, dan ringkasan netral. AI tidak menentukan kebenaran, niat, diagnosis, pelanggaran, atau siapa yang bersalah.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <aside className="space-y-5">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">1. Pilih sumber</h2>
                <p className="mt-1 text-sm text-slate-600">Hanya data bertanda centang yang dikirim untuk satu proses.</p>
              </div>
              <Badge tone="teal">Data sintetis</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-y border-slate-100 py-3">
              <Button size="sm" variant="secondary" onClick={() => setSelectedNoteIds(new Set(timelineSourceNotes.map((note) => note.id)))}>
                Pilih semua
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedNoteIds(new Set())}>
                Kosongkan
              </Button>
              <span className="ml-auto self-center text-xs font-bold text-slate-500">{selectedNoteIds.size}/{timelineSourceNotes.length} dipilih</span>
            </div>

            <div className="mt-4 space-y-3">
              {timelineSourceNotes.map((note) => {
                const selected = selectedNoteIds.has(note.id)
                const expanded = expandedSourceId === note.id
                const meta = sourceTypeMeta[note.sourceType]
                const SourceIcon = meta.icon
                return (
                  <div
                    key={note.id}
                    className={cn(
                      'rounded-3xl border p-4 transition',
                      selected ? 'border-teal-300 bg-teal-50/70 ring-2 ring-teal-100' : 'border-slate-200 bg-white',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        aria-label={`Pilih ${note.title}`}
                        onChange={() => {
                          setSelectedNoteIds((current) => {
                            const next = new Set(current)
                            if (next.has(note.id)) next.delete(note.id)
                            else next.add(note.id)
                            return next
                          })
                        }}
                        className="mt-1 size-5 shrink-0 accent-teal-700"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn('grid size-7 place-items-center rounded-xl', meta.className)}>
                            <SourceIcon className="size-3.5" />
                          </span>
                          <span className="text-xs font-black uppercase tracking-wide text-slate-500">{meta.label}</span>
                        </div>
                        <p className="mt-2 font-black leading-5">{note.title}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{note.recordedAt}</p>
                      </div>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-label={`${expanded ? 'Tutup' : 'Buka'} detail ${note.title}`}
                        onClick={() => setExpandedSourceId(expanded ? null : note.id)}
                        className="grid size-8 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-white"
                      >
                        <ChevronRight className={cn('size-4 transition', expanded && 'rotate-90')} />
                      </button>
                    </div>
                    {expanded ? (
                      <div className="mt-4 border-t border-slate-200/70 pt-4">
                        <p className="text-sm leading-6 text-slate-700">{note.text}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {note.tags.map((tag) => <Badge key={tag} tone="slate">{tag}</Badge>)}
                        </div>
                        {note.linkedEvidenceIds.length ? (
                          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-sky-800">
                            <Paperclip className="size-3.5" />
                            {note.linkedEvidenceIds.map((id) => evidenceFiles.find((file) => file.id === id)?.title ?? id).join(', ')}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs font-semibold text-slate-500">Tidak ada file bukti yang ditautkan.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="border-amber-100 bg-amber-50/70">
            <h3 className="flex items-center gap-2 font-black text-amber-950">
              <Accessibility className="size-5" /> Kebutuhan review
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
              <li>Komunikasi utama: teks tertulis.</li>
              <li>Berikan waktu jeda saat memeriksa hasil.</li>
              <li>Pendamping hanya melihat data yang diizinkan.</li>
            </ul>
          </Card>
        </aside>

        <div className="space-y-5" aria-live="polite">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">2. Tinjau draft peristiwa</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {generatedEvents.length
                    ? `${reviewedCount} dari ${generatedEvents.length} peristiwa sudah diputuskan.`
                    : 'Belum ada hasil. Periksa pilihan sumber, lalu tekan “Susun dengan AI”.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {assistantMode ? (
                  <Badge tone={assistantMode === 'live' ? 'green' : 'purple'}>
                    {assistantMode === 'live' ? 'Gemini aktif' : 'Fallback lokal'}
                  </Badge>
                ) : null}
                {generatedEvents.length ? (
                  <Button size="sm" variant="ghost" onClick={resetWorkspace}>
                    <RotateCcw className="size-4" /> Reset draft
                  </Button>
                ) : null}
              </div>
            </div>
            {generatedEvents.length ? (
              <>
                <Progress value={(reviewedCount / generatedEvents.length) * 100} className="mt-4" />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-center">
                    <p className="text-xl font-black text-amber-800">{pendingCount}</p>
                    <p className="text-xs font-bold text-amber-700">Perlu cek</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                    <p className="text-xl font-black text-emerald-800">{acceptedCount}</p>
                    <p className="text-xs font-bold text-emerald-700">Diterima</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-center">
                    <p className="text-xl font-black text-slate-700">{rejectedCount}</p>
                    <p className="text-xs font-bold text-slate-600">Tidak digunakan</p>
                  </div>
                </div>
              </>
            ) : null}
          </Card>

          {warnings.map((warning) => (
            <div key={warning} className="flex gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              {warning}
            </div>
          ))}

          {generatedEvents.map((event, index) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card
                className={cn(
                  'overflow-hidden p-0',
                  event.reviewStatus === 'accepted' && 'border-emerald-300',
                  event.reviewStatus === 'rejected' && 'border-slate-200 bg-slate-50 opacity-75',
                )}
              >
                <div
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4',
                    event.reviewStatus === 'accepted'
                      ? 'border-emerald-100 bg-emerald-50'
                      : event.reviewStatus === 'rejected'
                        ? 'border-slate-200 bg-slate-100'
                        : 'border-violet-100 bg-violet-50/70',
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="purple">Draft AI · wajib ditinjau</Badge>
                    <Badge tone={event.uncertainty === 'explicit' ? 'green' : event.uncertainty === 'ambiguous' ? 'purple' : 'rose'}>
                      {event.uncertainty === 'explicit' ? 'Data eksplisit' : event.uncertainty === 'ambiguous' ? 'Ada informasi ambigu' : 'Informasi kurang'}
                    </Badge>
                    {event.reviewStatus !== 'pending' ? (
                      <Badge tone={event.reviewStatus === 'accepted' ? 'green' : 'slate'}>
                        {event.reviewStatus === 'accepted' ? 'Diterima pengguna' : 'Tidak digunakan'}
                      </Badge>
                    ) : null}
                  </div>
                  <span className="text-sm font-black text-slate-400">Peristiwa {String(index + 1).padStart(2, '0')}</span>
                </div>

                <div className="p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Judul netral
                      <Input value={event.title} onChange={(input) => updateCandidate(event.id, { title: input.target.value, reviewStatus: 'pending' })} />
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Tanggal
                      <Input
                        value={event.date ?? ''}
                        placeholder="Tidak tercatat, jangan ditebak"
                        onChange={(input) => updateCandidate(event.id, { date: input.target.value || null, reviewStatus: 'pending' })}
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Waktu
                      <Input
                        value={event.time ?? ''}
                        placeholder="Tidak tercatat, jangan ditebak"
                        onChange={(input) => updateCandidate(event.id, { time: input.target.value || null, reviewStatus: 'pending' })}
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Lokasi
                      <Input
                        value={event.location ?? ''}
                        placeholder="Tidak tercatat, jangan ditebak"
                        onChange={(input) => updateCandidate(event.id, { location: input.target.value || null, reviewStatus: 'pending' })}
                      />
                    </label>
                  </div>
                  <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                    Ringkasan berdasarkan sumber
                    <Textarea
                      value={event.neutralSummary}
                      onChange={(input) => updateCandidate(event.id, { neutralSummary: input.target.value, reviewStatus: 'pending' })}
                    />
                  </label>

                  <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Jejak sumber</p>
                    <div className="mt-3 space-y-3">
                      {event.sourceNoteIds.map((sourceId) => {
                        const source = timelineSourceNotes.find((note) => note.id === sourceId)
                        if (!source) return null
                        const meta = sourceTypeMeta[source.sourceType]
                        const SourceIcon = meta.icon
                        return (
                          <div key={sourceId} className="flex items-start gap-3 rounded-2xl bg-white p-3">
                            <span className={cn('grid size-8 shrink-0 place-items-center rounded-xl', meta.className)}>
                              <SourceIcon className="size-4" />
                            </span>
                            <div>
                              <p className="text-sm font-black">{source.title}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-600">{source.text.slice(0, 170)}{source.text.length > 170 ? '...' : ''}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-md text-xs font-semibold leading-5 text-slate-500">
                      Mengedit isi akan mengembalikan status ke “perlu cek” agar perubahan diperiksa ulang.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => updateCandidate(event.id, { reviewStatus: 'rejected' })}>
                        <X className="size-4" /> Jangan gunakan
                      </Button>
                      <Button variant="secondary" onClick={() => updateCandidate(event.id, { reviewStatus: 'pending' })}>
                        Perlu cek
                      </Button>
                      <Button onClick={() => updateCandidate(event.id, { reviewStatus: 'accepted' })}>
                        <Check className="size-4" /> Terima
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {generatedEvents.length ? (
            <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge tone={pendingCount === 0 && acceptedCount > 0 ? 'green' : 'purple'}>
                    {pendingCount === 0 ? 'Review selesai' : `${pendingCount} masih perlu diperiksa`}
                  </Badge>
                  <h3 className="mt-3 text-xl font-black text-teal-950">3. Siapkan laporan awal</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-900">
                    {acceptedCount} peristiwa diterima untuk ringkasan laporan. {rejectedCount} peristiwa tidak digunakan dan tetap berada di ruang kerja pribadi.
                  </p>
                </div>
                <Link
                  to="/app/laporan"
                  className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-bold transition',
                    acceptedCount > 0
                      ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/20 hover:bg-teal-800'
                      : 'pointer-events-none bg-slate-200 text-slate-500',
                  )}
                  aria-disabled={acceptedCount === 0}
                >
                  Tinjau laporan awal <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4">
                  <FileCheck2 className="size-5 text-teal-700" />
                  <p className="mt-2 font-black">{acceptedCount} peristiwa</p>
                  <p className="text-xs text-slate-500">Dipilih oleh pengguna</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <Paperclip className="size-5 text-sky-700" />
                  <p className="mt-2 font-black">{selectedEvidenceCount} bukti</p>
                  <p className="text-xs text-slate-500">Masih perlu dipilih di laporan</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <Accessibility className="size-5 text-violet-700" />
                  <p className="mt-2 font-black">3 kebutuhan akses</p>
                  <p className="text-xs text-slate-500">Teks, jeda, pendamping</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="min-h-80 border-dashed p-8">
              <div className="mx-auto max-w-xl text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-teal-100 text-teal-800">
                  <Sparkles className="size-7" />
                </span>
                <h3 className="mt-5 text-xl font-black">AI belum memproses apa pun</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sistem tidak membaca semua data akun. Proses baru dimulai setelah kamu memilih sumber dan menekan tombol “Susun dengan AI”.
                </p>
                <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
                  {[
                    ['Ekstrak', 'Tanggal, waktu, dan lokasi yang tertulis.'],
                    ['Rujuk', 'Setiap peristiwa harus memiliki sumber.'],
                    ['Tahan', 'Informasi yang tidak ada dibiarkan kosong.'],
                  ].map(([title, copy]) => (
                    <div key={title} className="rounded-2xl bg-slate-50 p-3">
                      <p className="font-black text-teal-900">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Kronologi contoh yang sudah tersimpan</h2>
            <p className="mt-1 text-sm text-slate-600">Contoh ini menunjukkan tampilan setelah review, bukan hasil dari proses yang sedang aktif.</p>
          </div>
          <Badge tone="slate">Snapshot demo</Badge>
        </div>
        <div className="relative mt-5 space-y-4 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-slate-200">
          {timelineEvents.map((event) => (
            <div key={event.id} className="relative flex gap-4">
              <span className={cn('relative z-10 mt-1 grid size-9 shrink-0 place-items-center rounded-full ring-4 ring-white', event.included ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-500')}>
                {event.included ? <Check className="size-4" /> : <CircleDot className="size-4" />}
              </span>
              <div className="flex-1 rounded-3xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-500">{event.date} · {event.time}</p>
                  <Badge tone={event.included ? 'green' : 'slate'}>{event.included ? 'Masuk laporan' : 'Catatan pribadi'}</Badge>
                </div>
                <h3 className="mt-2 font-black">{event.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{event.summary}</p>
                <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <MapPin className="size-3.5" /> {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

function CompanionsPage() {
  const [consentOpen, setConsentOpen] = useState(false)
  const { showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Kamu yang menentukan"
        title="Pendamping Tepercaya"
        description="Atur siapa yang boleh mendampingi dan informasi apa saja yang dapat dilihat. Izin bisa dicabut kapan saja."
        action={<Button onClick={() => setConsentOpen(true)}><Plus className="size-4" /> Tambah Pendamping</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustedCompanions.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <span className="grid size-14 place-items-center rounded-3xl bg-violet-100 text-violet-800">
                <UserRoundCheck className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-black">{item.name}</h3>
              <p className="text-sm font-semibold text-slate-500">{item.role}</p>
              <Badge className="mt-4 w-fit" tone={item.status === 'aktif' ? 'green' : item.status === 'tersedia' ? 'teal' : 'slate'}>{item.status}</Badge>
              <div className="mt-4 min-h-16 space-y-1 text-sm text-slate-600">
                <p>{item.channel}</p>
                <p>{item.contact}</p>
                <p>{item.scopes.length ? item.scopes.join(', ') : 'Belum ada akses'}</p>
              </div>
              <Button className="mt-auto w-full" variant="secondary" onClick={() => setConsentOpen(true)}>Atur izin</Button>
            </Card>
          ))}
        </div>
        <aside className="space-y-5">
          <Card>
            <h3 className="font-black">Izin aktif dan draft</h3>
            <div className="mt-4 space-y-3">
              {consentGrants.map((grant) => (
                <div key={grant.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{grant.recipient}</p>
                    <Badge tone={grant.status === 'aktif' ? 'green' : 'slate'}>{grant.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{grant.scopes.join(', ')} · {grant.expiresAt}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="bg-teal-50/70">
            <h3 className="font-black text-teal-950">Prinsip berbagi</h3>
            <p className="mt-2 text-sm leading-6 text-teal-900">
              Berbagi dilakukan setelah ringkasan data ditampilkan. Demo tidak mengirimkan apa pun ke pihak luar.
            </p>
          </Card>
        </aside>
      </div>
      <Dialog open={consentOpen} title="Atur izin akses" onClose={() => setConsentOpen(false)}>
        <div className="space-y-4">
          <p className="leading-7 text-slate-600">Pilih informasi yang boleh dilihat pendamping. Ini hanya simulasi persetujuan.</p>
          {['Ringkasan situasi', 'Kronologi terpilih', 'Bukti yang dipilih', 'Kebutuhan aksesibilitas'].map((item) => (
            <label key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 font-semibold">
              <input type="checkbox" defaultChecked className="size-5 accent-teal-700" />
              {item}
            </label>
          ))}
          <Button
            className="w-full"
            onClick={() => {
              setConsentOpen(false)
              showToast('Izin akses disiapkan', 'Ringkasan izin demo siap ditinjau sebelum dibagikan.')
            }}
          >
            Simpan izin simulasi
          </Button>
        </div>
      </Dialog>
    </motion.div>
  )
}

function ReportPage() {
  const { showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Ditinjau sebelum dibagikan"
        title="Laporan Awal"
        description="Preview laporan awal yang berisi ringkasan, kronologi, bukti terpilih, kebutuhan akses, dan catatan persetujuan."
        action={<Button onClick={() => showToast('Ekspor laporan simulasi', 'PDF/DOCX demo siap. Tidak ada file atau data yang dikirim ke luar aplikasi.')}>Ekspor Demo</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-0">
          <div className="border-b border-slate-200 bg-white p-6">
            <Badge tone="teal">{reportDraft.updatedAt}</Badge>
            <h2 className="mt-4 text-3xl font-black">{reportDraft.title}</h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Dokumen pendukung awal untuk ditinjau pendamping manusia. Bukan putusan hukum, diagnosis, atau penentu kebenaran.
            </p>
          </div>
          <div className="divide-y divide-slate-200">
            {reportDraft.sections.map((section) => (
              <div key={section.title} className="grid gap-4 p-6 md:grid-cols-[220px_1fr_auto] md:items-center">
                <h3 className="font-black">{section.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{section.summary}</p>
                <Badge tone={section.status === 'siap' ? 'green' : 'purple'}>{section.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <aside className="space-y-5">
          <Card>
            <h3 className="font-black">Daftar bukti terpilih</h3>
            <div className="mt-4 space-y-3">
              {evidenceFiles.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <FileText className="size-5 text-teal-700" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-slate-500">{evidenceTypeLabels[item.type]}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-violet-100 bg-violet-50/70">
            <h3 className="font-black text-violet-950">Catatan etis</h3>
            <p className="mt-2 text-sm leading-6 text-violet-900">
              AI demo hanya membantu menyusun bahasa. Pengguna tetap memegang kendali penuh atas isi dan berbagi data.
            </p>
          </Card>
          <Card>
            <h3 className="font-black">Audit terakhir</h3>
            <div className="mt-4 space-y-3">
              {auditLog.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-3 text-sm">
                  <p className="font-bold">{item.action}</p>
                  <p className="mt-1 text-slate-500">{item.at} · {item.actor}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </motion.div>
  )
}

const initialChatMessages: ChatUiMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Hai, aku Asisten Aman. Aku bisa mendengarkan secara singkat, membantu memecah langkah yang terasa berat, dan menjalankan fitur AmanAkses setelah kamu mengonfirmasi. Kamu tidak perlu menuliskan nama asli atau detail sensitif kejadian.',
  },
]

const chatQuickPrompts = [
  'Aku merasa kewalahan dan tidak tahu mulai dari mana.',
  'Buatkan draft kronologi dari catatan demo.',
  'Siapkan jurnal dengan panduan singkat.',
  'Aktifkan tampilan yang lebih tenang.',
  'Aku ingin bicara dengan pendamping manusia.',
]

const journalStarterTemplates = {
  'free-write': 'Aku ingin mencatat...\n\nAku boleh berhenti kapan saja.',
  'facts-feelings-needs':
    'HAL YANG AKU INGAT\nTuliskan hanya hal yang benar-benar diingat. Tidak perlu lengkap.\n\n' +
    'PERASAAN YANG MUNCUL\nAku merasa...\n\n' +
    'KEBUTUHANKU SAAT INI\nSaat ini aku membutuhkan...',
  'support-request':
    'YANG KURASAKAN SAAT INI\nAku merasa...\n\n' +
    'HAL KECIL YANG DAPAT MEMBANTU\nAku mungkin membutuhkan jeda, tempat yang lebih tenang, atau seseorang untuk menemani.\n\n' +
    'KALIMAT UNTUK MEMINTA BANTUAN\n“Aku sedang kewalahan. Bisakah kamu menemaniku tanpa meminta aku menjelaskan semuanya?”',
} as const

function ChatAssistantPage() {
  const navigate = useNavigate()
  const { applyAccessibilityPatch, showToast } = useDemo()
  const [messages, setMessages] = useState<ChatUiMessage[]>(initialChatMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [toolStates, setToolStates] = useState<Record<string, 'idle' | 'running' | 'done' | 'error'>>({})

  const sendMessage = async (input: string) => {
    const content = input.trim()
    if (!content || isSending) return

    const userMessage: ChatUiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    }
    const history = messages.map((item) => ({
      role: item.role,
      content: item.content,
    }))

    setMessages((current) => [...current, userMessage])
    setDraft('')
    setIsSending(true)

    try {
      const result = await requestChatReply(content, history)
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          response: result,
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const executeTool = async (messageId: string, toolCall: ChatToolCall) => {
    const stateKey = `${messageId}:${toolCall.id}`
    setToolStates((current) => ({ ...current, [stateKey]: 'running' }))

    try {
      if (toolCall.name === 'draft_timeline') {
        const notes =
          toolCall.arguments.sourcePreset === 'all-demo-notes'
            ? timelineSourceNotes
            : timelineSourceNotes.slice(0, 4)
        const result = await requestTimeline(notes)
        const handoff: TimelineAssistantHandoff = {
          selectedNoteIds: notes.map((note) => note.id),
          events: result.events,
          warnings: result.warnings,
          mode: result.mode,
          createdAt: new Date().toISOString(),
        }
        window.sessionStorage.setItem(TIMELINE_HANDOFF_KEY, JSON.stringify(handoff))
        setToolStates((current) => ({ ...current, [stateKey]: 'done' }))
        showToast(
          result.mode === 'live' ? 'Draft kronologi dibuat dengan Gemini' : 'Draft kronologi dibuat dengan fallback',
          `${result.events.length} peristiwa siap ditinjau. Tidak ada peristiwa yang otomatis diterima.`,
        )
        navigate('/app/kronologi?from=assistant')
        return
      }

      if (toolCall.name === 'prepare_journal') {
        window.sessionStorage.setItem(
          JOURNAL_STARTER_KEY,
          journalStarterTemplates[toolCall.arguments.template],
        )
        setToolStates((current) => ({ ...current, [stateKey]: 'done' }))
        showToast('Kerangka jurnal siap', 'Kerangka belum disimpan dan dapat diubah atau dihapus.')
        navigate('/app/jurnal?from=assistant')
        return
      }

      if (toolCall.name === 'update_accessibility') {
        applyAccessibilityPatch(toolCall.arguments)
        setToolStates((current) => ({ ...current, [stateKey]: 'done' }))
        showToast('Tampilan diperbarui', 'Easy Read, ukuran teks, dan gerak telah disesuaikan untuk sesi demo.')
        return
      }

      const supportRoutes = {
        pendamping: '/app/pendamping',
        'pusat-bantuan': '/app/pusat-bantuan',
        'safe-exit': '/safe-exit',
      } as const
      setToolStates((current) => ({ ...current, [stateKey]: 'done' }))
      navigate(supportRoutes[toolCall.arguments.destination])
    } catch {
      setToolStates((current) => ({ ...current, [stateKey]: 'error' }))
      showToast('Tool belum berhasil', 'Tidak ada data yang diubah. Coba lagi atau buka fitur secara manual.')
    }
  }

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Dukungan emosional non-klinis + tool AmanAkses"
        title="Asisten Aman"
        description="Bicarakan langkah yang terasa berat, dapatkan pilihan kecil yang praktis, lalu jalankan fitur aplikasi hanya setelah kamu mengonfirmasi."
        action={
          <Button
            variant="secondary"
            onClick={() => {
              setMessages(initialChatMessages)
              setDraft('')
              setToolStates({})
            }}
          >
            <RotateCcw className="size-4" /> Mulai ulang
          </Button>
        }
      />

      <Card className="border-violet-100 bg-violet-50/60">
        <div className="flex gap-3">
          <ShieldCheck className="mt-1 size-5 shrink-0 text-violet-700" />
          <div>
            <h2 className="font-black text-violet-950">Hangat, tetapi tetap memiliki batas</h2>
            <p className="mt-1 text-sm leading-6 text-violet-900">
              Asisten dapat merefleksikan perasaan secara tentatif, menawarkan grounding sederhana, dan menyiapkan tool aplikasi.
              Ia bukan psikiater atau terapis, tidak memberi diagnosis, dan tidak menggantikan bantuan manusia.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card className="flex min-h-[650px] flex-col p-0">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-violet-600 text-white">
                <Bot className="size-6" />
              </span>
              <div>
                <h2 className="font-black">Percakapan suportif</h2>
                <p className="text-xs font-semibold text-slate-500">Respons AI + tool terkonfirmasi · gunakan data sintetis.</p>
              </div>
            </div>
            <Badge tone="teal">Data sintetis</Badge>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[86%] rounded-[1.35rem] px-4 py-3 shadow-sm',
                    message.role === 'user'
                      ? 'rounded-br-md bg-teal-700 text-white'
                      : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800',
                    message.response?.safetyLevel === 'urgent' &&
                      'border-rose-300 bg-rose-50 text-rose-950',
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-wide opacity-70">
                      {message.role === 'user' ? 'Kamu' : 'Asisten Aman'}
                    </p>
                    {message.response ? (
                      <>
                        <Badge tone={message.response.mode === 'live' ? 'green' : 'purple'}>
                          {message.response.mode === 'live' ? 'Gemini live' : 'Fallback lokal'}
                        </Badge>
                        {message.response.safetyLevel !== 'normal' ? (
                          <Badge tone={message.response.safetyLevel === 'urgent' ? 'rose' : 'purple'}>
                            {message.response.safetyLevel === 'urgent' ? 'Prioritas keselamatan' : 'Topik sensitif'}
                          </Badge>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                  {message.response?.toolCalls.length ? (
                    <div className="mt-4 space-y-3">
                      {message.response.toolCalls.map((toolCall) => {
                        const stateKey = `${message.id}:${toolCall.id}`
                        const toolState = toolStates[stateKey] ?? 'idle'
                        const ToolIcon =
                          toolCall.name === 'draft_timeline'
                            ? CalendarClock
                            : toolCall.name === 'prepare_journal'
                              ? PencilLine
                              : toolCall.name === 'update_accessibility'
                                ? Accessibility
                                : HandHeart
                        return (
                          <div key={stateKey} className="rounded-2xl border border-teal-200 bg-white p-3 text-slate-800">
                            <div className="flex items-start gap-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-800">
                                <ToolIcon className="size-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-black">{toolCall.label}</p>
                                  <Badge tone={toolState === 'done' ? 'green' : toolState === 'error' ? 'rose' : 'teal'}>
                                    {toolState === 'running'
                                      ? 'Menjalankan'
                                      : toolState === 'done'
                                        ? 'Selesai'
                                        : toolState === 'error'
                                          ? 'Gagal'
                                          : 'Perlu konfirmasi'}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-xs leading-5 text-slate-600">{toolCall.description}</p>
                                <Button
                                  size="sm"
                                  className="mt-3"
                                  disabled={toolState === 'running' || toolState === 'done'}
                                  onClick={() => void executeTool(message.id, toolCall)}
                                >
                                  {toolState === 'running' ? (
                                    <Sparkles className="size-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="size-4" />
                                  )}
                                  {toolState === 'running'
                                    ? 'Memproses...'
                                    : toolState === 'done'
                                      ? 'Sudah dijalankan'
                                      : 'Konfirmasi dan jalankan'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                  {message.response?.suggestedActions.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.response.suggestedActions.map((item) => (
                        <Button
                          key={`${message.id}-${item.route}`}
                          size="sm"
                          variant={item.route === '/safe-exit' ? 'danger' : 'secondary'}
                          onClick={() => navigate(item.route)}
                        >
                          {item.label} <ChevronRight className="size-4" />
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  {message.response ? (
                    <p className="mt-3 border-t border-current/10 pt-3 text-xs leading-5 opacity-70">
                      {message.response.disclaimer}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            {isSending ? (
              <div className="flex justify-start">
                <div className="rounded-[1.35rem] rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <Sparkles className="size-4 animate-pulse text-teal-600" />
                    Menyiapkan jawaban aman...
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-slate-200 bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault()
              void sendMessage(draft)
            }}
          >
            <div className="flex gap-3">
              <Input
                value={draft}
                maxLength={1600}
                placeholder="Contoh: Aku kewalahan. Bantu pilih satu langkah kecil."
                aria-label="Pesan untuk Asisten Aman"
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button type="submit" disabled={!draft.trim() || isSending} aria-label="Kirim pesan">
                <Send className="size-4" /> Kirim
              </Button>
            </div>
          </form>
        </Card>

        <aside className="space-y-5">
          <Card>
            <h2 className="flex items-center gap-2 font-black">
              <MessageCircle className="size-5 text-teal-700" />
              Coba pertanyaan
            </h2>
            <div className="mt-4 grid gap-3">
              {chatQuickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isSending}
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-semibold leading-6 text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-teal-100 bg-teal-50/70">
            <h3 className="flex items-center gap-2 font-black text-teal-950">
              <Sparkles className="size-5" /> Tool yang tersedia
            </h3>
            <div className="mt-4 space-y-3 text-sm text-teal-900">
              {[
                [CalendarClock, 'Draft kronologi', 'Memproses catatan demo dan membuka review.'],
                [PencilLine, 'Kerangka jurnal', 'Menyiapkan prompt tanpa menyimpan otomatis.'],
                [Accessibility, 'Tampilan aksesibel', 'Mengubah Easy Read, teks, dan gerak.'],
                [HandHeart, 'Bantuan manusia', 'Membuka pendamping atau pusat bantuan.'],
              ].map(([Icon, title, copy]) => (
                <div key={String(title)} className="flex gap-3 rounded-2xl bg-white/80 p-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-teal-700" />
                  <div>
                    <p className="font-black">{title as string}</p>
                    <p className="mt-1 text-xs leading-5 text-teal-800">{copy as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-amber-100 bg-amber-50/70">
            <h3 className="flex items-center gap-2 font-black text-amber-950">
              <AlertTriangle className="size-5" /> Batas prototype
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
              <li>• Percakapan tidak disimpan sebagai data kasus.</li>
              <li>• Semua tool meminta konfirmasi sebelum dijalankan.</li>
              <li>• Kontak bantuan masih berupa data simulasi.</li>
              <li>• Tidak ada diagnosis, verifikasi kebenaran, atau keputusan otomatis.</li>
              <li>• Situasi darurat harus ditangani oleh bantuan manusia.</li>
            </ul>
          </Card>

          <Button variant="danger" className="w-full" onClick={() => navigate('/safe-exit')}>
            <LogOut className="size-4" /> Keluar Cepat
          </Button>
        </aside>
      </div>
    </motion.div>
  )
}

function HelpCenterPage() {
  const [category, setCategory] = useState('Semua')
  const categories = ['Semua', ...Array.from(new Set(serviceProviders.map((item) => item.category)))]
  const filteredServices = useMemo(() => (category === 'Semua' ? serviceProviders : serviceProviders.filter((item) => item.category === category)), [category])

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Direktori simulasi"
        title="Pusat Bantuan"
        description="Filter layanan dummy berdasarkan jenis bantuan, kanal komunikasi, dan dukungan aksesibilitas."
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="size-5 text-teal-700" />
          {categories.map((item) => (
            <Button key={item} variant={category === item ? 'primary' : 'secondary'} size="sm" onClick={() => setCategory(item)}>
              {item}
            </Button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="border-slate-200 bg-slate-50/50 shadow-none">
              <Badge tone="teal">{service.category}</Badge>
              <h3 className="mt-4 text-lg font-black">{service.name}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{service.city}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{service.availability}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.channels.map((channel) => <Badge key={channel} tone="slate">{channel}</Badge>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {service.accessibility.map((need) => <Badge key={need} tone="purple">{accessibilityLabels[need]}</Badge>)}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

function AccessibilityPage() {
  const { accessibility, toggleAccessibility, setTextScale, showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Atur pengalamanmu"
        title="Aksesibilitas"
        description="Pengaturan demo ini mengubah ukuran teks, kontras, gerak, dan cara UI menyajikan informasi."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-xl font-black">Preferensi tampilan</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Switch checked={accessibility.highContrast} onChange={() => toggleAccessibility('highContrast')} label="Kontras tinggi" />
            <Switch checked={accessibility.easyRead} onChange={() => toggleAccessibility('easyRead')} label="Easy Read" />
            <Switch checked={accessibility.largeControls} onChange={() => toggleAccessibility('largeControls')} label="Tombol besar" />
            <Switch checked={accessibility.reducedMotion} onChange={() => toggleAccessibility('reducedMotion')} label="Kurangi gerak" />
          </div>
          <h3 className="mt-8 font-black">Ukuran teks</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            {(['normal', 'besar', 'sangat-besar'] as const).map((scale) => (
              <Button key={scale} variant={accessibility.textScale === scale ? 'primary' : 'secondary'} onClick={() => setTextScale(scale)}>
                {scale}
              </Button>
            ))}
          </div>
          <Button className="mt-8" onClick={() => showToast('Preferensi disimpan', 'Pengaturan aksesibilitas tersimpan di state demo lokal.')}>
            Simpan preferensi
          </Button>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <h3 className="font-black">Preview aksesibel</h3>
          <p className="mt-3 rounded-3xl bg-white p-4 leading-8 text-slate-700">
            Ini contoh teks sederhana. Kamu bisa memperbesar huruf, mengurangi gerak, dan membuat tombol lebih mudah dipilih.
          </p>
          <div className="mt-4 grid gap-3">
            {accessibility.enabledNeeds.map((need) => (
              <Badge key={need} tone="teal">{accessibilityLabels[need]}</Badge>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

function MobilePreviewPage() {
  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="PWA mobile-first"
        title="Mobile Safe Access"
        description="Preview layar kecil untuk akses cepat: catatan suara, safe exit, brankas, dan pendamping."
      />
      <div className="grid place-items-center">
        <div className="w-full max-w-sm rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-slate-950/20">
          <div className="rounded-[1.8rem] bg-[#f7fbfa] p-4">
            <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-slate-300" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-800">AmanAkses</p>
                <h2 className="text-xl font-black">Ruang aman</h2>
              </div>
              <span className="grid size-10 place-items-center rounded-2xl bg-teal-700 text-white">
                <Shield className="size-5" />
              </span>
            </div>
            <div className="mt-5 rounded-3xl bg-gradient-to-br from-teal-100 to-violet-100 p-4">
              <p className="font-black">Tarik napas pelan.</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Kamu bisa menulis sedikit, merekam suara, atau keluar cepat.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                [Mic, 'Rekam'],
                [PencilLine, 'Jurnal'],
                [Lock, 'Bukti'],
                [HandHeart, 'Bantuan'],
              ].map(([Icon, label]) => (
                <button key={String(label)} type="button" className="rounded-3xl border border-slate-200 bg-white p-4 text-left font-bold">
                  <Icon className="mb-3 size-5 text-teal-700" />
                  {label as string}
                </button>
              ))}
            </div>
            <Button variant="danger" className="mt-4 w-full">
              <LogOut className="size-4" /> Keluar Cepat
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SettingsPage() {
  const { discreetMode, setDiscreetMode, showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Pengaturan demo"
        title="Settings"
        description="Kontrol privasi, penyimpanan, sesi, dan status simulasi tanpa backend."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Privasi dan sesi</h2>
          <div className="mt-5 space-y-4">
            <Switch checked={discreetMode} onChange={() => setDiscreetMode(!discreetMode)} label="Mode tersembunyi" />
            <Switch checked label="Kunci setelah idle" onChange={() => showToast('Simulasi kunci sesi', 'Dalam produk nyata, sesi akan terkunci setelah waktu idle.')} />
            <Switch checked label="Audit berbagi aktif" onChange={() => showToast('Audit tetap aktif', 'Audit demo membantu memperlihatkan jejak izin berbagi.')} />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Status sistem</h2>
          <div className="mt-5 space-y-3">
            <Detail label="Mode data" value="Data simulasi lokal" />
            <Detail label="Backend" value="Tidak ada API eksternal" />
            <Detail label="Ekspor" value="Preview dan toast demo" />
            <Detail label="Safe exit" value="/safe-exit" />
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

function SafeExitPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-black">Catatan Belajar</h1>
          <Link to="/app/dashboard" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold">
            Kembali
          </Link>
        </div>
        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-bold">Halaman netral</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Ini adalah halaman keluar cepat untuk demo AmanAkses. Pada produk nyata, halaman ini dapat menyamarkan layar dan mengunci sesi.
          </p>
        </div>
      </div>
    </main>
  )
}

function EvidenceCard({ item, selected, onSelect }: { item: EvidenceFile; selected: boolean; onSelect: () => void }) {
  const Icon = item.type === 'audio' ? AudioLines : item.type === 'foto' ? Eye : FileText

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-3xl border bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-lg',
        selected ? 'border-teal-300 ring-4 ring-teal-100' : 'border-slate-200',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-teal-100 text-teal-800">
          <Icon className="size-5" />
        </span>
        <Badge tone="green">
          <Lock className="size-3.5" /> aman
        </Badge>
      </div>
      <h3 className="mt-4 truncate font-black">{item.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{item.capturedAt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => <Badge key={tag} tone="slate">{tag}</Badge>)}
      </div>
    </button>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-900/6 pb-5">
      <div className="max-w-3xl">
        <Badge tone="teal">{eyebrow}</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-slate-950 md:text-4xl">{title}</h1>
        <p className="mt-2 leading-7 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

export default App
