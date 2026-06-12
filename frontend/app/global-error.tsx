'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0F0A0B', color: '#F5F0F0', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
          <div>
            <p style={{ color: '#C9986A', letterSpacing: '0.35em', textTransform: 'uppercase', fontSize: 12 }}>BurgReport</p>
            <h1 style={{ fontSize: 42, margin: '16px 0 0' }}>Something went wrong.</h1>
            <p style={{ color: '#B7A8AF', maxWidth: 560, lineHeight: 1.6 }}>The application hit a root-level error. Try again or roll back to the last stable deployment.</p>
            <button onClick={reset} style={{ marginTop: 24, border: 0, borderRadius: 999, background: '#C9986A', color: '#0F0A0B', padding: '12px 18px', fontWeight: 700 }}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
