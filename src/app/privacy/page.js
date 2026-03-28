"use client"
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'


export default function Privacy() {
  const sections = [
    {
      title: '1. Introduction',
      body: `NebulaSEO ("we," "our," or "us") operates the website nebulaseo.com and provides AI-powered local SEO services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. By using NebulaSEO, you agree to the collection and use of information in accordance with this policy.`
    },
    {
      title: '2. Information We Collect',
      body: `We collect information you provide directly to us, including your name, email address, agency name, and billing information when you register for an account. We also collect information through your Google account when you connect via Google OAuth, including your Google profile information and, with your explicit permission, access to your Google Business Profile data. We automatically collect certain technical information including IP addresses, browser type, device information, and usage data when you use our platform.`
    },
    {
      title: '3. Google Business Profile Data',
      body: `When you connect your Google Business Profile to NebulaSEO, we access your business listing information, posts, reviews, and analytics data solely to provide our SEO optimization services. We use Google's official APIs and comply with Google's API Services User Data Policy. We do not sell your Google Business Profile data to third parties. You may revoke NebulaSEO's access to your Google account at any time through your Google Account settings at myaccount.google.com.`
    },
    {
      title: '4. How We Use Your Information',
      body: `We use the information we collect to provide, maintain, and improve our services; process transactions and send related information; send technical notices and support messages; respond to your comments and questions; and send marketing communications (which you may opt out of at any time). We use your Google Business Profile data exclusively to deliver the SEO optimization features you have requested, including automated posting, review management, and rank tracking.`
    },
    {
      title: '5. Information Sharing',
      body: `We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform, including our hosting provider (Vercel), database provider (Railway), and payment processor (Stripe). These parties agree to keep this information confidential. We may also disclose your information when required by law or to protect our rights.`
    },
    {
      title: '6. Data Security',
      body: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is transmitted over HTTPS. Payment information is processed by Stripe and we do not store credit card details on our servers. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
    },
    {
      title: '7. Data Retention',
      body: `We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or business purposes.`
    },
    {
      title: '8. Your Rights',
      body: `You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data or ask us to restrict processing of your data by contacting us at info@nebulaseo.com. If you are located in the European Union, you have additional rights under GDPR including the right to data portability and the right to lodge a complaint with a supervisory authority.`
    },
    {
      title: '9. Cookies',
      body: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information. We use session cookies to operate our service and preference cookies to remember your settings. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. If you do not accept cookies, some portions of our platform may not function properly.`
    },
    {
      title: '10. Third-Party Services',
      body: `Our platform integrates with third-party services including Google APIs, Stripe for payments, and Anthropic for AI-powered content generation. These third parties have their own privacy policies, and we encourage you to review them. NebulaSEO's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.`
    },
    {
      title: "11. Children's Privacy",
      body: `NebulaSEO is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us at info@nebulaseo.com and we will take steps to delete such information.`
    },
    {
      title: '12. Changes to This Policy',
      body: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.`
    },
    {
      title: '13. Contact Us',
      body: `If you have any questions about this Privacy Policy, please contact us at info@nebulaseo.com.`
    },
  ]

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '140px 40px 100px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 48 }}>Last updated: March 28, 2026</p>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--nebula-blue)' }}>{s.title}</h2>
            <p style={{ fontSize: 15, color: 'rgba(232,238,255,0.75)', lineHeight: 1.8, fontWeight: 300 }}>{s.body}</p>
          </div>
        ))}
      </main>
      <Footer />
    </>
  )
}
