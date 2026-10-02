import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Perfil } from '../../models';
import { PerfilRepository } from '../perfil.repository';
import { criarRespostaLocal } from './latencia';
import { PERFIL } from './perfil.dados';

@Injectable()
export class PerfilLocalRepository extends PerfilRepository {
  private readonly responder = criarRespostaLocal();

  obter(): Observable<Perfil> {
    return this.responder(PERFIL);
  }
}
