/**
 * Remove acentos e normaliza caixa. Usado em toda a Home para comparar
 * categorias, cidades e texto de busca sem depender de acento/maiúscula
 * exatos (ex: "Educação" vs "educação" vs "EDUCACAO").
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}