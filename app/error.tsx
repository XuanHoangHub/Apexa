'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="main-content">
      <div className="empty-state" role="alert">
        <h1>The studio encountered a brief disruption.</h1>
        <p>Drafts saved on this device remain preserved.</p>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
