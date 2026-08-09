import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../auth/roleHome';
import { ApiError } from '../api/client';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { role } = await login(mobileNumber, password);
      navigate(roleHomePath(role));
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
        <Bi id="loginTitle" as="h1" />
      </div>

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
        <label>
          <Bi id="passwordLabel" />
          <input
            type="password"
            autoComplete="current-password"
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
          {submitting ? (
            <BiValue value={strings.loggingIn} />
          ) : (
            <Bi id="loginButton" />
          )}
        </button>
      </form>

      <p className="hint">
        <BiValue value={strings.newHere} />{' '}
        <Link to="/register" className="link-button" aria-label={biInline('createAccountLink')}>
          <Bi id="createAccountLink" />
        </Link>
      </p>
      <p className="hint">
        <Link to="/forgot-password" className="link-button" aria-label={biInline('forgotPasswordLink')}>
          <Bi id="forgotPasswordLink" />
        </Link>
      </p>
    </div>
  );
}
