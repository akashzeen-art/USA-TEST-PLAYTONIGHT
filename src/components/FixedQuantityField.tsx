import { FIXED_PACK_QUANTITY, FIXED_PACK_LABEL } from '../constants/doublePack'

type FixedQuantityVariant = 'default' | 'popup'

interface FixedQuantityFieldProps {
  idPrefix?: string
  variant?: FixedQuantityVariant
}

/** Read-only quantity — always 2 for International Double pack only (no +/- controls). */
export default function FixedQuantityField({ idPrefix = '', variant = 'default' }: FixedQuantityFieldProps) {
  const inputId = `${idPrefix}quantity`
  const isPopup = variant === 'popup'

  return (
    <div>
      <div className={`fixed-quantity-display ${isPopup ? 'fixed-quantity-display--popup' : ''}`}>
        <input
          type="number"
          id={inputId}
          name="quantity"
          value={FIXED_PACK_QUANTITY}
          readOnly
          className="fixed-quantity-input"
          min={FIXED_PACK_QUANTITY}
          max={FIXED_PACK_QUANTITY}
          aria-label={`Quantity: ${FIXED_PACK_QUANTITY}`}
        />
      </div>
      <p className="mt-1" style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>
        {FIXED_PACK_LABEL}
      </p>
    </div>
  )
}
