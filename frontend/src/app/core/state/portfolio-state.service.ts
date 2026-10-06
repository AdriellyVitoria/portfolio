import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProjetoRepository } from '../data/projeto.repository';
import { SkillRepository } from '../data/skill.repository';
import type { Area, CategoriaSkill, PainelCafe, Projeto, Skill } from '../models';

/**
 * Estado compartilhado do portfólio.
 *
 * É a ponte entre a cena 3D, os painéis, o modo simples e a Aurora: todos leem
 * estes signals e alteram o estado só pelos métodos públicos. Ninguém fala
 * diretamente com ninguém.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioStateService {
  // --- Dados ---
  private readonly projetosCarregados = toSignal(inject(ProjetoRepository).listar());
  private readonly skillsCarregadas = toSignal(inject(SkillRepository).listar());

  readonly projetos = computed<Projeto[]>(() => this.projetosCarregados() ?? []);
  readonly skills = computed<Skill[]>(() => this.skillsCarregadas() ?? []);
  readonly carregando = computed(
    () => this.projetosCarregados() === undefined || this.skillsCarregadas() === undefined,
  );

  // --- Estado de navegação e seleção ---
  private readonly _areaAtual = signal<Area>('entrada');
  private readonly _projetoSelecionadoId = signal<string | null>(null);
  private readonly _filtroTecnologia = signal<string | null>(null);
  private readonly _painelCafe = signal<PainelCafe | null>(null);
  private readonly _categoriaSkill = signal<CategoriaSkill | null>(null);

  readonly areaAtual = this._areaAtual.asReadonly();
  readonly projetoSelecionadoId = this._projetoSelecionadoId.asReadonly();
  /** Id da skill usada como filtro (ex.: 'java'). */
  readonly filtroTecnologia = this._filtroTecnologia.asReadonly();
  readonly painelCafe = this._painelCafe.asReadonly();
  /** Categoria escolhida na floricultura (um vaso por categoria). */
  readonly categoriaSkill = this._categoriaSkill.asReadonly();

  // --- Derivados ---
  readonly skillsPorId = computed(() => new Map(this.skills().map((s) => [s.id, s])));

  readonly projetoSelecionado = computed(() => {
    const id = this._projetoSelecionadoId();
    return id ? this.projetos().find((p) => p.id === id) : undefined;
  });

  readonly skillFiltrada = computed(() => {
    const id = this._filtroTecnologia();
    return id ? this.skills().find((s) => s.id === id) : undefined;
  });

  /** Projetos que usam a tecnologia filtrada; vazio quando não há filtro. */
  readonly projetosDestacados = computed(() => {
    const tecnologia = this._filtroTecnologia();
    return tecnologia ? this.projetos().filter((p) => p.tecnologias.includes(tecnologia)) : [];
  });

  readonly idsProjetosDestacados = computed(
    () => new Set(this.projetosDestacados().map((p) => p.id)),
  );

  // --- Ações ---
  irPara(area: Area): void {
    this._areaAtual.set(area);
  }

  /** Retorna `false` se o projeto não existir. */
  selecionarProjeto(id: string): boolean {
    if (!this.projetos().some((p) => p.id === id)) {
      return false;
    }
    this._projetoSelecionadoId.set(id);
    return true;
  }

  fecharProjeto(): void {
    this._projetoSelecionadoId.set(null);
  }

  /**
   * Destaca os projetos de uma tecnologia. Aceita id ou nome, sem diferenciar
   * maiúsculas ('java', 'Java', 'Spring Boot'), porque o termo pode vir da Aurora.
   * Retorna `false` se a tecnologia não existir.
   */
  destacarTecnologia(termo: string): boolean {
    const skill = this.encontrarSkill(termo);
    if (!skill) {
      return false;
    }
    this._filtroTecnologia.set(skill.id);
    this._categoriaSkill.set(skill.categoria);
    return true;
  }

  limparDestaque(): void {
    this._filtroTecnologia.set(null);
  }

  /** Liga o filtro da tecnologia ou desliga, se ela já for a filtrada. */
  alternarTecnologia(termo: string): void {
    const skill = this.encontrarSkill(termo);
    if (skill && this._filtroTecnologia() === skill.id) {
      this.limparDestaque();
    } else {
      this.destacarTecnologia(termo);
    }
  }

  /** Escolhe a categoria de skills (ou volta à lista de categorias com `null`). */
  selecionarCategoria(categoria: CategoriaSkill | null): void {
    this._categoriaSkill.set(categoria);
  }

  abrirPainelCafe(painel: PainelCafe): void {
    this._painelCafe.set(painel);
  }

  fecharPainelCafe(): void {
    this._painelCafe.set(null);
  }

  /** Converte ids de tecnologias (de um projeto ou experiência) nas skills completas. */
  skillsDe(ids: readonly string[]): Skill[] {
    const mapa = this.skillsPorId();
    return ids.flatMap((id) => mapa.get(id) ?? []);
  }

  encontrarSkill(termo: string): Skill | undefined {
    const normalizado = termo.trim().toLowerCase();
    return this.skills().find((s) => s.id === normalizado || s.nome.toLowerCase() === normalizado);
  }
}
