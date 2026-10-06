import { Injectable, inject } from '@angular/core';

import type { Acao } from '../models';
import { PortfolioStateService } from '../state/portfolio-state.service';

/**
 * Executa as ações devolvidas pela Aurora (padrão Command).
 * Só altera o estado: quem reage é a cena 3D (câmera, livros) ou o modo simples
 * (rolagem, painel). O executor não sabe em qual dos dois está rodando.
 */
@Injectable({ providedIn: 'root' })
export class AcaoExecutorService {
  private readonly estado = inject(PortfolioStateService);

  executar(acoes: readonly Acao[]): void {
    for (const acao of acoes) {
      this.executarUma(acao);
    }
  }

  private executarUma(acao: Acao): void {
    switch (acao.tipo) {
      case 'NAVEGAR':
        this.estado.irPara(acao.destino);
        break;
      case 'DESTACAR_PROJETOS':
        this.estado.destacarTecnologia(acao.tecnologia);
        break;
      case 'LIMPAR_DESTAQUE':
        this.estado.limparDestaque();
        break;
      case 'ABRIR_PROJETO':
        this.estado.selecionarProjeto(acao.projetoId);
        break;
      case 'ABRIR_PAINEL':
        this.estado.abrirPainelCafe(acao.painel);
        break;
      default:
        // Ação desconhecida (ex.: backend mais novo que o front): ignora sem quebrar.
        console.warn('Aurora: ação desconhecida ignorada', acao);
    }
  }
}
