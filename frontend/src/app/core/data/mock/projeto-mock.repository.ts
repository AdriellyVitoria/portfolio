import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { FiltroProjetos, Projeto } from '../../models';
import { ProjetoRepository } from '../projeto.repository';
import { criarRespostaMock } from './latencia-mock';
import { PROJETOS_MOCK } from './projetos.mock';

@Injectable()
export class ProjetoMockRepository extends ProjetoRepository {
  private readonly responder = criarRespostaMock();

  listar(filtro?: FiltroProjetos): Observable<Projeto[]> {
    const tecnologia = filtro?.tecnologia;
    const projetos = PROJETOS_MOCK.filter(
      (p) => !tecnologia || p.tecnologias.includes(tecnologia),
    ).sort((a, b) => a.ordem - b.ordem);

    return this.responder(projetos);
  }

  buscarPorId(id: string): Observable<Projeto | undefined> {
    return this.responder(PROJETOS_MOCK.find((p) => p.id === id));
  }
}
