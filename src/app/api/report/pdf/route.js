import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const auditId = searchParams.get('auditId')
  const whitelabel = searchParams.get('wl') === '1'
  const agency = searchParams.get('agency') || ''

  if (!auditId) return NextResponse.json({ error: 'auditId required' }, { status: 400 })

  // Verify audit belongs to user
  const audit = await prisma.rankAudit.findFirst({
    where: { id: auditId, business: { userId: session.user.id } },
  })
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 })

  try {
    let chromium, puppeteer

    if (process.env.NODE_ENV === 'production') {
      chromium = (await import('@sparticuz/chromium')).default
      puppeteer = (await import('puppeteer-core')).default
    } else {
      puppeteer = (await import('puppeteer')).default
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.nebulaseo.com'
    const reportUrl = `${baseUrl}/dashboard/report/${auditId}?wl=${whitelabel ? '1' : '0'}&agency=${encodeURIComponent(agency)}`

    let browser
    if (process.env.NODE_ENV === 'production') {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      })
    } else {
      browser = await puppeteer.launch({ headless: true })
    }

    const page = await browser.newPage()

    // Pass session cookie so the report page can authenticate
    const cookies = req.headers.get('cookie') || ''
    if (cookies) {
      const cookieArray = cookies.split(';').map(c => {
        const [name, ...rest] = c.trim().split('=')
        return { name: name.trim(), value: rest.join('='), domain: new URL(baseUrl).hostname }
      }).filter(c => c.name && c.value)
      if (cookieArray.length > 0) await page.setCookie(...cookieArray)
    }

    await page.goto(reportUrl, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.waitForTimeout(2000) // wait for map tiles to load

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    await browser.close()

    const businessName = audit.keyword.replace(/[^a-zA-Z0-9]/g, '-')
    const date = new Date(audit.createdAt).toISOString().split('T')[0]

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="seo-report-${businessName}-${date}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed', details: err.message }, { status: 500 })
  }
}
