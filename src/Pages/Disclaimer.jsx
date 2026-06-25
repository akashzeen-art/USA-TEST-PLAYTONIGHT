import LegalPageLayout, { LegalH2, LegalUl, LegalContact, LegalSiteLink } from '../components/legal/LegalPageLayout'
import { LEGAL_COMPANY } from '../components/legal/legalConstants'

export default function Disclaimer() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      intro={
        <>
          The information below applies to <LegalSiteLink /> and the Company — {LEGAL_COMPANY}. The
          information provided is for general informational and educational purposes only.
        </>
      }
    >
      <div>
        <LegalH2 num={1}>No Medical Advice</LegalH2>
        <LegalUl
          items={[
            'The content on this Website is not a substitute for professional medical advice, diagnosis, or treatment.',
            'Always consult a qualified healthcare professional before starting any herbal or dietary supplement regimen.',
            'Never disregard or delay seeking medical advice because of something you read on this Website.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={2}>Product Disclaimer</LegalH2>
        <LegalUl
          items={[
            'Our products are based on traditional herbal practices. Results may vary from person to person.',
            'The Company does not claim to diagnose, treat, cure, or prevent any disease.',
            'Statements regarding our products have not been evaluated by medical authorities unless explicitly stated.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={3}>Accuracy of Information</LegalH2>
        <LegalUl
          items={[
            'While we strive to keep information accurate and up to date, we make no representations or warranties regarding completeness, accuracy, or reliability.',
            'Any reliance you place on the information is strictly at your own risk.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={4}>External Links</LegalH2>
        <LegalUl
          items={[
            'This Website may include links to third-party websites for informational purposes.',
            'We are not responsible for the content, accuracy, or practices of external sites.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={5}>Limitation of Liability</LegalH2>
        <LegalUl
          items={[
            'To the fullest extent permitted by law, the Company shall not be held liable for any loss, injury, or damage arising from use of Website content, use of our products, or inability to access the Website.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={6}>User Responsibility</LegalH2>
        <LegalUl
          items={[
            'By using this Website, you acknowledge that you are solely responsible for your health decisions.',
            'You agree that the Company shall not be held liable for your personal choices or outcomes.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={7}>Consent</LegalH2>
        <p className="mt-3">
          By accessing and using this Website, you consent to this Disclaimer and agree to all its
          terms.
        </p>
      </div>
      <LegalContact address="417, 4th Floor, Tower A1, Spaze i Tech Park, Sohna Road, Gurgaon, 122018, India" />
    </LegalPageLayout>
  )
}
