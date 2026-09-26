// Espelha web/tracocultural/src/constants/estados.js — nomes completos dos
// estados brasileiros e a conversão nome -> UF usada na geolocalização
// (o reverse geocode devolve o nome do estado, não a sigla).
export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
] as const;

export const NOMES_ESTADOS: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia',
  RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe',
  TO: 'Tocantins',
};

const UF_POR_NOME: Record<string, string> = Object.fromEntries(
  Object.entries(NOMES_ESTADOS).map(([uf, nome]) => [nome, uf])
);

/**
 * Converte o que o reverse geocoding devolve (nome do estado por extenso,
 * em pt-BR, no iOS — ou já a sigla, em alguns casos do Android) em UF.
 */
export function ufPorNomeEstado(regiao?: string | null): string | null {
  if (!regiao) return null;
  const normalizado = regiao.trim();
  if (UFS.includes(normalizado.toUpperCase() as (typeof UFS)[number])) {
    return normalizado.toUpperCase();
  }
  return UF_POR_NOME[normalizado] || null;
}
