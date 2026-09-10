import './globals.css'

export const metadata = {
  title: 'ScoutIQ — Social Intelligence',
  description: 'AI-powered social intelligence and competitor analysis.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
