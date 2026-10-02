import { MesAnoPipe } from './mes-ano.pipe';

describe('MesAnoPipe', () => {
  const pipe = new MesAnoPipe();

  it('formata YYYY-MM em português', () => {
    expect(pipe.transform('2024-01')).toMatch(/jan.*2024/);
    expect(pipe.transform('2023-12')).toMatch(/dez.*2023/);
  });

  it('usa o fallback quando não há data', () => {
    expect(pipe.transform(undefined, 'atual')).toBe('atual');
  });

  it('usa o fallback para formato inválido', () => {
    expect(pipe.transform('01/2024', '—')).toBe('—');
  });
});
