import { Router, Request, Response } from 'express';
import type { SQLInputValue } from 'node:sqlite';
import { consultar, buscar } from '../dados/banco';

const router = Router();

// sprint 2 (S06): relatórios filtrados pro gestor analisar o consumo.
// Endpoint novo → já nasce com paginação { dados, total, pagina, totalPaginas } (S10).
function montarFiltros(req: Request): { where: string; params: SQLInputValue[] } {
  const condicoes: string[] = [];
  const params: SQLInputValue[] = [];

  // filtros diretos por id
  for (const [query, coluna] of [
    ['veiculoId', 'a.veiculoId'],
    ['postoId', 'a.postoId'],
    ['motoristaId', 'a.motoristaId'],
  ] as const) {
    const valor = req.query[query];
    if (valor !== undefined && valor !== '') {
      const numero = Number(valor);
      if (!Number.isFinite(numero)) continue; 
      condicoes.push(`${coluna} = ?`);
      params.push(numero);
    }
  }

  // período explícito: de/ate (YYYY-MM-DD)
  const de = String(req.query.de ?? '');
  const ate = String(req.query.ate ?? '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(de)) {
    condicoes.push('date(a.dataHora) >= date(?)');
    params.push(de);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(ate)) {
    condicoes.push('date(a.dataHora) <= date(?)');
    params.push(ate);
  }

  // período relativo: periodo=diario|semanal|mensal|anual (a partir de hoje, UTC)
  const periodo = String(req.query.periodo ?? '');
  const dias: Record<string, number> = { diario: 1, semanal: 7, mensal: 31, anual: 365 };
  if (periodo in dias) {
    condicoes.push('date(a.dataHora) >= date(?, ?)');
    params.push(new Date().toISOString().slice(0, 10), `-${dias[periodo]} days`);
  }

  return {
    where: condicoes.length ? `where ${condicoes.join(' and ')}` : '',
    params,
  };
}

router.get('/', (req: Request, res: Response) => {
  const { where, params } = montarFiltros(req);

  // paginação sempre presente (padrão 20 por página)
  const pagina = Math.max(1, Number(req.query.pagina) || 1);
  const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 20));

  const total = buscar<{ n: number }>(
    `select count(*) as n from abastecimentos a ${where}`,
    ...params
  )!.n;

  // tabela consolidada: linha por abastecimento com nomes resolvidos
  const dados = consultar(
    `select a.id, a.dataHora, a.litros, a.valorTotal, a.quilometragem,
            m.nome as motorista,
            v.placa || ' — ' || v.modelo as veiculo,
            p.nome as posto
       from abastecimentos a
       join motoristas m on m.id = a.motoristaId
       join veiculos v on v.id = a.veiculoId
       left join postos p on p.id = a.postoId
       ${where}
      order by a.dataHora desc
      limit ? offset ?`,
    ...params,
    limite,
    (pagina - 1) * limite
  );

  // resumo do filtro inteiro (não só da página): litros, valorTotal e média
  const resumo = buscar<{ litros: number | null; valorTotal: number | null; n: number }>(
    `select sum(a.litros) as litros, sum(a.valorTotal) as valorTotal, count(*) as n
       from abastecimentos a ${where}`,
    ...params
  )!;

  const litros = resumo.litros ?? 0;
  const valorTotal = resumo.valorTotal ?? 0;

  res.status(200).json({
    dados,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / limite)),
    resumo: {
      litros,
      valorTotal,
      mediaLitros: resumo.n > 0 ? litros / resumo.n : 0,
      mediaValor: resumo.n > 0 ? valorTotal / resumo.n : 0,
    },
  });
});


router.get('/csv', (req: Request, res: Response) => {
  const { where, params } = montarFiltros(req);

  const linhas = consultar<Record<string, SQLInputValue>>(
    `select a.dataHora, a.litros, a.valorTotal, a.quilometragem,
            m.nome as motorista,
            v.placa as placa, v.modelo as veiculo,
            p.nome as posto
       from abastecimentos a
       join motoristas m on m.id = a.motoristaId
       join veiculos v on v.id = a.veiculoId
       left join postos p on p.id = a.postoId
       ${where}
      order by a.dataHora desc`,
    ...params
  );

  const cabecalho = 'dataHora;litros;valorTotal;quilometragem;motorista;placa;veiculo;posto';
  const corpo = linhas.map((l) =>
    [l.dataHora, l.litros, l.valorTotal, l.quilometragem, l.motorista, l.placa, l.veiculo, l.posto ?? '']
      .map((campo) => `"${String(campo).replace(/"/g, '""')}"`)
      .join(';')
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="relatorio-abastecimentos.csv"');
  res.status(200).send(`﻿${[cabecalho, ...corpo].join('\r\n')}`);
});

// sprint 2 (S07): custo médio por veículo no mês atual (+ comparativo do mês anterior)
router.get('/custo-medio', (req: Request, res: Response) => {
  // mês atual: do dia 1 até hoje; mês anterior: do dia 1 do mês passado até o fim
  const hoje = new Date();
  const inicioMes = `${hoje.toISOString().slice(0, 7)}-01`;
  const fimMesAnterior = `${hoje.toISOString().slice(0, 7)}-01`;
  const inicioMesAnterior = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - 1, 1))
    .toISOString()
    .slice(0, 10);

  const atual = consultar(
    `select a.veiculoId,
            v.placa || ' — ' || v.modelo as veiculo,
            sum(a.litros) as litros,
            sum(a.valorTotal) as valorTotal,
            avg(a.litros) as mediaLitros,
            avg(a.valorTotal) as mediaValor
       from abastecimentos a
       join veiculos v on v.id = a.veiculoId
      where date(a.dataHora) >= date(?)
      group by a.veiculoId
      order by valorTotal desc`,
    inicioMes
  );

  const anterior = consultar<{ veiculoId: number; valorTotal: number }>(
    `select a.veiculoId, sum(a.valorTotal) as valorTotal
       from abastecimentos a
      where date(a.dataHora) >= date(?) and date(a.dataHora) < date(?)
      group by a.veiculoId`,
    inicioMesAnterior,
    fimMesAnterior
  );
  const anteriorPorVeiculo = new Map(anterior.map((l) => [l.veiculoId, l.valorTotal]));

  res.status(200).json({
    mes: inicioMes.slice(0, 7),
    mesAnterior: inicioMesAnterior.slice(0, 7),
    dados: atual.map((l: any) => ({
      ...l,
      valorTotalAnterior: anteriorPorVeiculo.get(l.veiculoId) ?? 0,
    })),
  });
});

export default router;
