import '../styles/globals.css'
import Providers from '../components/Providers'

export const metadata = {
  title: 'NebulaSEO — Rank at the Speed of Light',
  description: 'AI-powered local SEO platform. Dominate local search with automated GBP optimization, AI content, and real-time rank tracking.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Syne:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
