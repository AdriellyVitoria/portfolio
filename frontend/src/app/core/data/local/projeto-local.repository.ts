import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { FiltroProjetos, Projeto } from '../../models';
import { ProjetoRepository } from '../projeto.repository';
import { criarRespostaLocal } from './latencia';
import { PROJETOS } from './projetos.dados';

@Injectable()
export class ProjetoLocalRepository extends ProjetoRepository {
  private readonly responder = criarRespostaLocal();

  listar(filtro?: FiltroProjetos): Observable<Projeto[]> {
    const tecnologia = filtro?.tecnologia;
    const projetos = PROJETOS.filter((p) => !tecnologia || p.tecnologias.includes(tecnologia)).sort(
      (a, b) => a.ordem - b.ordem,
    );

    return this.responder(projetos);
  }

  buscarPorId(id: string): Observable<Projeto | undefined> {
    return this.responder(PROJETOS.find((p) => p.id === id));
  }
}
