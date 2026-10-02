import { TestBed } from '@angular/core/testing';

import { provideDados } from '../data/provide-dados';
import { PortfolioStateService } from './portfolio-state.service';

describe('PortfolioStateService', () => {
  let estado: PortfolioStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideDados({ fonte: 'mock' })] });
    estado = TestBed.inject(PortfolioStateService);
  });

  it('carrega projetos e skills', () => {
    expect(estado.carregando()).toBe(false);
    expect(estado.projetos().length).toBeGreaterThan(0);
    expect(estado.skills().length).toBeGreaterThan(0);
  });

  describe('áreas', () => {
    it('começa na entrada e troca de área', () => {
      expect(estado.areaAtual()).toBe('entrada');

      estado.irPara('livraria');

      expect(estado.areaAtual()).toBe('livraria');
    });
  });

  describe('seleção de projeto', () => {
    it('seleciona e fecha um projeto', () => {
      expect(estado.selecionarProjeto('projeto-exemplo-2')).toBe(true);
      expect(estado.projetoSelecionado()?.nome).toBe('Projeto Exemplo 2');

      estado.fecharProjeto();

      expect(estado.projetoSelecionado()).toBeUndefined();
    });

    it('ignora projeto inexistente', () => {
      expect(estado.selecionarProjeto('nao-existe')).toBe(false);
      expect(estado.projetoSelecionadoId()).toBeNull();
    });
  });

  describe('destaque por tecnologia', () => {
    it('sem filtro, nada fica destacado', () => {
      expect(estado.projetosDestacados()).toEqual([]);
    });

    it('destaca só os projetos que usam a tecnologia', () => {
      estado.destacarTecnologia('java');

      const destacados = estado.projetosDestacados();
      expect(destacados.length).toBeGreaterThan(0);
      destacados.forEach((p) => expect(p.tecnologias).toContain('java'));
      expect(estado.idsProjetosDestacados().has('projeto-exemplo-4')).toBe(false);
    });

    it.each(['java', 'Java', ' JAVA ', 'Spring Boot'])('aceita id ou nome: "%s"', (termo) => {
      expect(estado.destacarTecnologia(termo)).toBe(true);
      expect(estado.skillFiltrada()).toBeDefined();
    });

    it('ignora tecnologia desconhecida sem perder o filtro atual', () => {
      estado.destacarTecnologia('angular');

      expect(estado.destacarTecnologia('cobol')).toBe(false);
      expect(estado.filtroTecnologia()).toBe('angular');
    });

    it('limpa o destaque', () => {
      estado.destacarTecnologia('kafka');

      estado.limparDestaque();

      expect(estado.filtroTecnologia()).toBeNull();
      expect(estado.projetosDestacados()).toEqual([]);
    });
  });
});
