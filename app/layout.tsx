import type { Metadata } from 'next'
import { Geist, DM_Sans, Syne, Syne_Mono } from 'next/font/google'
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

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const syneMono = Syne_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-syne-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BitSpeed Finance',
  description: 'Internal finance dashboard for BitSpeed',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${dmSans.variable} ${syne.variable} ${syneMono.variable}`}>
      <body className="font-[family-name:var(--font-geist)] min-h-screen">
        {children}
      </body>
    </html>
  )
}
