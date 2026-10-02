import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideDados } from '../../core/data/provide-dados';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { ListaProjetosComponent } from './lista-projetos.component';

describe('ListaProjetosComponent', () => {
  async function renderizar() {
    TestBed.configureTestingModule({
      imports: [ListaProjetosComponent],
      providers: [provideDados({ fonte: 'mock' }), provideRouter([])],
    });
    const fixture = TestBed.createComponent(ListaProjetosComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const botao = (texto: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('.filtro button')].find(
        (b) => b.textContent?.trim() === texto,
      )!;
    const cards = () => el.querySelectorAll('app-card-projeto');
    return { fixture, el, botao, cards, estado: TestBed.inject(PortfolioStateService) };
  }

  it('mostra todos os projetos sem filtro', async () => {
    const { cards, botao } = await renderizar();

    expect(cards().length).toBe(5);
    expect(botao('Todas').getAttribute('aria-pressed')).toBe('true');
  });

  it('filtra pela tecnologia escolhida e atualiza o estado compartilhado', async () => {
    const { fixture, el, botao, cards, estado } = await renderizar();

    botao('Kafka').click();
    await fixture.whenStable();

    expect(estado.filtroTecnologia()).toBe('kafka');
    expect(cards().length).toBe(1);
    expect(botao('Kafka').getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.resumo')?.textContent).toContain('1 projeto com Kafka');
  });

  it('clicar de novo na tecnologia ativa limpa o filtro', async () => {
    const { fixture, botao, cards, estado } = await renderizar();

    botao('Java').click();
    await fixture.whenStable();
    botao('Java').click();
    await fixture.whenStable();

    expect(estado.filtroTecnologia()).toBeNull();
    expect(cards().length).toBe(5);
  });

  it('reage a filtros vindos de fora (ex.: floricultura ou Aurora)', async () => {
    const { fixture, cards, estado } = await renderizar();

    estado.destacarTecnologia('Angular');
    await fixture.whenStable();

    expect(cards().length).toBe(2);
  });

  it('cada card leva para a rota de detalhes do projeto', async () => {
    const { el } = await renderizar();

    const link = el.querySelector<HTMLAnchorElement>('.card__link');
    expect(link?.getAttribute('href')).toBe('/simples/projetos/projeto-exemplo-1');
  });
});
