import { Abastecimento } from '../tipos';
import { consultar, buscar, executar } from './banco';

export function listarAbastecimentos(): Abastecimento[] {
  return consultar<Abastecimento>('select * from abastecimentos order by id desc');
}

/** sprint 2 (S10): paginação opt-in — só quem pede ?pagina= recebe este formato. */
export interface ListagemPaginada<T> {
  dados: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export function listarAbastecimentosPaginado(
  pagina: number,
  limite: number
): ListagemPaginada<Abastecimento> {
  const total = buscar<{ n: number }>('select count(*) as n from abastecimentos')!.n;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const dados = consultar<Abastecimento>(
    'select * from abastecimentos order by id desc limit ? offset ?',
    limite,
    (pagina - 1) * limite
  );
  return { dados, total, pagina, totalPaginas };
}

/** O que o cidadão vê: já resolve os nomes. Sem CNH, telefone ou hash. */
export interface AbastecimentoPublico {
  id: number;
  dataHora: string;
  litros: number;
  valorTotal: number;
  quilometragem: number;
  motorista: string;
  veiculo: string;
  posto: string | null;
}

export function listarPublico(): AbastecimentoPublico[] {
  return consultar<AbastecimentoPublico>(
    `select a.id, a.dataHora, a.litros, a.valorTotal, a.quilometragem,
            m.nome as motorista,
            v.placa || ' — ' || v.modelo as veiculo,
            p.nome as posto
       from abastecimentos a
       join motoristas m on m.id = a.motoristaId
       join veiculos v on v.id = a.veiculoId
       left join postos p on p.id = a.postoId
      order by a.id desc`
  );
}

export function criarAbastecimento(
  dados: Omit<Abastecimento, 'id' | 'dataHora'>
): Abastecimento {
  const id = executar(
    'insert into abastecimentos (dataHora, litros, valorTotal, quilometragem, motoristaId, veiculoId, postoId, usuarioId) values (?, ?, ?, ?, ?, ?, ?, ?)',
    new Date().toISOString(),
    dados.litros,
    dados.valorTotal,
    dados.quilometragem,
    dados.motoristaId,
    dados.veiculoId,
    dados.postoId ?? null,
    dados.usuarioId ?? null
  );
  return buscar<Abastecimento>('select * from abastecimentos where id = ?', id)!;
}
