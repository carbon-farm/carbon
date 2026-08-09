import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, otpSentTo } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

type Step = 'mobile' | 'otp' | 'newPassword' | 'done';

// Mirrors RegisterPage's shape (mobile → OTP → next), plus one more step for
// the new password itself — three steps, not two, because unlike
// registration this flow ends with the farmer choosing a new credential
// rather than being logged straight in.
export function ForgotPasswordPage() {
  const { requestPasswordResetOtp, verifyPasswordResetOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function fallback(err: unknown, s: { en: string; te: string }) {
    return err instanceof ApiError ? err.message : `${s.en} / ${s.te}`;
  }

  async function handleMobileSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await requestPasswordResetOtp(mobileNumber);
      setDevOtpHint(result.devOtp ?? null);
      setStep('otp');
    } catch (err) {
      setError(fallback(err, strings.genericError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = await verifyPasswordResetOtp(mobileNumber, otp);
      setResetToken(token);
      setStep('newPassword');
    } catch (err) {
      setError(fallback(err, strings.incorrectCodeError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNewPasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(mobileNumber, newPassword, resetToken);
      setStep('done');
    } catch (err) {
      setError(fallback(err, strings.genericError));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'done') {
    return (
      <div className="screen">
        <div>
          <Bi id="brand" as="span" className="eyebrow" />
          <Bi id="resetPasswordTitle" as="h1" />
        </div>
        <BiValue value={strings.resetSuccessMessage} as="p" className="hint" />
        <button type="button" onClick={() => navigate('/login')}>
          <Bi id="loginButton" />
        </button>
      </div>
    );
  }

  if (step === 'newPassword') {
    return (
      <div className="screen">
        <div>
          <Bi id="forgotPasswordStep3" as="span" className="eyebrow" />
          <Bi id="resetPasswordTitle" as="h1" />
        </div>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleNewPasswordSubmit}>
          <label>
            <Bi id="newPasswordLabel" />
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                clearCustomValidity(e);
              }}
              onInvalid={bilingualInvalidHandler}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? <BiValue value={strings.resetting} /> : <Bi id="resetPasswordButton" />}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="screen">
        <div>
          <Bi id="forgotPasswordStep2" as="span" className="eyebrow" />
          <Bi id="enterCodeTitle" as="h1" />
        </div>
        <BiValue value={otpSentTo(mobileNumber)} as="p" className="hint" />
        {devOtpHint && (
          <div className="error-banner">
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
          <button type="button" className="secondary" onClick={() => setStep('mobile')}>
            <Bi id="backButton" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="screen">
      <div>
        <Bi id="forgotPasswordStep1" as="span" className="eyebrow" />
        <Bi id="resetPasswordTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleMobileSubmit}>
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
          {submitting ? <BiValue value={strings.sendingCode} /> : <Bi id="sendResetCodeButton" />}
        </button>
      </form>

      <p className="hint">
        <Link to="/login" className="link-button">
          <Bi id="backToLoginLink" />
        </Link>
      </p>
    </div>
  );
}
