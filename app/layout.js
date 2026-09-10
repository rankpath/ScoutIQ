import './globals.css'
import CopyPatch from './CopyPatch'

export const metadata = {
  title: 'ScoutIQ — Social Intelligence',
  description: 'AI-powered social intelligence and competitor analysis.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CopyPatch />
      </body>
    </html>
  )
}
