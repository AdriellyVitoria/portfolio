import type { Observable } from 'rxjs';

import type { FiltroProjetos, Projeto } from '../models';

/** Contrato de acesso a projetos. Implementações: local (agora) e HTTP (backend). */
export abstract class ProjetoRepository {
  /** Projetos ordenados por `ordem`. */
  abstract listar(filtro?: FiltroProjetos): Observable<Projeto[]>;
  abstract buscarPorId(id: string): Observable<Projeto | undefined>;
}
