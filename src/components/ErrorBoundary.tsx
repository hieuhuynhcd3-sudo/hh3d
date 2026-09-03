import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-accent-red/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠</span>
            </div>
            <h2 className="text-base font-bold text-ink-100 mb-2">Ứng dụng gặp lỗi</h2>
            <p className="text-sm text-ink-400 mb-4">
              Đã có lỗi xảy ra. Vui lòng thử lại.
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-sm font-medium bg-gold-500/15 hover:bg-gold-500/25 text-gold-300 rounded-lg border border-gold-500/40 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
