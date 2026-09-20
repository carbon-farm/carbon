import type { FormEvent } from 'react';
import type { Address, AddressInput } from '../api/addresses';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

// One form for adding and editing a delivery address — used on the Addresses screen and
// inline at checkout. Everything a courier needs is required; landmark, second phone, email
// and a label are optional.
export function AddressForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
  defaultName = '',
  defaultPhone = '',
}: {
  initial?: Address;
  submitting: boolean;
  onSubmit: (data: AddressInput) => void;
  onCancel?: () => void;
  defaultName?: string;
  defaultPhone?: string;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const text = (k: string) => String(f.get(k) ?? '').trim();
    const optional = (k: string) => text(k) || undefined;
    onSubmit({
      label: optional('label'),
      recipientName: text('recipientName'),
      phone: text('phone'),
      alternatePhone: optional('alternatePhone'),
      email: optional('email'),
      line1: text('line1'),
      line2: optional('line2'),
      landmark: optional('landmark'),
      city: text('city'),
      state: text('state'),
      pincode: text('pincode'),
      isDefault: f.get('isDefault') === 'on',
    });
  }

  const field = (name: string, opts: { required?: boolean; type?: string; value?: string | null; pattern?: string; inputMode?: 'numeric' | 'tel'; maxLength?: number; autoComplete?: string }) => (
    <input
      name={name}
      type={opts.type ?? 'text'}
      required={opts.required}
      defaultValue={opts.value ?? ''}
      pattern={opts.pattern}
      inputMode={opts.inputMode}
      maxLength={opts.maxLength}
      autoComplete={opts.autoComplete}
      onInvalid={bilingualInvalidHandler}
      onChange={clearCustomValidity}
    />
  );

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <div className="form-grid">
        <label>
          <Bi id="addrRecipientField" />
          {field('recipientName', { required: true, value: initial?.recipientName ?? defaultName, autoComplete: 'name' })}
        </label>
        <label>
          <Bi id="addrPhoneField" />
          {field('phone', { required: true, type: 'tel', value: initial?.phone ?? defaultPhone, inputMode: 'tel', pattern: '[0-9+\\-\\s]{10,16}', autoComplete: 'tel' })}
        </label>
        <label>
          <Bi id="addrAltPhoneField" />
          {field('alternatePhone', { type: 'tel', value: initial?.alternatePhone, inputMode: 'tel', pattern: '[0-9+\\-\\s]{10,16}' })}
        </label>
        <label>
          <Bi id="addrEmailField" />
          {field('email', { type: 'email', value: initial?.email, autoComplete: 'email' })}
        </label>
        <label className="span-2">
          <Bi id="addrLine1Field" />
          {field('line1', { required: true, value: initial?.line1, maxLength: 120, autoComplete: 'address-line1' })}
        </label>
        <label className="span-2">
          <Bi id="addrLine2Field" />
          {field('line2', { value: initial?.line2, maxLength: 120, autoComplete: 'address-line2' })}
        </label>
        <label>
          <Bi id="addrLandmarkField" />
          {field('landmark', { value: initial?.landmark, maxLength: 80 })}
        </label>
        <label>
          <Bi id="addrCityField" />
          {field('city', { required: true, value: initial?.city, maxLength: 60, autoComplete: 'address-level2' })}
        </label>
        <label>
          <Bi id="addrStateField" />
          {field('state', { required: true, value: initial?.state, maxLength: 60, autoComplete: 'address-level1' })}
        </label>
        <label>
          <Bi id="addrPincodeField" />
          {field('pincode', { required: true, value: initial?.pincode, inputMode: 'numeric', pattern: '[1-9][0-9]{5}', maxLength: 6, autoComplete: 'postal-code' })}
        </label>
        <label>
          <Bi id="addrLabelField" />
          {field('label', { value: initial?.label, maxLength: 30 })}
        </label>
      </div>
      <label className="checkbox-label">
        <input type="checkbox" name="isDefault" defaultChecked={initial?.isDefault ?? false} />
        <Bi id="addrDefaultField" />
      </label>
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? <BiValue value={strings.addrSaving} /> : <Bi id="addrSaveButton" />}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            <Bi id="cancelButton" />
          </button>
        )}
      </div>
    </form>
  );
}
