import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition duration-200 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        variant === 'primary' &&
          'bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-900/20 ring-1 ring-inset ring-white/20 hover:from-teal-700 hover:to-teal-800 hover:shadow-teal-900/30',
        variant === 'secondary' && 'border border-teal-200/80 bg-white text-teal-900 shadow-sm shadow-teal-950/5 hover:border-teal-300 hover:bg-teal-50',
        variant === 'ghost' && 'text-slate-700 hover:bg-slate-900/5',
        variant === 'danger' && 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
        size === 'sm' && 'h-9 px-3 text-sm',
        size === 'md' && 'h-11 px-4 text-sm',
        size === 'lg' && 'h-13 px-5 text-base',
        size === 'icon' && 'size-10 p-0',
        className,
      )}
      {...props}
    />
  )
}

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'rounded-[1.5rem] border border-slate-900/6 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function Badge({
  children,
  className,
  tone = 'teal',
}: {
  children: ReactNode
  className?: string
  tone?: 'teal' | 'purple' | 'rose' | 'slate' | 'green'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
        tone === 'teal' && 'border-teal-200 bg-teal-50 text-teal-800',
        tone === 'purple' && 'border-violet-200 bg-violet-50 text-violet-800',
        tone === 'rose' && 'border-rose-200 bg-rose-50 text-rose-700',
        tone === 'slate' && 'border-slate-200 bg-slate-50 text-slate-700',
        tone === 'green' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100',
        className,
      )}
      {...props}
    />
  )
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-slate-100', className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-violet-500" style={{ width: `${value}%` }} />
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-teal-200 hover:bg-teal-50/50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
    >
      <span>{label}</span>
      <span className={cn('flex h-7 w-12 items-center rounded-full p-1 transition', checked ? 'bg-teal-700' : 'bg-slate-200')}>
        <span className={cn('size-5 rounded-full bg-white shadow transition', checked && 'translate-x-5')} />
      </span>
    </button>
  )
}

export function Dialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4">
          <h2 id="dialog-title" className="text-xl font-bold text-slate-950">
            {title}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
