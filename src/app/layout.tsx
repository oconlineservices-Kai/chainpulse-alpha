export const metadata = {
  title: 'ChainPulse Alpha',
  description: 'AI-powered crypto alpha signals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
