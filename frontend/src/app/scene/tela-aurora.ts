import type { MensagemChat } from '../core/models';

/** O que a tela do tablet mostra. A cena recebe só isto, não o serviço da Aurora. */
export interface TelaAurora {
  modo: 'convite' | 'conversa' | 'digitando';
  pergunta?: string;
  resposta?: string;
}

/**
 * Resume a conversa para a tela: sem perguntas do visitante, mostra o convite;
 * depois, a última pergunta e a última fala da Aurora (ou "digitando…").
 */
export function resumirConversa(
  mensagens: readonly MensagemChat[],
  digitando: boolean,
): TelaAurora {
  const ultimaPergunta = [...mensagens].reverse().find((m) => m.autor === 'USUARIO');
  if (!ultimaPergunta) {
    return { modo: 'convite' };
  }
  if (digitando) {
    return { modo: 'digitando', pergunta: ultimaPergunta.texto };
  }
  const ultimaResposta = [...mensagens].reverse().find((m) => m.autor === 'AURORA');
  return { modo: 'conversa', pergunta: ultimaPergunta.texto, resposta: ultimaResposta?.texto };
}

const CORES = {
  fundo: '#fbf6ee',
  faixa: '#3f5634',
  creme: '#f6ecdb',
  texto: '#24160f',
  suave: '#6a5446',
  acao: '#a44d32',
  balao: '#f3e6d2',
  verde: '#3f5634',
  terracota: '#b85a3c',
};
const FONTE_TITULO = '"Fraunces Variable", Georgia, serif';
const FONTE_TEXTO = '"Inter Variable", system-ui, sans-serif';

/** Quebra o texto em linhas que cabem na largura; corta com reticências após `maxLinhas`. */
export function quebrarLinhas(
  ctx: Pick<CanvasRenderingContext2D, 'measureText'>,
  texto: string,
  largura: number,
  maxLinhas: number,
): string[] {
  const palavras = texto
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((palavra) => partirPalavraLonga(ctx, palavra, largura));
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (ctx.measureText(tentativa).width > largura && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = tentativa;
    }
  }
  if (atual) linhas.push(atual);
  if (linhas.length <= maxLinhas) return linhas;

  const cortadas = linhas.slice(0, maxLinhas);
  let ultima = cortadas[maxLinhas - 1];
  while (ultima.length > 1 && ctx.measureText(`${ultima}…`).width > largura) {
    ultima = ultima.slice(0, -1);
  }
  cortadas[maxLinhas - 1] = `${ultima.trimEnd()}…`;
  return cortadas;
}

/** Parte uma palavra que não cabe na largura em pedaços que cabem. */
function partirPalavraLonga(
  ctx: Pick<CanvasRenderingContext2D, 'measureText'>,
  palavra: string,
  largura: number,
): string[] {
  if (ctx.measureText(palavra).width <= largura) return [palavra];
  const pedacos: string[] = [];
  let atual = '';
  for (const letra of palavra) {
    if (ctx.measureText(atual + letra).width > largura && atual) {
      pedacos.push(atual);
      atual = letra;
    } else {
      atual += letra;
    }
  }
  if (atual) pedacos.push(atual);
  return pedacos;
}

/** Desenha a tela do tablet no canvas (o mesmo canvas é reaproveitado a cada mudança). */
export function desenharTelaAurora(ctx: CanvasRenderingContext2D, tela: TelaAurora): void {
  const { width: largura, height: altura } = ctx.canvas;
  const margem = 28;

  ctx.fillStyle = CORES.fundo;
  ctx.fillRect(0, 0, largura, altura);

  // Faixa do topo.
  ctx.fillStyle = CORES.faixa;
  ctx.fillRect(0, 0, largura, 62);
  ctx.fillStyle = CORES.creme;
  ctx.font = `800 24px ${FONTE_TEXTO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CONSULTA IA · AURORA', largura / 2, 32);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (tela.modo === 'convite') {
    desenharAvatar(ctx, margem + 40, 128, 40);
    ctx.fillStyle = CORES.texto;
    ctx.font = `700 30px ${FONTE_TITULO}`;
    ctx.fillText('Olá! Eu sou a Aurora.', margem + 100, 92);
    ctx.fillStyle = CORES.suave;
    ctx.font = `500 21px ${FONTE_TEXTO}`;
    quebrarLinhas(
      ctx,
      'Pergunte sobre projetos, skills e trajetória.',
      largura - margem - 128,
      2,
    ).forEach((linha, i) => ctx.fillText(linha, margem + 100, 134 + i * 28));
    // Pílula "Toque para conversar".
    const pilula = { largura: 290, altura: 50 };
    const x = (largura - pilula.largura) / 2;
    const y = altura - pilula.altura - 26;
    ctx.fillStyle = CORES.acao;
    arredondado(ctx, x, y, pilula.largura, pilula.altura, 25);
    ctx.fill();
    ctx.fillStyle = CORES.creme;
    ctx.font = `700 22px ${FONTE_TEXTO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Toque para conversar', largura / 2, y + pilula.altura / 2 + 1);
    return;
  }

  // Última pergunta (uma linha, pequena).
  ctx.fillStyle = CORES.suave;
  ctx.font = `600 19px ${FONTE_TEXTO}`;
  const [pergunta] = quebrarLinhas(ctx, `Você: ${tela.pergunta ?? ''}`, largura - margem * 2, 1);
  ctx.fillText(pergunta, margem, 80);

  // Balão da Aurora.
  const balao = { x: margem, y: 114, largura: largura - margem * 2, altura: altura - 114 - 22 };
  ctx.fillStyle = CORES.balao;
  arredondado(ctx, balao.x, balao.y, balao.largura, balao.altura, 18);
  ctx.fill();
  desenharAvatar(ctx, balao.x + 32, balao.y + 34, 20);

  if (tela.modo === 'digitando') {
    ctx.fillStyle = CORES.suave;
    [0, 1, 2].forEach((i) => {
      ctx.beginPath();
      ctx.arc(balao.x + 78 + i * 22, balao.y + 36, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    return;
  }

  ctx.fillStyle = CORES.texto;
  ctx.font = `500 22px ${FONTE_TEXTO}`;
  quebrarLinhas(ctx, tela.resposta ?? '', balao.largura - 80, 5).forEach((linha, i) =>
    ctx.fillText(linha, balao.x + 64, balao.y + 18 + i * 29),
  );
}

/** Avatar 2D da Aurora (o mesmo desenho do chat): rosto com óculos redondos. */
function desenharAvatar(ctx: CanvasRenderingContext2D, x: number, y: number, raio: number): void {
  const e = raio / 20;
  ctx.save();
  ctx.translate(x - raio, y - raio);
  ctx.scale(e, e);
  ctx.fillStyle = CORES.verde;
  ctx.beginPath();
  ctx.arc(20, 20, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = CORES.terracota;
  ctx.beginPath();
  ctx.moveTo(8, 17);
  ctx.bezierCurveTo(9, 10, 14, 6, 20, 6);
  ctx.bezierCurveTo(26, 6, 31, 10, 32, 17);
  ctx.bezierCurveTo(29, 14, 25, 13, 20, 13);
  ctx.bezierCurveTo(15, 13, 11, 14, 8, 17);
  ctx.fill();
  ctx.strokeStyle = CORES.creme;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(14.5, 21, 4, 0, Math.PI * 2);
  ctx.moveTo(29.5, 21);
  ctx.arc(25.5, 21, 4, 0, Math.PI * 2);
  ctx.moveTo(18.5, 21);
  ctx.lineTo(21.5, 21);
  ctx.moveTo(15, 29);
  ctx.quadraticCurveTo(20, 32, 25, 29);
  ctx.stroke();
  ctx.restore();
}

function arredondado(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
  raio: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, largura, altura, raio);
}
