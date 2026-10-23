import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

// There is no SMS or WhatsApp channel yet, so a code on the screen could never prove who is
// asking — anyone who knew a number could reset that person's password. Instead the person asks
// here, the store's Administrators are told, and an Administrator gives them a temporary
// password after checking it really is them (Members → "Temporary password"). The answer on
// screen is the same whether or not the number is registered.
export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(mobileNumber);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screen">
      <div>
        <Bi id="brand" as="span" className="eyebrow" />
        <Bi id="resetPasswordTitle" as="h1" />
      </div>

      {sent ? (
        <div className="card">
          <Bi id="resetRequestSentTitle" as="h2" />
          <BiValue value={strings.resetRequestSentBody} as="p" />
        </div>
      ) : (
        <>
          <BiValue value={strings.forgotIntro} as="p" className="hint" />
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label>
              <Bi id="mobileNumberLabel" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  clearCustomValidity(e);
                }}
                onInvalid={bilingualInvalidHandler}
                placeholder="+91 98765 43210"
                required
              />
            </label>
            <button type="submit" disabled={submitting}>
              {submitting ? <BiValue value={strings.sendingCode} /> : <Bi id="sendResetRequestButton" />}
            </button>
          </form>
        </>
      )}

      <p className="hint">
        <Link to="/login" className="link-button">
          <Bi id="backToLoginLink" />
        </Link>
      </p>
    </div>
  );
}
