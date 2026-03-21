import { OrcamentoItemCompleto } from "../models";

/**
 * Calcula os valores totais de cada item (quantidade * valor unitario)
 * e retorna os itens com os totais preenchidos.
 */
export function calcularItens(
  itens: OrcamentoItemCompleto[]
): OrcamentoItemCompleto[] {
  return itens.map((item) => ({
    ...item,
    descricao: item.descricao.trim(),
    valorTotalMaoDeObra: item.quantidade * item.valorUnitarioMaoDeObra,
    valorTotalMaterial: item.quantidade * item.valorUnitarioMaterial,
    valorTotal:
      item.quantidade *
      (item.valorUnitarioMaoDeObra + item.valorUnitarioMaterial),
  }));
}

/**
 * Dado um array de itens ja calculados, retorna os totais agregados.
 */
export function calcularTotais(itensCalculados: OrcamentoItemCompleto[]): {
  valorTotalMaoDeObra: number;
  valorTotalMaterial: number;
  valorTotal: number;
} {
  const valorTotalMaoDeObra = itensCalculados.reduce(
    (acc, item) => acc + item.valorTotalMaoDeObra,
    0
  );
  const valorTotalMaterial = itensCalculados.reduce(
    (acc, item) => acc + item.valorTotalMaterial,
    0
  );
  const valorTotal = valorTotalMaoDeObra + valorTotalMaterial;

  return { valorTotalMaoDeObra, valorTotalMaterial, valorTotal };
}
