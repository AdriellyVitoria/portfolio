import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { ChatRepository } from '../data/chat.repository';
import { ATRASO_RESPOSTA_AURORA_MS } from '../data/local/chat-local.repository';
import { provideDados } from '../data/provide-dados';
import { MAX_CARACTERES_PERGUNTA } from '../models';
import { PortfolioStateService } from '../state/portfolio-state.service';
import { AuroraService } from './aurora.service';

describe('AuroraService', () => {
  let aurora: AuroraService;
  let estado: PortfolioStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideDados({ fonte: 'local' }),
        { provide: ATRASO_RESPOSTA_AURORA_MS, useValue: 0 },
      ],
    });
    aurora = TestBed.inject(AuroraService);
    estado = TestBed.inject(PortfolioStateService);
  });

  it('ao abrir pela primeira vez, a Aurora se apresenta com sugestões', () => {
    aurora.abrir();

    expect(aurora.aberta()).toBe(true);
    expect(aurora.mensagens()).toHaveLength(1);
    expect(aurora.mensagens()[0].autor).toBe('AURORA');
    expect(aurora.sugestoes().length).toBeGreaterThan(0);

    aurora.abrir();
    expect(aurora.mensagens()).toHaveLength(1); // não repete a saudação
  });

  it('enviar adiciona a pergunta, a resposta e executa as ações', () => {
    aurora.abrir();
    aurora.enviar('Quais projetos usam Kafka?');

    const [, pergunta, resposta] = aurora.mensagens();
    expect(pergunta).toMatchObject({ autor: 'USUARIO', texto: 'Quais projetos usam Kafka?' });
    expect(resposta.autor).toBe('AURORA');
    expect(resposta.texto).toContain('NF-e Estudo');
    expect(estado.areaAtual()).toBe('livraria');
    expect(estado.filtroTecnologia()).toBe('kafka');
    expect(aurora.digitando()).toBe(false);
  });

  it('recolhe quando a resposta leva para fora do café, e volta depois', () => {
    aurora.abrir();
    aurora.enviar('projetos com java');
    expect(aurora.recolhida()).toBe(true);

    aurora.voltar();
    expect(aurora.recolhida()).toBe(false);
  });

  it('não recolhe quando a ação acontece no próprio café', () => {
    aurora.abrir();
    aurora.enviar('como entro em contato?');

    expect(aurora.recolhida()).toBe(false);
    expect(estado.painelCafe()).toBe('contato');
  });

  it('ignora mensagem vazia e corta no limite de caracteres', () => {
    aurora.abrir();
    aurora.enviar('   ');
    expect(aurora.mensagens()).toHaveLength(1);

    aurora.enviar('a'.repeat(MAX_CARACTERES_PERGUNTA + 50));
    expect(aurora.mensagens()[1].texto).toHaveLength(MAX_CARACTERES_PERGUNTA);
  });

  it('erro na resposta vira uma mensagem amigável', () => {
    TestBed.inject(ChatRepository).enviar = () => throwError(() => new Error('offline'));
    aurora.abrir();

    aurora.enviar('oi');

    expect(aurora.mensagens().at(-1)?.texto).toMatch(/probleminha/);
    expect(aurora.digitando()).toBe(false);
  });

  it('fechar encerra a conversa visível, mas mantém o histórico', () => {
    aurora.abrir();
    aurora.enviar('oi');

    aurora.fechar();

    expect(aurora.aberta()).toBe(false);
    expect(aurora.mensagens().length).toBeGreaterThan(1);
  });
});
