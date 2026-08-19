import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getReportsSummary, type ReportsSummary } from '../api/reports';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseStatusLabel, caseCategoryLabel, articleStatusLabel, type StringKey } from '../i18n/strings';

const ROLE_KEYS: Record<string, StringKey> = {
  FARMER: 'roleFarmer',
  MODERATOR: 'roleModerator',
  EXPERT: 'roleExpert',
  VENDOR: 'roleVendor',
  SUPPORT_AGENT: 'roleSupportAgent',
  ADMINISTRATOR: 'roleAdministrator',
};

function BarList({ rows, labelFor }: { rows: { key: string; count: number }[]; labelFor: (key: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const nonZero = rows.filter((r) => r.count > 0);
  if (nonZero.length === 0) {
    return <BiValue value={strings.reportNoData} as="p" className="hint" />;
  }
  return (
    <div className="bar-rows">
      {nonZero.map((row) => (
        <div className="bar-row" key={row.key}>
          <div className="bar-row-head">
            <span>{labelFor(row.key)}</span>
            <span className="count">{row.count}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminReportingPage() {
  const { session, logout } = useAuth();
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getReportsSummary(session.accessToken)
      .then(setSummary)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadReports.en} / ${strings.couldNotLoadReports.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="reportsPageTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading || !summary ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        <>
          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">{summary.totalCases}</div>
              <BiValue value={strings.reportTotalCasesLabel} as="div" className="label" />
            </div>
            <div className="stat-tile">
              <div className="value">{summary.openCases}</div>
              <BiValue value={strings.reportOpenCasesLabel} as="div" className="label" />
            </div>
            <div className="stat-tile">
              <div className="value">{summary.resolvedCases}</div>
              <BiValue value={strings.reportResolvedCasesLabel} as="div" className="label" />
            </div>
            <div className="stat-tile">
              <div className="value">{summary.abandonedCases}</div>
              <BiValue value={strings.reportAbandonedCasesLabel} as="div" className="label" />
            </div>
            <div className="stat-tile">
              <div className="value">
                {summary.avgResolutionDays === null ? '—' : summary.avgResolutionDays.toFixed(1)}
              </div>
              <BiValue value={strings.reportAvgResolutionLabel} as="div" className="label" />
              {summary.avgResolutionDays !== null && (
                <div className="label">{strings.reportDaysUnit.en} / {strings.reportDaysUnit.te}</div>
              )}
            </div>
          </div>

          <div className="card">
            <Bi id="reportCasesByStatusHeading" as="h2" />
            <BarList
              rows={summary.casesByStatus.map((r) => ({ key: r.status, count: r.count }))}
              labelFor={(status) => {
                const label = caseStatusLabel(status);
                return `${label.en} / ${label.te}`;
              }}
            />
          </div>

          <div className="card">
            <Bi id="reportCasesByCategoryHeading" as="h2" />
            <BarList
              rows={summary.casesByCategory.map((r) => ({ key: r.category, count: r.count }))}
              labelFor={(category) => {
                const label = caseCategoryLabel(category);
                return `${label.en} / ${label.te}`;
              }}
            />
          </div>

          <div className="card">
            <Bi id="reportCasesByCropHeading" as="h2" />
            <BarList rows={summary.casesByCrop.map((r) => ({ key: r.crop, count: r.count }))} labelFor={(crop) => crop} />
          </div>

          <div className="card">
            <Bi id="reportArticlesByStatusHeading" as="h2" />
            <BarList
              rows={summary.articlesByStatus.map((r) => ({ key: r.status, count: r.count }))}
              labelFor={(status) => {
                const label = articleStatusLabel(status);
                return `${label.en} / ${label.te}`;
              }}
            />
          </div>

          <div className="card">
            <Bi id="reportUsersByRoleHeading" as="h2" />
            <BarList
              rows={summary.usersByRole.map((r) => ({ key: r.role, count: r.count }))}
              labelFor={(role) => {
                const key = ROLE_KEYS[role];
                const label = key ? strings[key] : { en: role, te: role };
                return `${label.en} / ${label.te}`;
              }}
            />
          </div>

          <div className="card">
            <Bi id="reportExpertWorkloadHeading" as="h2" />
            {summary.expertWorkload.length === 0 ? (
              <BiValue value={strings.reportNoData} as="p" className="hint" />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{strings.actorColumnLabel.en} / {strings.actorColumnLabel.te}</th>
                      <th>{strings.reportAssignedCasesColumn.en} / {strings.reportAssignedCasesColumn.te}</th>
                      <th>{strings.reportResolvedCasesLabel.en} / {strings.reportResolvedCasesLabel.te}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.expertWorkload.map((row) => (
                      <tr key={row.expertId}>
                        <td>{row.name}</td>
                        <td>{row.assignedCount}</td>
                        <td>{row.resolvedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}
