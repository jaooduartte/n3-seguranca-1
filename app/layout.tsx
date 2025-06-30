import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'N3 Seguranca',
  description: 'Projeto de Segurança da Informação',
  generator: 'N3 Seguranca',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
