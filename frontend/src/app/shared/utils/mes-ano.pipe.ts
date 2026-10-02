import { Pipe, type PipeTransform } from '@angular/core';

const formato = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** 'YYYY-MM' → 'jan. de 2024'. Valor vazio vira o texto de fallback (ex.: 'atual'). */
@Pipe({ name: 'mesAno' })
export class MesAnoPipe implements PipeTransform {
  transform(valor: string | undefined, fallback = ''): string {
    const partes = valor?.match(/^(\d{4})-(\d{2})$/);
    if (!partes) {
      return fallback;
    }
    const [, ano, mes] = partes;
    return formato.format(new Date(Date.UTC(Number(ano), Number(mes) - 1, 1)));
  }
}
