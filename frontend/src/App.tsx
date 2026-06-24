import { useEffect, useState } from 'react'
import { fetchHealth } from './api/client'
import './App.css'

function App() {
  const [status, setStatus] = useState<string>('checking...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setStatus(data.status)
        setError(null)
      })
      .catch((err: Error) => {
        setStatus('unavailable')
        setError(err.message)
      })
  }, [])

  return (
    <main className="app">
      <h1>Todo App</h1>
      <p className="subtitle">Full-stack scaffold — .NET 10 API + React</p>

      <section className="health-card">
        <h2>API Health</h2>
        <p className={`status status-${status}`}>{status}</p>
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  )
}

export default App
