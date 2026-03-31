'use server'

import { revalidatePath } from 'next/cache'
import { addSubmission, applyResolution } from '@/lib/extension-store'
import { brandPlans } from '@/lib/mock-data'

export async function submitExtensionRequest(data: {
  brand:           string
  invoiceNumber:   string
  invoiceAmount:   number
  originalDueDate: string
  requestedDate:   string
  reason:          string
}) {
  const plan = brandPlans.find(p => p.brand === data.brand)

  addSubmission({
    id:              `ext-live-${Date.now()}`,
    brand:           data.brand,
    shopifyUrl:      plan?.shopifyUrl ?? '',
    invoiceNumber:   data.invoiceNumber,
    invoiceAmount:   data.invoiceAmount,
    originalDueDate: data.originalDueDate,
    requestedDate:   data.requestedDate,
    reason:          data.reason,
    status:          'pending',
    requestedAt:     new Date().toISOString().split('T')[0],
  })

  revalidatePath('/dashboard/notifications')
  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/billing')
}

export async function resolveExtension(
  id:     string,
  status: 'approved' | 'rejected',
  note:   string,
) {
  applyResolution(id, status, note, new Date().toISOString().split('T')[0])

  revalidatePath('/dashboard/notifications')
  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/billing')
}
