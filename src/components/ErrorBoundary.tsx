import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Error capturado por ErrorBoundary:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col bg-bg items-center justify-center gap-4 px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-2xl font-bold text-regress mb-2">¡Algo salió mal!</h1>
            <p className="text-sm text-text/60 mb-4">
              Se produjo un error inesperado. Intenta recargar la página.
            </p>
            {this.state.error && (
              <details className="mt-4 p-3 bg-surface rounded-lg text-left">
                <summary className="text-xs font-mono text-text/50 cursor-pointer">
                  Detalles del error
                </summary>
                <pre className="mt-2 text-xs text-text/40 overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-lime text-bg font-bold text-sm"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
