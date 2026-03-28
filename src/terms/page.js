"use client"
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Terms of Service — NebulaSEO',
}

export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: `By accessing or using NebulaSEO ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. NebulaSEO reserves the right to modify these Terms at any time, and such modifications shall be effective immediately upon posting.`
    },
    {
      title: '2. Description of Service',
      body: `NebulaSEO provides an AI-powered local SEO platform that includes Google Business Profile management, automated content generation, review management, rank tracking, citation building, and related digital marketing services. The Service is available on a subscription basis through plans described on our pricing page.`
    },
    {
      title: '3. Account Registration',
      body: `To use the Service, you must create an account using a valid Google account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at info@nebulaseo.com of any unauthorized use of your account. You must be at least 18 years of age to use the Service.`
    },
    {
      title: '4. Subscription and Billing',
      body: `NebulaSEO offers subscription plans billed on a monthly or annual basis. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel. All fees are non-refundable except as required by law. We reserve the right to change our pricing at any time with 30 days notice. If you cancel your subscription, you will retain access to the Service until the end of your current billing period.`
    },
    {
      title: '5. Free Trial',
      body: `We may offer a free trial period for new subscribers. At the end of the trial period, you will be automatically charged for the selected subscription plan unless you cancel before the trial ends. We reserve the right to modify or discontinue free trial offers at any time.`
    },
    {
      title: '6. Google Business Profile Integration',
      body: `By connecting your Google Business Profile to NebulaSEO, you grant us permission to access, read, and modify your Google Business Profile data on your behalf. You represent that you have the legal authority to grant such access. You are solely responsible for the accuracy and legality of any content published to your Google Business Profile through our Service. NebulaSEO is not responsible for any penalties, suspensions, or actions taken by Google against your Business Profile.`
    },
    {
      title: '7. AI-Generated Content',
      body: `NebulaSEO uses artificial intelligence to generate content including Google Business Profile posts, review responses, and other marketing materials. You are responsible for reviewing and approving all AI-generated content before publication. By using our automated posting features, you authorize NebulaSEO to publish content on your behalf. We do not guarantee that AI-generated content will be accurate, appropriate, or achieve specific business results.`
    },
    {
      title: '8. Acceptable Use',
      body: `You agree not to use the Service to publish false, misleading, or deceptive content; violate any applicable laws or regulations; infringe on the intellectual property rights of others; send spam or unsolicited communications; attempt to gain unauthorized access to our systems; or interfere with the proper functioning of the Service. We reserve the right to suspend or terminate accounts that violate these terms.`
    },
    {
      title: '9. Intellectual Property',
      body: `NebulaSEO and its original content, features, and functionality are owned by NebulaSEO and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of any content you provide to the Service. By submitting content, you grant NebulaSEO a non-exclusive, worldwide license to use, reproduce, and display such content solely for the purpose of providing the Service.`
    },
    {
      title: '10. Disclaimer of Warranties',
      body: `The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. NebulaSEO does not warrant that the Service will be uninterrupted, error-free, or free of viruses. We do not guarantee any specific results from using our SEO services, including but not limited to search engine rankings, website traffic, or business revenue.`
    },
    {
      title: '11. Limitation of Liability',
      body: `To the maximum extent permitted by law, NebulaSEO shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability to you for any claims arising from these Terms or your use of the Service shall not exceed the amount you paid to NebulaSEO in the twelve months preceding the claim.`
    },
    {
      title: '12. Indemnification',
      body: `You agree to indemnify and hold harmless NebulaSEO and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.`
    },
    {
      title: '13. Termination',
      body: `We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service will immediately cease.`
    },
    {
      title: '14. Governing Law',
      body: `These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in the United States.`
    },
    {
      title: '15. Contact Us',
      body: `If you have any questions about these Terms of Service, please contact us at info@nebulaseo.com.`
    },
  ]

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '140px 40px 100px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Terms of Service</h1>
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
