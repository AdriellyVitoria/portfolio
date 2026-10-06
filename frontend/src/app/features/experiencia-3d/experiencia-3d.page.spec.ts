import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideDados } from '../../core/data/provide-dados';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import Experiencia3dPage from './experiencia-3d.page';

// jsdom não tem WebGL: a página precisa cair no aviso com link para a versão simples,
// e a interface (menu de estações, listas, painéis) continua funcionando.
describe('Experiencia3dPage', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  async function renderizar() {
    TestBed.configureTestingModule({
      imports: [Experiencia3dPage],
      providers: [provideDados({ fonte: 'local' }), provideRouter([])],
    });
    const fixture = TestBed.createComponent(Experiencia3dPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const botao = (texto: string) =>
      // Ignora as placas presas à cena (.rotulo): o teste usa o HUD e o menu.
      [...el.querySelectorAll<HTMLButtonElement>('button:not(.rotulo)')].find((b) =>
        b.textContent?.trim().startsWith(texto),
      )!;
    return { fixture, el, botao, estado: TestBed.inject(PortfolioStateService) };
  }

  it('sem WebGL, mostra o aviso com link para a versão simples', async () => {
    const { el } = await renderizar();

    expect(el.querySelector('.aviso-tela')?.textContent).toContain('não conseguiu abrir');
    expect(el.querySelector('.aviso-tela a')?.getAttribute('href')).toBe('/simples');
  });

  it('o menu de estações troca a área no estado', async () => {
    const { fixture, botao, estado } = await renderizar();

    botao('Floricultura').click();
    await fixture.whenStable();

    expect(estado.areaAtual()).toBe('floricultura');
    expect(botao('Floricultura').getAttribute('aria-current')).toBe('location');
  });

  it('na livraria, a lista de projetos abre o painel (caminho por teclado)', async () => {
    const { fixture, el, botao } = await renderizar();

    botao('Livraria').click();
    await fixture.whenStable();
    botao('NF-e Estudo').click();
    await fixture.whenStable();

    expect(el.querySelector('dialog .painel__titulo')?.textContent).toContain('NF-e Estudo');
  });

  it('no café, a pasta abre contato e currículo', async () => {
    const { fixture, el, botao } = await renderizar();

    botao('Café').click();
    await fixture.whenStable();
    botao('Pasta').click();
    await fixture.whenStable();

    expect(el.querySelector('dialog .painel__titulo')?.textContent).toContain('Contato');
    expect(el.querySelector('dialog app-contato')).not.toBeNull();
  });

  describe('Aurora', () => {
    it('só pode ser chamada no café: o sino abre o painel e leva ao balcão', async () => {
      const { fixture, el, botao, estado } = await renderizar();
      expect(botao('Sino')).toBeUndefined(); // fora do café não há como iniciar a conversa

      botao('Café').click();
      await fixture.whenStable();
      botao('Sino').click();
      await fixture.whenStable();

      expect(estado.areaAtual()).toBe('aurora');
      expect(el.querySelector('app-aurora-chat')).not.toBeNull();
      expect(botao('Café').getAttribute('aria-current')).toBe('location');
    });

    it('sair do café recolhe a conversa, e a pílula volta para ela', async () => {
      const { fixture, el, botao, estado } = await renderizar();
      botao('Café').click();
      await fixture.whenStable();
      botao('Sino').click();
      await fixture.whenStable();

      botao('Livraria').click();
      await fixture.whenStable();
      expect(el.querySelector('app-aurora-chat')).toBeNull();

      el.querySelector<HTMLButtonElement>('app-aurora-pilula button')!.click();
      await fixture.whenStable();
      expect(estado.areaAtual()).toBe('aurora');
      expect(el.querySelector('app-aurora-chat')).not.toBeNull();
    });
  });
});

describe('Experiencia3dPage — placas presas à cena', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    TestBed.configureTestingModule({
      imports: [Experiencia3dPage],
      providers: [provideDados({ fonte: 'local' }), provideRouter([])],
    });
  });

  it('tem a fachada, as três placas de seção e uma etiqueta por categoria', async () => {
    const fixture = TestBed.createComponent(Experiencia3dPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[approtulocena="fachada"], app-placa-fachada')).not.toBeNull();
    expect(el.querySelectorAll('app-placa-secao')).toHaveLength(3);
    expect(el.querySelectorAll('app-etiqueta-skill')).toHaveLength(7);
  });

  it('a etiqueta de uma categoria escolhe a categoria e leva à floricultura', async () => {
    const fixture = TestBed.createComponent(Experiencia3dPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const estado = TestBed.inject(PortfolioStateService);

    const etiqueta = [...el.querySelectorAll<HTMLButtonElement>('button.rotulo')].find((b) =>
      b.textContent?.includes('Backend'),
    )!;
    etiqueta.click();
    await fixture.whenStable();

    expect(estado.areaAtual()).toBe('floricultura');
    expect(estado.categoriaSkill()).toBe('BACKEND');
    expect(etiqueta.getAttribute('aria-pressed')).toBe('true');
  });
});
