import type { Observable } from 'rxjs';

import type { Skill } from '../models';

export abstract class SkillRepository {
  /** Skills ordenadas por `ordem`. */
  abstract listar(): Observable<Skill[]>;
}
