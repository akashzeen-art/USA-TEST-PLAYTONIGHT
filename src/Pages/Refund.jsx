import LegalPageLayout, { LegalH2, LegalUl, LegalContact, LegalSiteLink } from '../components/legal/LegalPageLayout'
import { LEGAL_COMPANY } from '../components/legal/legalConstants'

export default function Refund() {
  return (
    <LegalPageLayout
      title="Refund & Cancellation Policy"
      intro={
        <>
          This Refund & Cancellation Policy applies to all purchases made through <LegalSiteLink />,
          managed by {LEGAL_COMPANY}. Please read it carefully before placing an order.
        </>
      }
    >
      <div>
        <LegalH2 num={1}>Order Cancellation</LegalH2>
        <LegalUl
          items={[
            'Orders can be cancelled within 24 hours of placing the order, provided the order has not already been processed or shipped.',
            'To request cancellation, contact us immediately at bd@zeenmediconnect.com / +91 124 4477054 with your order details.',
            'Once an order is shipped, it cannot be cancelled.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={2}>Refund Eligibility</LegalH2>
        <p className="mt-3 mb-2">Refunds are applicable only under the following conditions:</p>
        <LegalUl
          items={[
            'You received a wrong product that does not match your order.',
            'The product was damaged during delivery (requires proof such as photos at the time of delivery).',
            'The product is expired or defective upon arrival.',
            'Note: Refunds are not applicable for opened, used, or partially consumed products.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={3}>Refund Process</LegalH2>
        <LegalUl
          items={[
            'To initiate a refund, you must notify us within 2 days of receiving the product.',
            'Once your request is verified and approved, refunds will be processed within 7–10 working days.',
            'In some cases, you may be asked to return the product before a refund is issued.',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={4}>Non-Refundable Items</LegalH2>
        <p className="mt-3 mb-2">We do not accept returns or issue refunds for:</p>
        <LegalUl
          items={[
            'Opened or partially used herbal products.',
            'Products purchased during promotional sales or discounts.',
            'Digital or downloadable content (if applicable).',
          ]}
        />
      </div>
      <div>
        <LegalH2 num={5}>Shipping & Return Costs</LegalH2>
        <LegalUl
          items={[
            'If the return is due to our error, we will bear the return shipping charges.',
            'If the return is due to customer reasons, the customer must bear the return shipping cost.',
          ]}
        />
      </div>
      <LegalContact address="417, 4th Floor, Tower A1, Spaze i Tech Park, Sohna Road, Gurgaon, 122018, India" />
    </LegalPageLayout>
  )
}
