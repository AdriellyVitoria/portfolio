import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Perfil } from '../../models';
import { PerfilRepository } from '../perfil.repository';
import { criarRespostaMock } from './latencia-mock';
import { PERFIL_MOCK } from './perfil.mock';

@Injectable()
export class PerfilMockRepository extends PerfilRepository {
  private readonly responder = criarRespostaMock();

  obter(): Observable<Perfil> {
    return this.responder(PERFIL_MOCK);
  }
}
