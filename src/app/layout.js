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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.$crisp=[];
              window.CRISP_WEBSITE_ID="d44fba33-3cd1-452e-a1a6-f88b0c2b5d3c";
              (function(){
                var d=document;
                var s=d.createElement("script");
                s.src="https://client.crisp.chat/l.js";
                s.async=1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            `
          }}
        />
      </body>
    </html>
  )
}
