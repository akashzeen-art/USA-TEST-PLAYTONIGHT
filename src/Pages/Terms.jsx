import LegalPageLayout, { LegalH2, LegalUl, LegalContact, LegalSiteLink } from '../components/legal/LegalPageLayout'
import { LEGAL_COMPANY } from '../components/legal/legalConstants'

export default function Terms() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      intro={
        <>
          Welcome to <LegalSiteLink />, managed by {LEGAL_COMPANY}. By accessing or using this
          website, you agree to the following Terms & Conditions. We reserve the right to revise these
          terms at any time without prior notice.
        </>
      }
    >
      <div>
        <LegalH2 num={1}>Medical Disclaimer</LegalH2>
        <LegalUl
          items={[
            'The content on this website is for general informational and educational purposes only.',
            'The Company does not provide medical advice, diagnosis, or treatment.',
            'Always consult a qualified healthcare professional before starting any herbal or medical treatment.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={2}>Personal Information</LegalH2>
        <LegalUl
          items={[
            'We may collect personal information voluntarily for registration, order delivery, shipment tracking, and updates.',
            'By providing this data, you consent to its collection and use in accordance with our Privacy Policy.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={3}>Intellectual Property / Copyright</LegalH2>
        <LegalUl
          items={[
            'All content is the property of Zeen Mediconnect OPC Pvt. Ltd.',
            'Content may only be downloaded for personal, non-commercial use.',
            'Reproduction or distribution without prior written consent is prohibited.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={4}>No Warranty & Limitation of Liability</LegalH2>
        <LegalUl
          items={[
            'This website is provided "AS IS" without warranties of any kind.',
            'The Company shall not be liable for any direct, indirect, or consequential damages.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={5}>General Terms</LegalH2>
        <LegalUl
          items={[
            'The website is operated from India. Access outside India is at your own responsibility.',
            'Users are responsible for compliance with their local laws.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={6}>Jurisdiction</LegalH2>
        <LegalUl
          items={[
            'All disputes shall be subject to the exclusive jurisdiction of the courts of Gurugram, Haryana, India.',
            'These Terms & Conditions are governed by the laws of India.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={7}>Severability</LegalH2>
        <p className="mt-3">
          If any provision is found invalid or unenforceable, the remaining provisions remain in full
          force.
        </p>
      </div>
      <div>
        <LegalH2 num={8}>User Responsibilities</LegalH2>
        <LegalUl
          items={[
            'Do not misuse or attempt unauthorized access to the website.',
            'Do not use the website for unlawful or fraudulent purposes.',
            'Comply with all applicable laws while using the website.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={9}>Third-Party Links</LegalH2>
        <LegalUl
          items={[
            'This website may contain links to third-party sites.',
            'We are not responsible for their content, policies, or practices.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={10}>Entire Agreement</LegalH2>
        <p className="mt-3">
          These Terms & Conditions, along with our Privacy Policy, constitute the complete agreement
          between you and Zeen Mediconnect OPC Pvt. Ltd.
        </p>
      </div>
      <LegalContact address="417, 4th Floor, Tower A1, Spaze i Tech Park, Sohna Road, Gurgaon, 122018, India" />
    </LegalPageLayout>
  )
}
