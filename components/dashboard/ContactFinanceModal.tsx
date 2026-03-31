'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { sendContactEmail } from '@/app/actions/contact'
import { X, Mail, Send, CheckCircle2 } from 'lucide-react'

export default function ContactFinanceModal() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(sendContactEmail, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      setTimeout(() => setOpen(false), 2000)
    }
  }, [state])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-zinc-100"
        style={{ background: '#fff', color: '#000' }}
      >
        <Mail size={14} /> Contact Finance
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Contact Finance Team</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>We'll get back to you shortly</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-all" style={{ color: 'var(--muted)' }}>
                <X size={16} />
              </button>
            </div>

            {state?.success ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <CheckCircle2 size={40} style={{ color: '#16A34A' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Email sent successfully!</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>The finance team will respond soon.</p>
              </div>
            ) : (
              <form ref={formRef} action={action} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>To</label>
                  <input
                    type="email"
                    name="to"
                    required
                    placeholder="e.g. finance@bitespeed.co"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="e.g. Invoice query, Payment extension request"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe your query in detail..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all resize-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>

                {state?.error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid #FECACA' }}>
                    {state.error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                    style={{ background: '#6366F1', color: '#fff' }}
                  >
                    {pending ? 'Sending…' : <><Send size={14} /> Send Email</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
