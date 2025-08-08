import React from 'react'

type ErrorProps = {
  statusCode?: number
}

export default function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>An Error Occurred</h1>
        <p style={{ color: '#4b5563', marginBottom: 16 }}>
          {statusCode ? `Server responded with status ${statusCode}.` : 'An unexpected client error occurred.'}
        </p>
        <a href="/" style={{ display: 'inline-block', padding: '10px 16px', background: '#7c3aed', color: '#fff', borderRadius: 8 }}>Back to Homepage</a>
      </div>
    </div>
  )
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}


