import type { Observable } from 'rxjs';

import type { Perfil } from '../models';

export abstract class PerfilRepository {
  abstract obter(): Observable<Perfil>;
}
