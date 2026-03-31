import type { Metadata } from 'next'
import { Geist, DM_Sans } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BitSpeed Finance',
  description: 'Internal finance dashboard for BitSpeed',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${dmSans.variable}`}>
      <body className="font-[family-name:var(--font-geist)] min-h-screen">
        {children}
      </body>
    </html>
  )
}
