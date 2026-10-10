import { useEffect, useState } from 'react';
import api from '../servicos/api';
import estilos from './cadastros/Cadastro.module.css';
import estilosRel from './Relatorios.module.css';

// sprint 2 (S06/S07/S10): aba só-gestor com relatórios filtrados,
// custo médio do mês e paginação Anterior/Próxima.

interface Linha {
  id: number;
  dataHora: string;
  litros: number;
  valorTotal: number;
  quilometragem: number;
  motorista: string;
  veiculo: string;
  posto: string | null;
}

interface RespostaRelatorio {
  dados: Linha[];
  total: number;
  pagina: number;
  totalPaginas: number;
  resumo: { litros: number; valorTotal: number; mediaLitros: number; mediaValor: number };
}

interface CustoMedio {
  veiculoId: number;
  veiculo: string;
  litros: number;
  valorTotal: number;
  mediaValor: number;
  valorTotalAnterior: number;
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// atualização automática do card de custo médio (S07)
const INTERVALO_ATUALIZACAO = 10000;

export default function Relatorios() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [resumo, setResumo] = useState<RespostaRelatorio['resumo'] | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [custoMedio, setCustoMedio] = useState<CustoMedio[]>([]);
  const [erro, setErro] = useState('');

  // filtros
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [opcoes, setOpcoes] = useState<{ motoristas: { id: number; nome: string }[] }>({ motoristas: [] });

  // carrega as opções do filtro uma vez (precisa de login de gestor — ok aqui)
  useEffect(() => {
    api.get('/abastecimentos/opcoes').then(({ data }) => setOpcoes(data)).catch(() => {});
  }, []);

  function montarParams() {
    const params: Record<string, string | number> = { pagina };
    if (de) params.de = de;
    if (ate) params.ate = ate;
    if (periodo) params.periodo = periodo;
    if (motoristaId) params.motoristaId = motoristaId;
    return params;
  }

  useEffect(() => {
    api
      .get('/relatorios', { params: montarParams() })
      .then(({ data }: { data: RespostaRelatorio }) => {
        setLinhas(data.dados);
        setResumo(data.resumo);
        setTotalPaginas(data.totalPaginas);
        setErro('');
      })
      .catch(() => setErro('Não foi possível carregar o relatório.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, de, ate, periodo, motoristaId]);

  // custo médio por veículo do mês (S07) — atualiza sozinho, igual ao painel público
  useEffect(() => {
    const carregarCusto = () =>
      api
        .get('/relatorios/custo-medio')
        .then(({ data }) => setCustoMedio(data.dados))
        .catch(() => {});

    carregarCusto();
    const timer = setInterval(carregarCusto, INTERVALO_ATUALIZACAO);
    return () => clearInterval(timer);
  }, []);

  function baixarPlanilha() {
    // monta a mesma URL de filtro pro CSV, direto no navegador (com token no header não dá)
    const params = new URLSearchParams();
    if (de) params.set('de', de);
    if (ate) params.set('ate', ate);
    if (periodo) params.set('periodo', periodo);
    if (motoristaId) params.set('motoristaId', motoristaId);

    api
      .get('/relatorios/csv', { params, responseType: 'blob' })
      .then((resposta) => {
        const url = URL.createObjectURL(resposta.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio-abastecimentos.csv';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setErro('Não foi possível baixar a planilha.'));
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.topo}>
        <h2 className={estilos.titulo}>Relatórios</h2>
        <button onClick={baixarPlanilha} className={estilos.botaoNovo}>
          Baixar planilha (CSV)
        </button>
      </div>

      {erro && <div className={estilos.erro}>{erro}</div>}

      {/* card de custo médio (S07) */}
      <div className={estilosRel.custos}>
        <h3>Custo médio por veículo — este mês</h3>
        {custoMedio.length === 0 && <p>Nenhum abastecimento este mês.</p>}
        <div className={estilosRel.cartoesCusto}>
          {custoMedio.map((c) => (
            <div key={c.veiculoId} className={estilosRel.cartaoCusto}>
              <strong>{c.veiculo}</strong>
              <span>{brl(c.mediaValor)} / abastecimento</span>
              <small>
                Mês: {brl(c.valorTotal)}
                {c.valorTotalAnterior > 0 && <> · mês anterior: {brl(c.valorTotalAnterior)}</>}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* filtros (S06) */}
      <div className={estilos.filtros}>
        <div className={estilos.campo}>
          <label htmlFor="rel-de">De</label>
          <input id="rel-de" type="date" value={de} onChange={(e) => { setDe(e.target.value); setPagina(1); }} />
        </div>
        <div className={estilos.campo}>
          <label htmlFor="rel-ate">Até</label>
          <input id="rel-ate" type="date" value={ate} onChange={(e) => { setAte(e.target.value); setPagina(1); }} />
        </div>
        <div className={estilos.campo}>
          <label htmlFor="rel-periodo">Período</label>
          <select
            id="rel-periodo"
            value={periodo}
            onChange={(e) => { setPeriodo(e.target.value); setPagina(1); }}
          >
            <option value="">Personalizado</option>
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </div>
        <div className={estilos.campo}>
          <label htmlFor="rel-motorista">Motorista</label>
          <select
            id="rel-motorista"
            value={motoristaId}
            onChange={(e) => { setMotoristaId(e.target.value); setPagina(1); }}
          >
            <option value="">Todos</option>
            {opcoes.motoristas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* resumo consolidado */}
      {resumo && (
        <div className={estilosRel.resumo}>
          <span>
            <b>{resumo.litros.toFixed(1)} L</b> no total
          </span>
          <span>
            <b>{brl(resumo.valorTotal)}</b> gastos
          </span>
          <span>
            média <b>{brl(resumo.mediaValor)}</b> / registro
          </span>
        </div>
      )}

      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th>Data / hora</th>
            <th>Motorista</th>
            <th>Veículo</th>
            <th>Posto</th>
            <th>Litros</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.dataHora).toLocaleString('pt-BR')}</td>
              <td>{l.motorista}</td>
              <td>{l.veiculo}</td>
              <td>{l.posto ?? '—'}</td>
              <td>{l.litros} L</td>
              <td>{brl(l.valorTotal)}</td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td className={estilos.vazio} colSpan={6}>
                Nenhum registro com esses filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* paginação (S10/FE-08) */}
      <div className={estilosRel.paginacao}>
        <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina <= 1}>
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          disabled={pagina >= totalPaginas}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
