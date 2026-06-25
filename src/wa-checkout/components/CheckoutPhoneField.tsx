import React, { useMemo } from 'react';
import {
  countryLabel,
  describeNationalPhoneInput,
  MAX_NATIONAL_PHONE_DIGITS,
} from '../utils/checkoutProductPhone';

type Props = {
  id: string;
  dialCode: string;
  marketIso: string;
  value: string;
  onChange: (nationalDigits: string) => void;
  disabled?: boolean;
};

export function CheckoutPhoneField({
  id,
  dialCode,
  marketIso,
  value,
  onChange,
  disabled,
}: Props) {
  const dialDigits = String(dialCode ?? '')
    .replace(/\D/g, '')
    .slice(0, 5);
  const label = countryLabel(marketIso);

  const feedback = useMemo(
    () => describeNationalPhoneInput(marketIso, dialDigits, value),
    [marketIso, dialDigits, value],
  );

  const showInvalid = feedback.status === 'invalid';
  const hintId = `${id}-phone-hint`;
  const errId = `${id}-phone-err`;

  return (
    <div className="form-group checkout-phone-group">
      <label htmlFor={id}>Mobile number</label>
      <div
        className={`checkout-phone-input-wrap${showInvalid ? ' checkout-phone-input-wrap--invalid' : ''}`}
      >
        <span className="checkout-phone-prefix" aria-hidden="true" title="Country code">
          {dialDigits ? `+${dialDigits}` : '+…'}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          id={id}
          name="phoneNational"
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, '').slice(0, MAX_NATIONAL_PHONE_DIGITS))
          }
          maxLength={MAX_NATIONAL_PHONE_DIGITS}
          placeholder="Digits only"
          disabled={disabled}
          required
          aria-invalid={showInvalid}
          aria-describedby={
            showInvalid && feedback.message ? `${hintId} ${errId}` : hintId
          }
        />
      </div>
      {showInvalid && feedback.message ? (
        <p className="checkout-phone-error" id={errId} role="alert">
          {feedback.message}
        </p>
      ) : null}
      <p className="checkout-phone-hint" id={hintId}>
        {label}
        {dialDigits ? ` (+${dialDigits})` : ''} — enter your mobile number without the country code.
        Only digits; max {MAX_NATIONAL_PHONE_DIGITS} digits.
      </p>
    </div>
  );
}
