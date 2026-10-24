/**
 * Regras de exibição de preço da vitrine. Donas do time de preços: qualquer
 * app que mostra preço usa estas funções, para que "10x sem juros" e "-12%"
 * saiam iguais na home, na listagem e na página de produto.
 */

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 79900 → "R$ 799,00" */
export function formatBRL(cents: number): string {
  return BRL.format(cents / 100);
}

export interface InstallmentRule {
  maxInstallments: number;
  /** Valor mínimo de cada parcela, em centavos. */
  minInstallmentCents: number;
}

// Padrão da plataforma. Quando existir configuração por loja (tenant), ela
// substitui este valor.
export const DEFAULT_INSTALLMENT_RULE: InstallmentRule = {
  maxInstallments: 10,
  minInstallmentCents: 3000,
};

export interface Installments {
  count: number;
  valueCents: number;
}

/**
 * Maior número de parcelas sem juros que respeita a parcela mínima.
 * Devolve null quando não dá para parcelar (1x).
 */
export function installments(
  priceCents: number,
  rule: InstallmentRule = DEFAULT_INSTALLMENT_RULE,
): Installments | null {
  const count = Math.min(rule.maxInstallments, Math.floor(priceCents / rule.minInstallmentCents));
  if (count < 2) return null;
  return { count, valueCents: Math.round(priceCents / count) };
}

/** Desconto inteiro em % quando há preço "de" maior que o atual; senão null. */
export function discountPercent(priceCents: number, originalCents?: number | null): number | null {
  if (!originalCents || originalCents <= priceCents) return null;
  return Math.round((1 - priceCents / originalCents) * 100);
}
