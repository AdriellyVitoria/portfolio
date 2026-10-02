import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Skill } from '../../models';
import { SkillRepository } from '../skill.repository';
import { criarRespostaMock } from './latencia-mock';
import { SKILLS_MOCK } from './skills.mock';

@Injectable()
export class SkillMockRepository extends SkillRepository {
  private readonly responder = criarRespostaMock();

  listar(): Observable<Skill[]> {
    return this.responder([...SKILLS_MOCK].sort((a, b) => a.ordem - b.ordem));
  }
}
