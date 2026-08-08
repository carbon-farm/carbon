import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, otpSentTo } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

// Two steps only, per 01-Product/05-Target-Users.md — Ravi's journey has no
// patience for a long form: name/mobile/password, then a single OTP field.
export function RegisterPage() {
  const { register, verifyRegistrationOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleDetailsSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await register(mobileNumber, password, name);
      setDevOtpHint(result.devOtp ?? null);
      setStep('otp');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyRegistrationOtp(mobileNumber, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : `${strings.incorrectCodeError.en} / ${strings.incorrectCodeError.te}`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'otp') {
    return (
      <div className="screen">
        <div>
          <Bi id="registerStep2" as="span" className="eyebrow" />
          <Bi id="enterCodeTitle" as="h1" />
        </div>
        <BiValue value={otpSentTo(mobileNumber)} as="p" className="hint" />
        {devOtpHint && (
          <div className="error-banner" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
            <Bi id="devOtpPrefix" /> <strong>{devOtpHint}</strong>
          </div>
        )}
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleOtpSubmit}>
          <label>
            <Bi id="otpCodeLabel" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                clearCustomValidity(e);
              }}
              onInvalid={bilingualInvalidHandler}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? <BiValue value={strings.verifying} /> : <Bi id="verifyButton" />}
          </button>
          <button type="button" className="secondary" onClick={() => setStep('details')}>
            <Bi id="backButton" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="screen">
      <div>
        <Bi id="registerStep1" as="span" className="eyebrow" />
        <Bi id="createAccountTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleDetailsSubmit}>
        <label>
          <Bi id="nameLabel" />
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearCustomValidity(e);
            }}
            onInvalid={bilingualInvalidHandler}
            required
          />
        </label>
        <label>
          <Bi id="mobileNumberLabel" />
          <input
            type="tel"
            inputMode="tel"
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
        <label>
          <Bi id="passwordLabel" />
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearCustomValidity(e);
            }}
            onInvalid={bilingualInvalidHandler}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? <BiValue value={strings.creating} /> : <Bi id="sendCodeButton" />}
        </button>
      </form>

      <p className="hint">
        <BiValue value={strings.alreadyRegistered} />{' '}
        <Link to="/login" className="link-button">
          <Bi id="loginLink" />
        </Link>
      </p>
    </div>
  );
}
