import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideDados } from '../../core/data/provide-dados';
import { PortfolioStateService } from '../../core/state/portfolio-state.service';
import { SkillsComponent } from './skills.component';

describe('SkillsComponent', () => {
  async function renderizar() {
    TestBed.configureTestingModule({
      imports: [SkillsComponent],
      providers: [provideDados({ fonte: 'mock' }), provideRouter([])],
    });
    const fixture = TestBed.createComponent(SkillsComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const skill = (nome: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(nome),
      )!;
    return { fixture, el, skill, estado: TestBed.inject(PortfolioStateService) };
  }

  it('agrupa as skills nas quatro prateleiras', async () => {
    const { el } = await renderizar();

    const titulos = [...el.querySelectorAll('.prateleira__titulo')].map((h) =>
      h.textContent?.trim(),
    );
    expect(titulos).toEqual(['Frontend', 'Backend', 'Banco de dados', 'Outros']);
  });

  it('escolher uma skill destaca os projetos no estado e mostra o resumo', async () => {
    const { fixture, el, skill, estado } = await renderizar();

    skill('Java').click();
    await fixture.whenStable();

    expect(estado.filtroTecnologia()).toBe('java');
    expect(skill('Java').getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.feedback')?.textContent).toContain('Java aparece em 3 projetos');
  });

  it('avisa quando a skill ainda não aparece em projetos', async () => {
    const { fixture, el, skill } = await renderizar();

    skill('Git').click();
    await fixture.whenStable();

    expect(el.querySelector('.feedback')?.textContent).toContain('ainda não aparece');
    expect(el.querySelector('.feedback a')).toBeNull();
  });
});
