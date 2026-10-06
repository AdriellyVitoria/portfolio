import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { ATRASO_RESPOSTA_AURORA_MS } from './core/data/local/chat-local.repository';
import { provideDados } from './core/data/provide-dados';
import { PortfolioStateService } from './core/state/portfolio-state.service';

describe('rotas do modo simples', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideDados({ fonte: 'local' }),
        provideRouter(routes, withComponentInputBinding()),
      ],
    });
  });

  it('mostra o perfil e as seções com ids das áreas', async () => {
    const harness = await RouterTestingHarness.create('/simples');
    const el = harness.routeNativeElement!;

    expect(el.querySelector('h1')?.textContent).toContain('Adrielly');
    ['livraria', 'floricultura', 'cafe', 'contato'].forEach((id) =>
      expect(el.querySelector(`#${id}`)).not.toBeNull(),
    );
  });

  it('a raiz redireciona para o modo simples', async () => {
    const harness = await RouterTestingHarness.create('/');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Adrielly');
  });

  describe('rota do projeto', () => {
    it('abre o painel do projeto e atualiza estado e título', async () => {
      const harness = await RouterTestingHarness.create('/simples/projetos/nfe-estudo');
      const el = harness.routeNativeElement!;

      expect(TestBed.inject(PortfolioStateService).projetoSelecionadoId()).toBe('nfe-estudo');
      expect(el.querySelector('dialog .painel__titulo')?.textContent).toContain('NF-e Estudo');
      expect(TestBed.inject(Title).getTitle()).toContain('NF-e Estudo');
    });

    it('fechar o painel volta para /simples e limpa a seleção', async () => {
      const harness = await RouterTestingHarness.create('/simples/projetos/nfe-estudo');

      harness.routeNativeElement!.querySelector<HTMLButtonElement>('.painel__fechar')!.click();
      await harness.fixture.whenStable();

      expect(harness.routeNativeElement!.querySelector('dialog')).toBeNull();
      expect(TestBed.inject(PortfolioStateService).projetoSelecionadoId()).toBeNull();
    });

    it('projeto inexistente redireciona para /simples', async () => {
      const harness = await RouterTestingHarness.create('/simples/projetos/nao-existe');
      await harness.fixture.whenStable();

      expect(harness.routeNativeElement!.querySelector('dialog')).toBeNull();
      expect(TestBed.inject(PortfolioStateService).projetoSelecionadoId()).toBeNull();
    });
  });
});

describe('Aurora no modo simples', () => {
  let rolagens: string[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideDados({ fonte: 'local' }),
        provideRouter(routes, withComponentInputBinding()),
        { provide: ATRASO_RESPOSTA_AURORA_MS, useValue: 0 },
      ],
    });
    // jsdom não implementa scrollIntoView: registramos para onde a página rolaria.
    rolagens = [];
    Element.prototype.scrollIntoView = function (this: Element) {
      rolagens.push(this.id);
    };
  });

  afterEach(() => {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  async function perguntar(harness: RouterTestingHarness, pergunta: string) {
    const el = harness.routeNativeElement!;
    const campo = el.querySelector<HTMLInputElement>('#aurora-pergunta')!;
    campo.value = pergunta;
    campo.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
    el.querySelector<HTMLFormElement>('#aurora form, #aurora .campo')!.requestSubmit();
    await harness.fixture.whenStable();
    return el;
  }

  it('fica na seção Café, com atalho na abertura da página', async () => {
    const harness = await RouterTestingHarness.create('/simples');
    const el = harness.routeNativeElement!;

    expect(el.querySelector('#cafe #aurora app-aurora-chat')).not.toBeNull();
    expect(el.querySelector('.hero a[href="/simples#aurora"]')).not.toBeNull();
  });

  it('"quais projetos usam Kafka?" rola até a estante filtrada', async () => {
    const harness = await RouterTestingHarness.create('/simples');

    const el = await perguntar(harness, 'quais projetos usam Kafka?');

    const estado = TestBed.inject(PortfolioStateService);
    expect(estado.filtroTecnologia()).toBe('kafka');
    expect(rolagens).toContain('livraria');
    expect(el.querySelectorAll('#livraria app-card-projeto')).toHaveLength(1);
    expect(el.querySelector('#aurora .mensagens')?.textContent).toContain('NF-e Estudo');
    // Saiu do café: aparece o atalho para voltar à conversa.
    expect(el.querySelector('.pilula-aurora')).not.toBeNull();
  });

  it('"me fala do NF-e" abre o painel do projeto pela rota', async () => {
    const harness = await RouterTestingHarness.create('/simples');

    await perguntar(harness, 'me fala do NF-e');
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/simples/projetos/nfe-estudo');
    expect(
      harness.routeNativeElement!.querySelector('dialog .painel__titulo')?.textContent,
    ).toContain('NF-e Estudo');
  });

  it('pedir o contato rola até a seção de contato', async () => {
    const harness = await RouterTestingHarness.create('/simples');

    await perguntar(harness, 'como entro em contato?');

    expect(rolagens).toContain('contato');
    expect(TestBed.inject(PortfolioStateService).painelCafe()).toBeNull();
  });
});
