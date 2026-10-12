import App from './App';
import GitHubApp from './GitHubApp';
import RepoApp from './RepoApp';

const PAGES = [
  ['/', 'YouTube', App],
  ['/github', 'GitHub profile', GitHubApp],
  ['/repo', 'GitHub repo', RepoApp],
];

export default function Root() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const current = PAGES.find(([p]) => p === path) || PAGES[0];
  const Page = current[2];

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span>SleekShot</span>
        </div>
        <nav className="tabs" aria-label="Card type">
          {PAGES.map(([href, label]) => (
            <a key={href} href={href} className="tab" aria-current={href === current[0] ? 'page' : undefined}>{label}</a>
          ))}
        </nav>
      </header>
      <Page />
      <footer className="footer">
        <a href="https://github.com/MrityunjayRoy/SleekShot" target="_blank" rel="noreferrer">GitHub</a>
        <span aria-hidden="true">·</span>
        <span>Made with elegance</span>
      </footer>
    </>
  );
}
