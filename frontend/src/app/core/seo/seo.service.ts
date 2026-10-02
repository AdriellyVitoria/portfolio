import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface DadosSeo {
  titulo: string;
  descricao: string;
}

export const SEO_PADRAO: DadosSeo = {
  titulo: 'Adrielly Vitória — Desenvolvedora Full Stack',
  descricao:
    'Portfólio de Adrielly Vitória, desenvolvedora Full Stack: Java, Spring Boot, APIs REST, microserviços, Kafka, PostgreSQL e Angular.',
};

/** Título, descrição e Open Graph. Roda também no prerender, então vai para o HTML estático. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  atualizar({ titulo, descricao }: DadosSeo = SEO_PADRAO): void {
    this.title.setTitle(titulo);
    this.meta.updateTag({ name: 'description', content: descricao });
    this.meta.updateTag({ property: 'og:title', content: titulo });
    this.meta.updateTag({ property: 'og:description', content: descricao });
  }
}
