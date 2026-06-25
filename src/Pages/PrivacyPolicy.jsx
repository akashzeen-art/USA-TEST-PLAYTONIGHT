import LegalPageLayout, { LegalH2, LegalUl, LegalContact, LegalSiteLink } from '../components/legal/LegalPageLayout'
import { LEGAL_ADDRESS_PRIVACY, LEGAL_COMPANY } from '../components/legal/legalConstants'

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      intro={
        <>
          This Privacy Policy describes how {LEGAL_COMPANY} collects, uses, stores, and protects your
          personal information when you use <LegalSiteLink />. By accessing our Website, you agree to
          the terms of this Privacy Policy.
        </>
      }
    >
      <div>
        <LegalH2 num={1}>Information We Collect</LegalH2>
        <LegalUl
          items={[
            'Personal Information: Name, email address, phone number, billing/shipping address, and payment details.',
            'Non-Personal Information: Browser type, device details, IP address, cookies, and usage data.',
            'Voluntary Submissions: Information you provide through forms, surveys, or direct communication.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={2}>How We Use Your Information</LegalH2>
        <LegalUl
          items={[
            'Processing and fulfilling your orders.',
            'Providing customer support and responding to inquiries.',
            'Sending updates, promotions, or service-related communications (if you opt-in).',
            'Improving our Website functionality, user experience, and services.',
            'Legal and security purposes, such as fraud prevention.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={3}>Sharing of Information</LegalH2>
        <LegalUl
          items={[
            'Service Providers: Trusted third parties who assist in running our services.',
            'Legal Requirements: Authorities, if required by law, regulation, or legal process.',
            'Business Transfers: In the event of a merger or acquisition, your data may be transferred.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={4}>Cookies & Tracking Technologies</LegalH2>
        <LegalUl
          items={[
            'Enhance user experience.',
            'Track website traffic and performance.',
            'Store user preferences.',
            'You can adjust your browser settings to decline cookies.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={5}>Data Security</LegalH2>
        <LegalUl
          items={[
            'We implement appropriate technical and organizational measures to protect your personal information.',
            'However, no method of online transmission or storage is 100% secure.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={6}>Data Retention</LegalH2>
        <p className="mt-3">
          We retain your personal information only as long as necessary to provide services and comply
          with legal obligations.
        </p>
      </div>
      <div>
        <LegalH2 num={7}>Your Rights</LegalH2>
        <LegalUl
          items={[
            'Access, update, or correct your personal information.',
            'Request deletion of your personal data.',
            'Withdraw consent for marketing communications.',
            'To exercise these rights, contact us at bd@zeenmediconnect.com.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={8}>Third-Party Links</LegalH2>
        <LegalUl
          items={[
            'Our Website may contain links to third-party websites.',
            'We are not responsible for the privacy practices or content of those external sites.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={9}>Children&apos;s Privacy</LegalH2>
        <LegalUl
          items={[
            'Our Website and services are not intended for children under 18 years of age.',
            'We do not knowingly collect personal information from minors.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={10}>Changes to this Privacy Policy</LegalH2>
        <LegalUl
          items={[
            'We may update this Privacy Policy from time to time.',
            'Continued use of our Website after changes indicates your acceptance of the revised policy.',
          ]}
        />
      </div>
      <LegalContact address={LEGAL_ADDRESS_PRIVACY} />
    </LegalPageLayout>
  )
}
