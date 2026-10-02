import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
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
