import { Component } from 'react';
import { EMAIL, LINKEDIN, GITHUB } from './content/profile';

// If anything in the sky breaks, recruiters still get the essentials.
export class Fallback extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { console.error(err); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <main className="classic" style={{ display: 'grid', placeItems: 'center' }}>
        <div className="sec" style={{ maxWidth: 520, padding: 24 }}>
          <h2>Mayank Thite, data analyst</h2>
          <p>Something went wrong loading the interactive site. You can still reach me.</p>
          <div className="row" style={{ gap: 20 }}>
            <a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a className="link" href={LINKEDIN}>LinkedIn</a>
            <a className="link" href={GITHUB}>GitHub</a>
          </div>
        </div>
      </main>
    );
  }
}
