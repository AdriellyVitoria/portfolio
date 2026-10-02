import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideDados } from '../../core/data/provide-dados';
import { CATEGORIAS_SKILL } from '../../core/models';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { SkillsComponent } from './skills.component';

describe('SkillsComponent', () => {
  async function renderizar() {
    TestBed.configureTestingModule({
      imports: [SkillsComponent],
      providers: [provideDados({ fonte: 'local' }), provideRouter([])],
    });
    const fixture = TestBed.createComponent(SkillsComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const skill = (nome: string) =>
      // Nome exato, ignorando a contagem de projetos no fim ("Java 4" ≠ "JavaScript 1").
      [...el.querySelectorAll<HTMLButtonElement>('button')].find(
        (b) => b.textContent?.replace(/\d+\s*$/, '').trim() === nome,
      )!;
    return { fixture, el, skill, estado: TestBed.inject(PortfolioStateService) };
  }

  it('agrupa as skills nas prateleiras das categorias do currículo', async () => {
    const { el } = await renderizar();

    const titulos = [...el.querySelectorAll('.prateleira__titulo')].map((h) =>
      h.textContent?.trim(),
    );
    expect(titulos).toEqual(CATEGORIAS_SKILL.map((c) => c.rotulo));
  });

  it('escolher uma skill destaca os projetos no estado e mostra o resumo', async () => {
    const { fixture, el, skill, estado } = await renderizar();

    skill('Java').click();
    await fixture.whenStable();

    expect(estado.filtroTecnologia()).toBe('java');
    expect(skill('Java').getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.feedback')?.textContent).toContain('Java aparece em 4 projetos');
  });

  it('avisa quando a skill ainda não aparece em projetos', async () => {
    const { fixture, el, skill } = await renderizar();

    skill('Jenkins').click();
    await fixture.whenStable();

    expect(el.querySelector('.feedback')?.textContent).toContain('ainda não aparece');
    expect(el.querySelector('.feedback a')).toBeNull();
  });
});
