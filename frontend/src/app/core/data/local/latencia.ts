import { InjectionToken, Injector, inject } from '@angular/core';
import { pendingUntilEvent } from '@angular/core/rxjs-interop';
import { type Observable, delay, of } from 'rxjs';

/** Atraso artificial (só em dev), para exercitar os estados de carregamento da UI. */
export const LATENCIA_SIMULADA_MS = new InjectionToken<number>('LATENCIA_SIMULADA_MS', {
  factory: () => 0,
});

/**
 * Cria a função de resposta dos repositories locais. Chamar em contexto de injeção.
 * Devolve cópias, como uma API devolveria, e simula a latência configurada.
 * `pendingUntilEvent` mantém a aplicação "instável" até a resposta chegar, para o
 * prerender (zoneless) esperar os dados mesmo com atraso.
 */
export function criarRespostaLocal(): <T>(dados: T) => Observable<T> {
  const latencia = inject(LATENCIA_SIMULADA_MS);
  const injector = inject(Injector);

  return <T>(dados: T) => {
    const resposta$ = of(structuredClone(dados));
    return latencia > 0 ? resposta$.pipe(delay(latencia), pendingUntilEvent(injector)) : resposta$;
  };
}
