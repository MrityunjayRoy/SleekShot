import App from './App';
import GitHubApp from './GitHubApp';

export default function Root() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const onGitHub = path === '/github';

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span>SneekShot</span>
        </div>
        <nav className="tabs" aria-label="Card type">
          <a className="tab" href="/" aria-current={!onGitHub ? 'page' : undefined}>YouTube</a>
          <a className="tab" href="/github" aria-current={onGitHub ? 'page' : undefined}>GitHub</a>
        </nav>
      </header>
      {onGitHub ? <GitHubApp /> : <App />}
    </>
  );
}
