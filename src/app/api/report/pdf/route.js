import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// chromium-min requires a remote URL for the binary
// This is the v143 pack matching our installed version
const CHROMIUM_REMOTE_URL = 'https://github.com/Sparticuz/chromium/releases/download/v143.0.0/chromium-v143.0.0-pack.x64.tar'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const auditId = searchParams.get('auditId')
  if (!auditId) return NextResponse.json({ error: 'auditId required' }, { status: 400 })

  const audit = await prisma.rankAudit.findFirst({
    where: { id: auditId, business: { userId: session.user.id } },
  })
  if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const chromium = (await import('@sparticuz/chromium-min')).default
    const puppeteer = (await import('puppeteer-core')).default

    chromium.setHeadlessMode = true
    chromium.setGraphicsMode = false

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 900 },
      executablePath: await chromium.executablePath(CHROMIUM_REMOTE_URL),
      headless: true,
    })

    const page = await browser.newPage()

    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.nebulaseo.com'
    
    // Set auth header instead of cookies
    await page.setExtraHTTPHeaders({
      'x-internal-secret': process.env.NEXTAUTH_SECRET || '',
    })

    await page.goto(`${baseUrl}/report/${auditId}?secret=${encodeURIComponent(process.env.NEXTAUTH_SECRET || '')}`, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    })

    await new Promise(r => setTimeout(r, 3000))

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    })

    await browser.close()

    const date = new Date().toISOString().split('T')[0]

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="seo-report-${date}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
