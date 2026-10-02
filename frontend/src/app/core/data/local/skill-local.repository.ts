import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Skill } from '../../models';
import { SkillRepository } from '../skill.repository';
import { criarRespostaLocal } from './latencia';
import { SKILLS } from './skills.dados';

@Injectable()
export class SkillLocalRepository extends SkillRepository {
  private readonly responder = criarRespostaLocal();

  listar(): Observable<Skill[]> {
    return this.responder([...SKILLS].sort((a, b) => a.ordem - b.ordem));
  }
}
