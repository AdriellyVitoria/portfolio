import { type Camera, type Object3D, Raycaster, Vector2 } from 'three';

import { type AlvoInterativo, alvoDe } from './tipos';

// Acima disso (em pixels), o gesto conta como arrasto e não como clique.
const TOLERANCIA_CLIQUE = 6;

export interface CallbacksInteracao {
  aoSelecionar(alvo: AlvoInterativo): void;
  /** `alvo` nulo quando o ponteiro sai de um objeto clicável. */
  aoPassar(alvo: AlvoInterativo | null, x: number, y: number): void;
  aoArrastar(dx: number, dy: number): void;
  aoSoltar(): void;
}

/**
 * Converte eventos de ponteiro do canvas (mouse, toque, caneta) em:
 * clique num objeto, hover e arrasto de câmera.
 * Só testa os objetos clicáveis e os oclusores (paredes), não a cena inteira:
 * os oclusores impedem clicar num livro "através" da parede.
 */
export class Interacao {
  private readonly raycaster = new Raycaster();
  private readonly ponteiro = new Vector2();
  private testaveis: Object3D[] = [];
  private alvoSobCursor: AlvoInterativo | null = null;

  private inicio: { x: number; y: number } | null = null;
  private ultimo = { x: 0, y: 0 };
  private arrastou = false;

  private readonly ouvintes: [keyof HTMLElementEventMap, (e: PointerEvent) => void][] = [
    ['pointerdown', (e) => this.aoPressionar(e)],
    ['pointermove', (e) => this.aoMover(e)],
    ['pointerup', (e) => this.aoLevantar(e)],
    ['pointercancel', () => this.cancelar()],
    ['pointerleave', () => this.sair()],
  ];

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: Camera,
    private readonly callbacks: CallbacksInteracao,
  ) {
    this.ouvintes.forEach(([tipo, fn]) =>
      canvas.addEventListener(tipo, fn as EventListener, { passive: true }),
    );
  }

  definirAlvos(alvos: Object3D[], oclusores: Object3D[] = []): void {
    this.testaveis = [...alvos, ...oclusores];
  }

  destruir(): void {
    this.ouvintes.forEach(([tipo, fn]) =>
      this.canvas.removeEventListener(tipo, fn as EventListener),
    );
  }

  private aoPressionar(e: PointerEvent): void {
    this.inicio = { x: e.clientX, y: e.clientY };
    this.ultimo = { ...this.inicio };
    this.arrastou = false;
    this.canvas.setPointerCapture?.(e.pointerId);
  }

  private aoMover(e: PointerEvent): void {
    if (this.inicio) {
      if (
        !this.arrastou &&
        Math.hypot(e.clientX - this.inicio.x, e.clientY - this.inicio.y) > TOLERANCIA_CLIQUE
      ) {
        this.arrastou = true;
      }
      if (this.arrastou) {
        this.callbacks.aoArrastar(e.clientX - this.ultimo.x, e.clientY - this.ultimo.y);
      }
      this.ultimo = { x: e.clientX, y: e.clientY };
      return;
    }
    // Hover só faz sentido com mouse.
    if (e.pointerType === 'mouse') {
      const alvo = this.testar(e.clientX, e.clientY);
      if (alvo !== this.alvoSobCursor || alvo) {
        this.alvoSobCursor = alvo;
        this.canvas.style.cursor = alvo ? 'pointer' : 'grab';
        this.callbacks.aoPassar(alvo, e.clientX, e.clientY);
      }
    }
  }

  private aoLevantar(e: PointerEvent): void {
    if (this.inicio && !this.arrastou) {
      const alvo = this.testar(e.clientX, e.clientY);
      if (alvo) {
        this.callbacks.aoSelecionar(alvo);
      }
    }
    this.cancelar();
  }

  private cancelar(): void {
    if (this.arrastou) {
      this.callbacks.aoSoltar();
    }
    this.inicio = null;
    this.arrastou = false;
  }

  private sair(): void {
    if (this.alvoSobCursor) {
      this.alvoSobCursor = null;
      this.callbacks.aoPassar(null, 0, 0);
    }
  }

  /** Raycasting: do ponto clicado na tela para dentro da cena. */
  private testar(clientX: number, clientY: number): AlvoInterativo | null {
    const caixa = this.canvas.getBoundingClientRect();
    this.ponteiro.set(
      ((clientX - caixa.left) / caixa.width) * 2 - 1,
      -((clientY - caixa.top) / caixa.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ponteiro, this.camera);
    const [primeiro] = this.raycaster.intersectObjects(this.testaveis, false);
    return alvoDe(primeiro?.object) ?? null;
  }
}
