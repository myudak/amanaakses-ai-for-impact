import type {
  ChatAssistantResponse,
  ChatSafetyLevel,
  ChatSuggestedAction,
  ChatToolCall,
} from '../types'

export interface ChatHistoryItem {
  role: 'user' | 'assistant'
  content: string
}

const DISCLAIMER =
  'Asisten Aman memberi dukungan emosional non-klinis dan bantuan memakai aplikasi. Ia bukan psikiater, psikolog, layanan darurat, tenaga medis, atau penasihat hukum.'

const ALLOWED_ROUTES = new Set([
  '/app/dashboard',
  '/app/pahami-kekerasan',
  '/app/jurnal',
  '/app/kronologi',
  '/app/brankas-bukti',
  '/app/pendamping',
  '/app/laporan',
  '/app/pusat-bantuan',
  '/app/aksesibilitas',
  '/safe-exit',
])

const urgentPattern =
  /\b(darurat|bahaya sekarang|tidak aman sekarang|diancam|mengancam|menyakiti diri|melukai diri|bunuh diri|ingin mati|mengakhiri hidup|dikejar|terkunci bersama)\b/i
const distressPattern =
  /\b(panik|cemas|takut|kewalahan|sesak|gemetar|bingung|sedih|menangis|tertekan|tidak sanggup|sendirian)\b/i
const sensitivePattern =
  /\b(kekerasan|pelecehan|diikuti|diintimidasi|tertekan|tidak nyaman|takut|cemas|panik|kewalahan)\b/i

function action(label: string, route: string): ChatSuggestedAction {
  return { label, route }
}

function tool<T extends ChatToolCall>(
  value: Omit<T, 'id' | 'requiresConfirmation'>,
): T {
  return {
    ...value,
    id: `tool-${value.name}`,
    requiresConfirmation: true,
  } as T
}

function response(
  reply: string,
  suggestedActions: ChatSuggestedAction[],
  safetyLevel: ChatSafetyLevel = 'normal',
  toolCalls: ChatToolCall[] = [],
): ChatAssistantResponse {
  return {
    reply,
    suggestedActions,
    toolCalls,
    safetyLevel,
    disclaimer: DISCLAIMER,
    mode: 'fallback',
  }
}

export function createDeterministicChatReply(message: string): ChatAssistantResponse {
  const text = message.trim()

  if (!text) {
    return response(
      'Kamu boleh menulis satu kalimat saja. Aku bisa mendengarkan secara singkat, membantu menenangkan langkah berikutnya, atau menjalankan fitur AmanAkses setelah kamu mengonfirmasi.',
      [action('Kembali ke dashboard', '/app/dashboard')],
    )
  }

  if (urgentPattern.test(text)) {
    return response(
      'Aku khawatir keselamatan langsung perlu diprioritaskan. AmanAkses tidak dapat menangani keadaan darurat. Jika memungkinkan, menjauhlah dari sumber bahaya, dekati orang yang aman, dan hubungi layanan darurat setempat atau seseorang yang dapat hadir secara langsung. Kamu tidak perlu menjelaskan detail di sini.',
      [
        action('Keluar cepat', '/safe-exit'),
        action('Buka Pusat Bantuan', '/app/pusat-bantuan'),
        action('Hubungi pendamping', '/app/pendamping'),
      ],
      'urgent',
    )
  }

  if (/\b(buat|susun|hasilkan|generate|otomatis).{0,24}\b(kronologi|timeline|urutan kejadian)\b|\b(kronologi|timeline).{0,24}\b(buat|susun|hasilkan|generate|otomatis)\b/i.test(text)) {
    return response(
      'Aku bisa menyiapkan draft kronologi dari catatan sintetis terbaru. Sebelum dijalankan, kamu akan melihat sumber yang dipakai. Setelah selesai, setiap peristiwa tetap berstatus draft dan harus kamu edit, terima, atau tolak sendiri.',
      [action('Buka ruang kronologi', '/app/kronologi')],
      sensitivePattern.test(text) ? 'sensitive' : 'normal',
      [
        tool({
          name: 'draft_timeline',
          label: 'Susun draft dari 4 catatan terbaru',
          description: 'Memanggil Safe Timeline Assistant, menyimpan hasil sementara, lalu membuka halaman review kronologi.',
          arguments: { sourcePreset: 'recent-notes' },
        }),
      ],
    )
  }

  if (/\b(kronologi|timeline|urutan kejadian|susun kejadian)\b/i.test(text)) {
    return response(
      'Kronologi membantu memisahkan waktu, tempat, sumber, dan hal yang belum diketahui. Kamu tidak perlu mengingat semuanya sekaligus. Aku dapat membuka ruang kronologi atau, dengan konfirmasi, membuat draft dari catatan sintetis.',
      [action('Buka Safe Timeline Assistant', '/app/kronologi')],
      sensitivePattern.test(text) ? 'sensitive' : 'normal',
      [
        tool({
          name: 'draft_timeline',
          label: 'Buat draft kronologi',
          description: 'Menggunakan 4 catatan demo terbaru dan tidak memasukkan catatan lain.',
          arguments: { sourcePreset: 'recent-notes' },
        }),
      ],
    )
  }

  if (/\b(siapkan|buat|bantu).{0,20}\b(jurnal|catatan|template)\b|\b(jurnal|catatan).{0,20}\b(siapkan|buat|bantu)\b/i.test(text)) {
    return response(
      'Aku bisa menyiapkan kerangka jurnal yang memisahkan fakta, perasaan, dan kebutuhan. Isinya tetap kosong dari identitas atau detail kasus; kamu yang memilih apa yang ingin ditulis.',
      [action('Buka Jurnal Aman', '/app/jurnal')],
      sensitivePattern.test(text) ? 'sensitive' : 'normal',
      [
        tool({
          name: 'prepare_journal',
          label: 'Siapkan kerangka jurnal',
          description: 'Mengisi editor dengan pertanyaan panduan yang dapat diubah atau dihapus.',
          arguments: { template: 'facts-feelings-needs' },
        }),
      ],
    )
  }

  if (/\b(jurnal|catatan|menulis|cerita dulu)\b/i.test(text)) {
    return response(
      'Kita bisa membuatnya kecil: satu hal yang kamu ingat, satu perasaan yang muncul, dan satu kebutuhan saat ini. Catatan tidak otomatis menjadi laporan atau diproses AI.',
      [action('Buka Jurnal Aman', '/app/jurnal')],
      sensitivePattern.test(text) ? 'sensitive' : 'normal',
      [
        tool({
          name: 'prepare_journal',
          label: 'Buka jurnal dengan panduan',
          description: 'Menyiapkan tiga pertanyaan singkat tanpa menyimpan percakapan ini sebagai data kasus.',
          arguments: { template: 'facts-feelings-needs' },
        }),
      ],
    )
  }

  if (/\b(aktifkan|ubah|perbesar|buat).{0,18}\b(aksesibilitas|huruf|teks|easy read|gerak)\b|\b(huruf|teks).{0,12}\b(lebih besar|besar sekali)\b/i.test(text)) {
    return response(
      'Aku dapat memperbesar teks, mengaktifkan Easy Read, dan mengurangi gerak pada tampilan demo. Perubahan hanya berlaku pada sesi lokal ini dan dapat diubah lagi kapan saja.',
      [action('Buka pengaturan aksesibilitas', '/app/aksesibilitas')],
      'normal',
      [
        tool({
          name: 'update_accessibility',
          label: 'Terapkan tampilan lebih tenang',
          description: 'Mengaktifkan Easy Read, teks besar, dan pengurangan gerak setelah konfirmasi.',
          arguments: { easyRead: true, textScale: 'besar', reducedMotion: true },
        }),
      ],
    )
  }

  if (/\b(pendamping|teman|satgas|bantuan manusia|orang tepercaya|bicara dengan seseorang)\b/i.test(text)) {
    return response(
      'Mencari orang yang dapat hadir langsung bisa menjadi langkah yang lebih aman daripada menghadapi semuanya sendirian. Kamu tetap boleh membatasi informasi dan memulai hanya dengan mengatakan bahwa kamu membutuhkan ditemani.',
      [
        action('Buka Pendamping', '/app/pendamping'),
        action('Buka Pusat Bantuan', '/app/pusat-bantuan'),
      ],
      sensitivePattern.test(text) ? 'sensitive' : 'normal',
      [
        tool({
          name: 'open_support',
          label: 'Buka daftar pendamping',
          description: 'Membuka data pendamping sintetis. Tidak ada pesan atau data yang dikirim otomatis.',
          arguments: { destination: 'pendamping' },
        }),
      ],
    )
  }

  if (distressPattern.test(text)) {
    return response(
      'Kedengarannya saat ini terasa berat. Kita tidak harus menyelesaikan semuanya sekarang. Coba lihat sekeliling dan sebutkan dalam hati satu benda yang kamu lihat, rasakan permukaan yang menopang tubuhmu, lalu pilih satu langkah kecil: berhenti sejenak, menulis satu kalimat, atau menghubungi orang yang aman. Apakah kamu berada di tempat yang cukup aman saat ini?',
      [
        action('Tulis satu kalimat', '/app/jurnal'),
        action('Cari pendamping manusia', '/app/pendamping'),
        action('Buka Pusat Bantuan', '/app/pusat-bantuan'),
      ],
      'sensitive',
      [
        tool({
          name: 'prepare_journal',
          label: 'Siapkan catatan singkat',
          description: 'Membuka jurnal dengan panduan sederhana tentang perasaan dan kebutuhan saat ini.',
          arguments: { template: 'support-request' },
        }),
      ],
    )
  }

  if (/\b(bukti|foto|audio|dokumen|chat|screenshot)\b/i.test(text)) {
    return response(
      'Gunakan Brankas Bukti untuk meninjau file dan konteksnya. Simpan file asli bila aman, pisahkan fakta dari dugaan, dan pilih sendiri bukti yang ingin dipakai. Pada prototype, penyimpanan dan enkripsi masih simulasi.',
      [action('Buka Brankas Bukti', '/app/brankas-bukti')],
      sensitivePattern.test(text) ? 'sensitive' : 'normal',
    )
  }

  if (/\b(laporan|ekspor|bagikan|kirim)\b/i.test(text)) {
    return response(
      'Laporan Awal adalah ruang review, bukan pengiriman otomatis. Kamu dapat memeriksa ringkasan, memilih bukti, menambahkan kebutuhan akses, dan meminta pendamping meninjau sebelum memutuskan apa pun.',
      [
        action('Tinjau Laporan Awal', '/app/laporan'),
        action('Atur pendamping', '/app/pendamping'),
      ],
      sensitivePattern.test(text) ? 'sensitive' : 'normal',
    )
  }

  if (/\b(aksesibilitas|screen reader|kontras|huruf|tombol besar|easy read|gerak)\b/i.test(text)) {
    return response(
      'Pengaturan Aksesibilitas dapat mengubah ukuran teks, kontras, Easy Read, ukuran kontrol, dan gerak. Aku juga dapat menerapkan kombinasi tampilan yang lebih tenang setelah kamu mengonfirmasi.',
      [action('Atur Aksesibilitas', '/app/aksesibilitas')],
      'normal',
      [
        tool({
          name: 'update_accessibility',
          label: 'Aktifkan tampilan lebih tenang',
          description: 'Easy Read aktif, teks besar, dan gerak dikurangi.',
          arguments: { easyRead: true, textScale: 'besar', reducedMotion: true },
        }),
      ],
    )
  }

  if (/\b(apa itu|bentuk kekerasan|hak|edukasi|pelajari|memahami)\b/i.test(text)) {
    return response(
      'Kamu dapat mulai dari materi tentang persetujuan, tekanan, dokumentasi aman, bantuan, dan akomodasi akses. Materi ini membantu menyiapkan pertanyaan, bukan menilai apakah sebuah pengalaman memenuhi kategori hukum tertentu.',
      [action('Buka materi edukasi', '/app/pahami-kekerasan')],
      sensitivePattern.test(text) ? 'sensitive' : 'normal',
    )
  }

  return response(
    'Aku bisa menemanimu memecah langkah menjadi bagian kecil tanpa meminta detail sensitif. Kamu boleh memilih: memahami pilihan, menulis satu catatan, menyusun kronologi dari data demo, mengatur tampilan, atau mencari bantuan manusia. Mana yang terasa paling ringan untuk dilakukan sekarang?',
    [
      action('Buka Jurnal Aman', '/app/jurnal'),
      action('Lihat materi edukasi', '/app/pahami-kekerasan'),
      action('Cari bantuan manusia', '/app/pusat-bantuan'),
    ],
    sensitivePattern.test(text) ? 'sensitive' : 'normal',
  )
}

function sanitizeToolCall(value: unknown, index: number): ChatToolCall | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  const name = String(input.name)
  const args =
    input.arguments && typeof input.arguments === 'object'
      ? input.arguments as Record<string, unknown>
      : {}
  const base = {
    id:
      typeof input.id === 'string' && input.id.trim()
        ? input.id.trim().slice(0, 80)
        : `tool-${index + 1}-${name}`,
    requiresConfirmation: true as const,
  }

  if (name === 'draft_timeline') {
    const sourcePreset = args.sourcePreset === 'all-demo-notes' ? 'all-demo-notes' : 'recent-notes'
    return {
      ...base,
      name,
      label: sourcePreset === 'all-demo-notes' ? 'Susun semua catatan demo' : 'Susun 4 catatan terbaru',
      description: 'Membuat draft kronologi sintetis dan membuka halaman review. Tidak ada peristiwa yang otomatis diterima.',
      arguments: { sourcePreset },
    }
  }

  if (name === 'prepare_journal') {
    const template = ['free-write', 'facts-feelings-needs', 'support-request'].includes(String(args.template))
      ? args.template as 'free-write' | 'facts-feelings-needs' | 'support-request'
      : 'facts-feelings-needs'
    return {
      ...base,
      name,
      label: 'Siapkan kerangka jurnal',
      description: 'Mengisi editor dengan pertanyaan panduan. Kerangka belum disimpan dan dapat diubah atau dihapus.',
      arguments: { template },
    }
  }

  if (name === 'update_accessibility') {
    return {
      ...base,
      name,
      label: 'Terapkan tampilan lebih tenang',
      description: 'Mengubah preferensi tampilan pada sesi demo lokal dan dapat dikembalikan kapan saja.',
      arguments: {
        easyRead: args.easyRead !== false,
        textScale: args.textScale === 'sangat-besar' ? 'sangat-besar' : 'besar',
        reducedMotion: args.reducedMotion !== false,
      },
    }
  }

  if (name === 'open_support') {
    const destination = ['pendamping', 'pusat-bantuan', 'safe-exit'].includes(String(args.destination))
      ? args.destination as 'pendamping' | 'pusat-bantuan' | 'safe-exit'
      : 'pusat-bantuan'
    const supportCopy = {
      pendamping: {
        label: 'Buka daftar pendamping',
        description: 'Membuka pendamping sintetis. Tidak ada pesan atau data yang dikirim.',
      },
      'pusat-bantuan': {
        label: 'Buka Pusat Bantuan',
        description: 'Membuka direktori bantuan simulasi. Untuk bahaya langsung, hubungi bantuan manusia yang tersedia di wilayahmu.',
      },
      'safe-exit': {
        label: 'Alihkan ke halaman netral',
        description: 'Mengganti tampilan dengan halaman keluar cepat tanpa mengirim data.',
      },
    } as const
    return {
      ...base,
      name,
      ...supportCopy[destination],
      arguments: { destination },
    }
  }

  return null
}

export function validateChatResponse(
  value: unknown,
  mode: ChatAssistantResponse['mode'],
): ChatAssistantResponse {
  if (!value || typeof value !== 'object') throw new Error('Respons asisten bukan objek.')
  const input = value as Record<string, unknown>

  if (typeof input.reply !== 'string' || !input.reply.trim()) {
    throw new Error('Respons asisten tidak memiliki jawaban.')
  }

  const safetyLevel = String(input.safetyLevel)
  if (!['normal', 'sensitive', 'urgent'].includes(safetyLevel)) {
    throw new Error('Respons asisten memiliki tingkat keselamatan yang tidak valid.')
  }

  const suggestedActions = Array.isArray(input.suggestedActions)
    ? input.suggestedActions
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map((item) => ({
          label: typeof item.label === 'string' ? item.label.trim().slice(0, 60) : '',
          route: typeof item.route === 'string' ? item.route : '',
        }))
        .filter((item) => item.label && ALLOWED_ROUTES.has(item.route))
        .slice(0, 3)
    : []

  const toolCalls = Array.isArray(input.toolCalls)
    ? input.toolCalls
        .map((item, index) => sanitizeToolCall(item, index))
        .filter((item): item is ChatToolCall => Boolean(item))
        .filter((item) => safetyLevel !== 'urgent' || item.name === 'open_support')
        .slice(0, 2)
    : []

  return {
    reply: input.reply.trim().slice(0, 1800),
    suggestedActions,
    toolCalls,
    safetyLevel: safetyLevel as ChatSafetyLevel,
    disclaimer: DISCLAIMER,
    mode,
  }
}

export async function requestChatReply(
  message: string,
  history: ChatHistoryItem[],
): Promise<ChatAssistantResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.slice(0, 1600),
        history: history.slice(-12).map((item) => ({
          role: item.role,
          content: item.content.slice(0, 1600),
        })),
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

    return validateChatResponse(payload, mode)
  } catch {
    return createDeterministicChatReply(message)
  }
}
