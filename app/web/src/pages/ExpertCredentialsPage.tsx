import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getMyExpertProfile, submitMyCredentials, type MyExpertProfile } from '../api/experts';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

const STATUS_MESSAGE: Record<MyExpertProfile['credentialStatus'], keyof typeof strings> = {
  NOT_SUBMITTED: 'credentialNotSubmitted',
  PENDING_REVIEW: 'credentialPendingReview',
  VERIFIED: 'credentialVerified',
  REJECTED: 'credentialRejected',
};

export function ExpertCredentialsPage() {
  const { session, logout } = useAuth();
  const [profile, setProfile] = useState<MyExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getMyExpertProfile(session.accessToken)
      .then(setProfile)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadMyCredentials.en} / ${strings.couldNotLoadMyCredentials.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const qualification = String(formData.get('qualification') ?? '').trim();
    const licenseNumber = String(formData.get('licenseNumber') ?? '').trim();

    setSubmitting(true);
    setError(null);
    try {
      const updated = await submitMyCredentials(session.accessToken, {
        qualification,
        ...(licenseNumber ? { licenseNumber } : {}),
      });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitCredentials.en} / ${strings.couldNotSubmitCredentials.te}`);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = profile && profile.credentialStatus !== 'VERIFIED' && profile.credentialStatus !== 'PENDING_REVIEW';

  return (
    <>
      <div>
        <Bi id="expertCasesEyebrow" as="span" className="eyebrow" />
        <Bi id="myCredentialsTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        profile && (
          <div className="card">
            <div className="field-label">
              <Bi id="credentialStatusLabel" />
            </div>
            <BiValue value={strings[STATUS_MESSAGE[profile.credentialStatus]]} as="p" />

            {profile.qualification && (
              <div>
                <div className="field-label">
                  <Bi id="qualificationLabel" />
                </div>
                <div>{profile.qualification}</div>
              </div>
            )}
            {profile.licenseNumber && (
              <div>
                <div className="field-label">
                  <Bi id="licenseLabel" />
                </div>
                <div>{profile.licenseNumber}</div>
              </div>
            )}

            {canSubmit && (
              <form onSubmit={handleSubmit}>
                <label>
                  <Bi id="qualificationLabel" />
                  <div className="hint">
                    <Bi id="qualificationFieldHint" />
                  </div>
                  <textarea name="qualification" required minLength={2} onInvalid={bilingualInvalidHandler} onChange={clearCustomValidity} />
                </label>
                <label>
                  <Bi id="licenseLabel" />
                  <div className="hint">
                    <Bi id="licenseFieldOptionalHint" />
                  </div>
                  <input name="licenseNumber" type="text" />
                </label>
                <button type="submit" disabled={submitting}>
                  {submitting ? (
                    <BiValue value={strings.submittingCredentials} />
                  ) : profile.credentialStatus === 'REJECTED' ? (
                    <Bi id="resubmitCredentialsButton" />
                  ) : (
                    <Bi id="submitCredentialsButton" />
                  )}
                </button>
              </form>
            )}
          </div>
        )
      )}

      <Link to="/expert/cases" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}
