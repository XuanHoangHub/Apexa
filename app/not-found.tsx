import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="main-content">
      <div className="empty-state">
        <h1>Page not found.</h1>
        <p>This path does not exist in Apexa.</p>
        <Link className="button primary" href="/">
          Back to studio
        </Link>
      </div>
    </main>
  );
}
