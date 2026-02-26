import React from "react";

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: String(err?.message ?? err) };
  }

  componentDidCatch(error: any, info: any) {
    // útil p/ depurar no console
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto mt-6">
          <b>Opa, algo quebrou durante o arraste.</b><br />
          {this.state.message ? <div className="mt-2">{this.state.message}</div> : null}
          <div className="mt-3 text-slate-700">
            Dica: pressione <kbd>F12</kbd> e veja o <i>Console</i> (me envie o erro que aparece para eu blindar de vez).
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
