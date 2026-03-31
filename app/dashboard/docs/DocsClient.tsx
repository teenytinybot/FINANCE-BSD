'use client'

import { useState } from 'react'
import { Upload, CheckCircle2, FileText, AlertTriangle, X, Download, Eye } from 'lucide-react'

const DOC_TYPES = [
  { id: 'gst',    label: 'GST Certificate',              required: true,  description: 'Valid GST registration certificate issued by the government' },
  { id: 'pan',    label: 'PAN Card',                     required: true,  description: 'Company PAN card copy — must match legal entity name' },
  { id: 'coi',    label: 'Certificate of Incorporation', required: true,  description: 'Issued by Ministry of Corporate Affairs (MCA)' },
  { id: 'cancel', label: 'Cancelled Cheque',             required: true,  description: 'For bank account verification — account name must match' },
  { id: 'msme',   label: 'MSME / Udyam Certificate',     required: false, description: 'Udyam registration certificate (if applicable)' },
]

interface UploadedDoc {
  file: File
  uploadedAt: string
}

export default function DocsClient() {
  const [docs, setDocs] = useState<Record<string, UploadedDoc>>({})

  const requiredDone  = DOC_TYPES.filter(d => d.required && docs[d.id]).length
  const requiredTotal = DOC_TYPES.filter(d => d.required).length
  const allDone       = requiredDone === requiredTotal

  function upload(id: string, file: File) {
    setDocs(prev => ({ ...prev, [id]: { file, uploadedAt: new Date().toLocaleString() } }))
  }

  function remove(id: string) {
    setDocs(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  return (
    <div className="p-7 max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Company Documents</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Upload and manage company verification documents
        </p>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
            {allDone ? 'All required documents uploaded' : `${requiredDone} of ${requiredTotal} required documents uploaded`}
          </p>
          {allDone && <span className="badge-paid px-2.5 py-0.5 rounded-full text-xs font-medium">Complete</span>}
        </div>
        <div className="w-full rounded-full h-1.5" style={{ background: 'var(--border)' }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${(requiredDone / requiredTotal) * 100}%`, background: allDone ? 'var(--green)' : 'var(--violet)' }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--subtle)' }}>
          {DOC_TYPES.filter(d => d.required && !docs[d.id]).length > 0
            ? `${DOC_TYPES.filter(d => d.required && !docs[d.id]).map(d => d.label).join(', ')} still needed`
            : 'Optional: MSME certificate can be added if applicable'}
        </p>
      </div>

      {/* Warning */}
      {!allDone && (
        <div className="mb-5 px-4 py-3.5 rounded-xl flex items-start gap-3" style={{ background: 'var(--amber-bg)', border: '1px solid #FDE68A' }}>
          <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--amber)' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
            All <strong>Required</strong> documents must be uploaded before vendor registration can be completed.
            Documents are stored securely — accessible only to the BitSpeed finance team.
          </p>
        </div>
      )}

      {/* Doc list */}
      <div className="space-y-3 mb-6">
        {DOC_TYPES.map(doc => {
          const uploaded = docs[doc.id]
          return (
            <div
              key={doc.id}
              className="rounded-xl p-5"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${uploaded ? '#BBF7D0' : 'var(--border)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: uploaded ? 'var(--green-bg)' : '#F5F4F3' }}
                  >
                    {uploaded
                      ? <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
                      : <FileText size={16} style={{ color: 'var(--muted)' }} />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{doc.label}</p>
                      {doc.required
                        ? <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Required</span>
                        : <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: '#F5F4F3', color: 'var(--muted)' }}>Optional</span>
                      }
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{doc.description}</p>
                    {uploaded && (
                      <div className="mt-1.5 flex items-center gap-3">
                        <p className="text-xs font-medium truncate max-w-[200px]" style={{ color: 'var(--green)' }}>
                          ✓ {uploaded.file.name}
                        </p>
                        <p className="text-xs shrink-0" style={{ color: 'var(--subtle)' }}>{uploaded.uploadedAt}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {uploaded && (
                    <>
                      <button
                        title="Preview"
                        className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                        style={{ color: 'var(--muted)' }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        title="Download"
                        className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                        style={{ color: 'var(--muted)' }}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        title="Remove"
                        onClick={() => remove(doc.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        style={{ color: 'var(--red)' }}
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) upload(doc.id, file)
                        e.target.value = ''
                      }}
                    />
                    <span
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                      style={{
                        background: uploaded ? 'var(--surface)' : 'var(--violet)',
                        color:      uploaded ? 'var(--muted)'  : '#fff',
                        border:     uploaded ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <Upload size={12} /> {uploaded ? 'Replace' : 'Upload'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--subtle)' }}>
          Accepted formats: PDF, JPG, PNG · Max 10MB per file
        </p>
        <button
          disabled={!allDone}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 transition-all"
          style={{ background: 'var(--violet)', color: '#fff' }}
        >
          Submit for Verification
        </button>
      </div>
    </div>
  )
}
