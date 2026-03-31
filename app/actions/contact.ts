'use server'

import { Resend } from 'resend'
import { getSession } from '@/lib/session'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(prevState: { success?: boolean; error?: string } | null, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'brand') return { error: 'Unauthorized' }

  const subject = formData.get('subject')?.toString().trim() ?? ''
  const message = formData.get('message')?.toString().trim() ?? ''

  if (!subject || !message) return { error: 'Please fill in all fields.' }

  try {
    await resend.emails.send({
      from: 'BitSpeed Finance Portal <onboarding@resend.dev>',
      to: 'finance@bitespeed.co',
      replyTo: session.brand ?? undefined,
      subject: `[${session.brand}] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D1B3E;">Message from Brand Portal</h2>
          <table style="width:100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 6px 0; color: #6B7280; font-size: 13px;">From</td><td style="padding: 6px 0; font-size: 13px;"><strong>${session.name}</strong> (${session.brand})</td></tr>
            <tr><td style="padding: 6px 0; color: #6B7280; font-size: 13px;">Subject</td><td style="padding: 6px 0; font-size: 13px;">${subject}</td></tr>
          </table>
          <div style="background: #F8F8FC; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #1F2937; white-space: pre-wrap;">${message}</div>
          <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px;">Sent via BitSpeed Finance Portal</p>
        </div>
      `,
    })
    return { success: true }
  } catch {
    return { error: 'Failed to send email. Please try again.' }
  }
}
