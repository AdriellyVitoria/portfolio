import { InjectionToken, Injector, inject } from '@angular/core';
import { pendingUntilEvent } from '@angular/core/rxjs-interop';
import { type Observable, delay, of } from 'rxjs';

/** Atraso artificial dos mocks, para exercitar estados de carregamento na UI. */
export const LATENCIA_MOCK_MS = new InjectionToken<number>('LATENCIA_MOCK_MS', {
  factory: () => 0,
});

/**
 * Cria a função de resposta dos repositories mock. Chamar em contexto de injeção.
 * `pendingUntilEvent` mantém a aplicação "instável" até a resposta chegar, para o
 * prerender (zoneless) esperar os dados mesmo com atraso.
 */
export function criarRespostaMock(): <T>(dados: T) => Observable<T> {
  const latencia = inject(LATENCIA_MOCK_MS);
  const injector = inject(Injector);

  return <T>(dados: T) => {
    const resposta$ = of(structuredClone(dados));
    return latencia > 0 ? resposta$.pipe(delay(latencia), pendingUntilEvent(injector)) : resposta$;
  };
}
