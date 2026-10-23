import { Component, type ErrorInfo, type ReactNode } from 'react';
import { trackError, flush } from './track';
import { strings } from '../i18n/strings';

// If a screen crashes, show a plain message with a way out instead of a blank page, and report
// the crash so it can be fixed. (Strings are read directly because the crash may be in i18n code.)
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    trackError(error, 'screen');
    if (info.componentStack) trackError(new Error(info.componentStack.split('\n').slice(0, 3).join(' ')), 'component');
    flush();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="screen">
        <div className="card" role="alert">
          <h2>
            <span className="bi-en">{strings.somethingWentWrongTitle.en}</span>
            <span className="bi-te">{strings.somethingWentWrongTitle.te}</span>
          </h2>
          <p>
            <span className="bi-en">{strings.somethingWentWrongBody.en}</span>
            <span className="bi-te">{strings.somethingWentWrongBody.te}</span>
          </p>
          <button type="button" onClick={() => window.location.assign('/')}>
            <span className="bi-en">{strings.reloadButton.en}</span>
            <span className="bi-te">{strings.reloadButton.te}</span>
          </button>
        </div>
      </div>
    );
  }
}
