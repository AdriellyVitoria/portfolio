import { TestBed } from '@angular/core/testing';

import { provideDados } from '../core/data/provide-dados';
import { AuroraService } from '../core/aurora/aurora.service';
import { PortfolioStateService } from '../core/state/portfolio-state.service';
import { ESTACOES } from './estacoes';
import { SceneBridgeService } from './scene-bridge.service';
import { type OpcoesMotor, SceneEngineService } from './scene-engine.service';

/** Motor falso: registra chamadas, sem WebGL. */
class MotorFalso {
  opcoes?: OpcoesMotor;
  irPara = vi.fn();
  montarDados = vi.fn();
  destruir = vi.fn();
  livraria = { destacar: vi.fn(), selecionar: vi.fn() };
  floricultura = { selecionar: vi.fn() };
  cafe = { marcarAberto: vi.fn(), marcarSobCursor: vi.fn(), marcarSinoSobCursor: vi.fn() };
  iniciar(_canvas: HTMLCanvasElement, opcoes: OpcoesMotor) {
    this.opcoes = opcoes;
  }
}

describe('SceneBridgeService', () => {
  let motor: MotorFalso;
  let estado: PortfolioStateService;
  let ponte: SceneBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideDados({ fonte: 'local' }),
        SceneBridgeService,
        { provide: SceneEngineService, useClass: MotorFalso },
      ],
    });
    motor = TestBed.inject(SceneEngineService) as unknown as MotorFalso;
    estado = TestBed.inject(PortfolioStateService);
    ponte = TestBed.inject(SceneBridgeService);
    ponte.conectar(document.createElement('canvas'));
    TestBed.tick();
  });

  describe('cena → estado', () => {
    it('clicar num livro abre o projeto e vai para a livraria', () => {
      motor.opcoes!.callbacks.aoSelecionar({
        tipo: 'projeto',
        id: 'nfe-estudo',
        rotulo: '',
      });

      expect(estado.areaAtual()).toBe('livraria');
      expect(estado.projetoSelecionadoId()).toBe('nfe-estudo');
    });

    it('clicar num vaso escolhe a categoria; clicar de novo volta às categorias', () => {
      const vaso = { tipo: 'categoria' as const, id: 'BACKEND' as const, rotulo: 'Backend' };

      motor.opcoes!.callbacks.aoSelecionar(vaso);
      expect(estado.categoriaSkill()).toBe('BACKEND');
      expect(estado.areaAtual()).toBe('floricultura');

      motor.opcoes!.callbacks.aoSelecionar(vaso);
      expect(estado.categoriaSkill()).toBeNull();
    });

    it('clicar num objeto do café abre o painel correspondente', () => {
      motor.opcoes!.callbacks.aoSelecionar({ tipo: 'cafe', id: 'trajetoria', rotulo: '' });

      expect(estado.painelCafe()).toBe('trajetoria');
    });

    it('tocar o sino leva até a Aurora e abre a conversa', () => {
      motor.opcoes!.callbacks.aoSelecionar({ tipo: 'aurora', id: 'aurora', rotulo: '' });

      expect(estado.areaAtual()).toBe('aurora');
      expect(TestBed.inject(AuroraService).aberta()).toBe(true);
    });

    it('hover mostra o nome do objeto perto do cursor', () => {
      motor.opcoes!.callbacks.aoPassar(
        { tipo: 'categoria', id: 'BACKEND', rotulo: 'Java' },
        10,
        20,
      );
      expect(ponte.dicaCursor()).toEqual({ rotulo: 'Java', x: 10, y: 20 });

      motor.opcoes!.callbacks.aoPassar(null, 0, 0);
      expect(ponte.dicaCursor()).toBeNull();
    });
  });

  describe('estado → cena', () => {
    it('gera livros e vasos a partir dos dados', () => {
      expect(motor.montarDados).toHaveBeenCalledWith(estado.projetos(), estado.skills());
    });

    it('trocar de área move a câmera', () => {
      estado.irPara('cafe');
      TestBed.tick();

      expect(motor.irPara).toHaveBeenLastCalledWith(ESTACOES.cafe);
    });

    it('um filtro vindo de fora (modo simples, Aurora) acende os livros na cena', () => {
      estado.destacarTecnologia('Apache Kafka');
      TestBed.tick();

      expect(motor.livraria.destacar).toHaveBeenLastCalledWith(new Set(['nfe-estudo']));
      expect(motor.floricultura.selecionar).toHaveBeenLastCalledWith('MENSAGERIA');
    });
  });

  it('desconectar destrói o motor e para de reagir ao estado', () => {
    ponte.desconectar();
    motor.irPara.mockClear();

    estado.irPara('livraria');
    TestBed.tick();

    expect(motor.destruir).toHaveBeenCalled();
    expect(motor.irPara).not.toHaveBeenCalled();
  });
});

describe('SceneBridgeService sem conectar (SSR)', () => {
  it('desconectar não toca no motor quando a cena nunca foi conectada', () => {
    TestBed.configureTestingModule({
      providers: [
        provideDados({ fonte: 'local' }),
        SceneBridgeService,
        { provide: SceneEngineService, useClass: MotorFalso },
      ],
    });
    const motor = TestBed.inject(SceneEngineService) as unknown as MotorFalso;

    TestBed.inject(SceneBridgeService).desconectar();

    expect(motor.destruir).not.toHaveBeenCalled();
  });
});
