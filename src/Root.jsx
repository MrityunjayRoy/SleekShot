import App from './App';
import GitHubApp from './GitHubApp';

export default function Root() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const onGitHub = path === '/github';
  const link = (href, label, active) => (
    <a href={href} style={{
      padding: '4px 10px', borderRadius: 6, textDecoration: 'none', color: 'inherit',
      background: active ? '#e5e7eb' : 'transparent', fontWeight: active ? 600 : 400,
    }}>{label}</a>
  );

  return (
    <>
      <nav style={{ display: 'flex', gap: 8, padding: '12px 24px 0', fontFamily: 'system-ui' }}>
        {link('/', 'YouTube', !onGitHub)}
        {link('/github', 'GitHub', onGitHub)}
      </nav>
      {onGitHub ? <GitHubApp /> : <App />}
    </>
  );
}
