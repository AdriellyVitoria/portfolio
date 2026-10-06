import { quebrarLinhas, resumirConversa } from './tela-aurora';

describe('tela do tablet da Aurora', () => {
  describe('resumirConversa', () => {
    it('sem perguntas do visitante, mostra o convite (mesmo com a saudação da Aurora)', () => {
      expect(resumirConversa([{ autor: 'AURORA', texto: 'Olá!' }], false)).toEqual({
        modo: 'convite',
      });
      expect(resumirConversa([], false)).toEqual({ modo: 'convite' });
    });

    it('enquanto a Aurora responde, mostra a pergunta e "digitando"', () => {
      const mensagens = [
        { autor: 'AURORA' as const, texto: 'Olá!' },
        { autor: 'USUARIO' as const, texto: 'projetos com Kafka?' },
      ];
      expect(resumirConversa(mensagens, true)).toEqual({
        modo: 'digitando',
        pergunta: 'projetos com Kafka?',
      });
    });

    it('depois, mostra a última pergunta e a última resposta', () => {
      const mensagens = [
        { autor: 'USUARIO' as const, texto: 'oi' },
        { autor: 'AURORA' as const, texto: 'Olá!' },
        { autor: 'USUARIO' as const, texto: 'projetos com Kafka?' },
        { autor: 'AURORA' as const, texto: 'O NF-e Estudo usa Kafka.' },
      ];
      expect(resumirConversa(mensagens, false)).toEqual({
        modo: 'conversa',
        pergunta: 'projetos com Kafka?',
        resposta: 'O NF-e Estudo usa Kafka.',
      });
    });
  });

  describe('quebrarLinhas', () => {
    // "Medidor" falso: 10 px por caractere.
    const ctx = { measureText: (t: string) => ({ width: t.length * 10 }) as TextMetrics };

    it('quebra nas palavras respeitando a largura', () => {
      expect(quebrarLinhas(ctx, 'um dois tres quatro', 90, 5)).toEqual([
        'um dois',
        'tres',
        'quatro',
      ]);
    });

    it('parte palavras maiores que a largura (ex.: e-mail)', () => {
      const linhas = quebrarLinhas(ctx, 'contato: nome.sobrenome@gmail.com', 90, 5);
      linhas.forEach((linha) => expect(linha.length * 10).toBeLessThanOrEqual(90));
      expect(linhas.join('')).toContain('gmail');
    });

    it('corta com reticências quando passa do limite de linhas', () => {
      const linhas = quebrarLinhas(ctx, 'um dois tres quatro cinco seis', 90, 2);
      expect(linhas).toHaveLength(2);
      expect(linhas[1].endsWith('…')).toBe(true);
      expect(linhas[1].length * 10).toBeLessThanOrEqual(90);
    });
  });
});
