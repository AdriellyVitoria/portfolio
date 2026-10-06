import { TestBed } from '@angular/core/testing';

import { provideDados } from '../data/provide-dados';
import type { Acao } from '../models';
import { PortfolioStateService } from '../state/portfolio-state.service';
import { AcaoExecutorService } from './acao-executor.service';

describe('AcaoExecutorService', () => {
  let executor: AcaoExecutorService;
  let estado: PortfolioStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideDados({ fonte: 'local' })] });
    executor = TestBed.inject(AcaoExecutorService);
    estado = TestBed.inject(PortfolioStateService);
  });

  it('NAVEGAR troca a área', () => {
    executor.executar([{ tipo: 'NAVEGAR', destino: 'floricultura' }]);
    expect(estado.areaAtual()).toBe('floricultura');
  });

  it('DESTACAR_PROJETOS liga o filtro (aceita o nome da skill)', () => {
    executor.executar([{ tipo: 'DESTACAR_PROJETOS', tecnologia: 'Apache Kafka' }]);
    expect(estado.filtroTecnologia()).toBe('kafka');
  });

  it('LIMPAR_DESTAQUE desliga o filtro', () => {
    estado.destacarTecnologia('java');
    executor.executar([{ tipo: 'LIMPAR_DESTAQUE' }]);
    expect(estado.filtroTecnologia()).toBeNull();
  });

  it('ABRIR_PROJETO seleciona o projeto', () => {
    executor.executar([{ tipo: 'ABRIR_PROJETO', projetoId: 'nfe-estudo' }]);
    expect(estado.projetoSelecionadoId()).toBe('nfe-estudo');
  });

  it('ABRIR_PAINEL abre o painel do café', () => {
    executor.executar([{ tipo: 'ABRIR_PAINEL', painel: 'contato' }]);
    expect(estado.painelCafe()).toBe('contato');
  });

  it('executa várias ações em ordem', () => {
    executor.executar([
      { tipo: 'NAVEGAR', destino: 'livraria' },
      { tipo: 'DESTACAR_PROJETOS', tecnologia: 'java' },
    ]);
    expect(estado.areaAtual()).toBe('livraria');
    expect(estado.filtroTecnologia()).toBe('java');
  });

  it('ignora ação desconhecida sem quebrar as outras', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const desconhecida = { tipo: 'DANCAR' } as unknown as Acao;

    executor.executar([desconhecida, { tipo: 'NAVEGAR', destino: 'cafe' }]);

    expect(estado.areaAtual()).toBe('cafe');
    expect(console.warn).toHaveBeenCalled();
  });
});
