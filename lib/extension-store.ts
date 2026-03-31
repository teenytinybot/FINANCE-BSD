import type { ExtensionRequest } from './mock-data'

// ── In-memory store ──────────────────────────────────────────────────────────
// Persists within the Node.js process lifetime (survives page navigations,
// resets on dev server restart — good enough for a mock app).

// New requests submitted by brands during this session
const submissions: ExtensionRequest[] = []

// Resolutions (approve / reject) for any request id — covers both static
// mock data and new brand submissions
const resolutions = new Map<string, {
  status:     'approved' | 'rejected'
  resolvedNote: string
  resolvedAt:   string
}>()

export function getSubmissions(): ExtensionRequest[] {
  return submissions.map(s => {
    const res = resolutions.get(s.id)
    return res ? { ...s, ...res } : s
  })
}

export function addSubmission(req: ExtensionRequest): void {
  // Prevent duplicates (same brand + invoice already in store)
  const exists = submissions.some(s => s.invoiceNumber === req.invoiceNumber && s.brand === req.brand)
  if (!exists) submissions.unshift(req)
}

export function applyResolution(
  id: string,
  status: 'approved' | 'rejected',
  resolvedNote: string,
  resolvedAt: string,
): void {
  resolutions.set(id, { status, resolvedNote, resolvedAt })
}

export function getResolution(id: string) {
  return resolutions.get(id)
}
