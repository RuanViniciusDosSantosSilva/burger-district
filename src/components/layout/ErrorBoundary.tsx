import { Component, type ReactNode } from 'react';

/** Evita tela em branco: mostra uma mensagem amigável se algo inesperado falhar. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(e: unknown) {
    console.error('[Burger District]', e);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-ink p-8 text-center text-cream">
        <div>
          <p className="font-display text-5xl uppercase">Ops, a chapa esfriou.</p>
          <p className="mt-3 text-cream/60">Algo deu errado ao carregar a página.</p>
          <button type="button" onClick={() => location.reload()} className="btn-primary mt-6">Recarregar</button>
        </div>
      </div>
    );
  }
}
