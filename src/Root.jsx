// Place at: src/Root.jsx  (no router library needed)
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
      <nav style={{ display: 'flex', gap: 8, padding: '12px 24px 0', fontFamily: 'system-ui' }}>
        {PAGES.map(([href, label]) => {
          const active = href === current[0];
          return (
            <a key={href} href={href} style={{
              padding: '4px 10px', borderRadius: 6, textDecoration: 'none', color: 'inherit',
              background: active ? '#e5e7eb' : 'transparent', fontWeight: active ? 600 : 400,
            }}>{label}</a>
          );
        })}
      </nav>
      <Page />
    </>
  );
}
