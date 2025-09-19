import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: unknown }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // Can be connected to logging later
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Something went wrong.</div>
          <div style={{ color: '#9aa3b2' }}>Please reload the extension page.</div>
        </div>
      )
    }
    return this.props.children
  }
}


