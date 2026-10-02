import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { PerfilRepository } from '../perfil.repository';
import { ProjetoRepository } from '../projeto.repository';
import { provideDados } from '../provide-dados';
import { SkillRepository } from '../skill.repository';
import { PROJETOS_MOCK } from './projetos.mock';

describe('repositories mock', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideDados({ fonte: 'mock' })] });
  });

  describe('ProjetoRepository', () => {
    it('lista todos os projetos ordenados', async () => {
      const projetos = await firstValueFrom(TestBed.inject(ProjetoRepository).listar());
      const ordens = projetos.map((p) => p.ordem);

      expect(projetos).toHaveLength(PROJETOS_MOCK.length);
      expect(ordens).toEqual([...ordens].sort((a, b) => a - b));
    });

    it('filtra por tecnologia', async () => {
      const projetos = await firstValueFrom(
        TestBed.inject(ProjetoRepository).listar({ tecnologia: 'kafka' }),
      );

      expect(projetos.length).toBeGreaterThan(0);
      projetos.forEach((p) => expect(p.tecnologias).toContain('kafka'));
    });

    it('busca por id e devolve undefined quando não existe', async () => {
      const repo = TestBed.inject(ProjetoRepository);

      const encontrado = await firstValueFrom(repo.buscarPorId('projeto-exemplo-1'));
      expect(encontrado?.nome).toBe('Projeto Exemplo 1');
      expect(await firstValueFrom(repo.buscarPorId('nao-existe'))).toBeUndefined();
    });

    it('devolve cópias, sem expor os dados internos', async () => {
      const repo = TestBed.inject(ProjetoRepository);
      const [primeiro] = await firstValueFrom(repo.listar());
      primeiro.nome = 'alterado';

      const [deNovo] = await firstValueFrom(repo.listar());
      expect(deNovo.nome).not.toBe('alterado');
    });
  });

  it('SkillRepository lista as skills', async () => {
    const skills = await firstValueFrom(TestBed.inject(SkillRepository).listar());
    expect(skills.find((s) => s.id === 'java')?.categoria).toBe('BACKEND');
  });

  it('PerfilRepository obtém o perfil', async () => {
    const perfil = await firstValueFrom(TestBed.inject(PerfilRepository).obter());
    expect(perfil.nome).toBe('Adrielly');
  });
});

describe('provideDados', () => {
  it('falha de forma explícita para http enquanto o backend não existe', () => {
    expect(() => provideDados({ fonte: 'http' })).toThrowError(/backend/);
  });
});

describe('latência dos mocks', () => {
  it('atrasa a resposta conforme configurado', async () => {
    TestBed.configureTestingModule({
      providers: [provideDados({ fonte: 'mock', latenciaMockMs: 60 })],
    });
    const inicio = performance.now();

    await firstValueFrom(TestBed.inject(SkillRepository).listar());

    expect(performance.now() - inicio).toBeGreaterThanOrEqual(50);
  });
});
