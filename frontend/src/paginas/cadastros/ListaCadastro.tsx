import { useState, useEffect } from 'react';
import api from '../../servicos/api';
import estilos from './Cadastro.module.css';

interface Registro {
  id: number;
  ativo: boolean;
  [campo: string]: unknown;
}

interface Campo {
  nome: string;
  rotulo: string;
  tipo?: 'text' | 'number' | 'select';
  opcoes?: string[];
}

interface Coluna {
  chave: string;
  rotulo: string;
}

interface Props {
  titulo: string;
  entidade: string;
  rota: string;
  colunas: Coluna[];
  campos: Campo[];
}

function valoresIniciais(campos: Campo[]): Record<string, string> {
  const iniciais: Record<string, string> = {};
  for (const campo of campos) iniciais[campo.nome] = campo.opcoes?.[0] ?? '';
  return iniciais;
}

export default function ListaCadastro({ titulo, entidade, rota, colunas, campos }: Props) {
  const [lista, setLista] = useState<Registro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<Record<string, string>>(() => valoresIniciais(campos));
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const { data } = await api.get<Registro[]>(rota);
      setLista(data);
    } catch {
      // silencioso
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setEditandoId(null);
    setFormulario(valoresIniciais(campos));
    setErro('');
    setModalAberto(true);
  }

  function abrirEditar(registro: Registro) {
    setEditandoId(registro.id);
    setFormulario(
      Object.fromEntries(campos.map((c) => [c.nome, String(registro[c.nome] ?? '')]))
    );
    setErro('');
    setModalAberto(true);
  }

  async function salvar() {
    const dados = Object.fromEntries(
      campos.map((c) => [c.nome, c.tipo === 'number' ? Number(formulario[c.nome]) : formulario[c.nome]])
    );
    try {
      if (editandoId) {
        const { data } = await api.put(`${rota}/${editandoId}`, dados);
        setLista((antigos) => antigos.map((r) => (r.id === editandoId ? data : r)));
      } else {
        const { data } = await api.post(rota, dados);
        setLista((antigos) => [...antigos, data]);
      }
      setModalAberto(false);
    } catch (err: any) {
      setErro(err?.response?.data?.mensagem || 'Erro ao salvar');
    }
  }

  async function alternarStatus(id: number, ativoAtual: boolean) {
    try {
      const { data } = await api.patch(`${rota}/${id}/status`, { ativo: !ativoAtual });
      setLista((antigos) => antigos.map((r) => (r.id === id ? data : r)));
    } catch {
      // silencioso
    }
  }

  if (carregando) return <div className={estilos.vazio}>Carregando...</div>;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.topo}>
        <h2 className={estilos.titulo}>{titulo}</h2>
        <button className={estilos.botaoNovo} onClick={abrirNovo}>+ Novo</button>
      </div>

      {lista.length === 0 ? (
        <p className={estilos.vazio}>Nenhum {entidade.toLowerCase()} cadastrado.</p>
      ) : (
        <table className={estilos.tabela}>
          <thead>
            <tr>
              {colunas.map((c) => <th key={c.chave}>{c.rotulo}</th>)}
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((registro) => (
              <tr key={registro.id}>
                {colunas.map((c) => <td key={c.chave}>{String(registro[c.chave] ?? '')}</td>)}
                <td>
                  <span className={`${estilos.badge} ${registro.ativo ? estilos.badgeAtivo : estilos.badgeInativo}`}>
                    {registro.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div className={estilos.acoes}>
                    <button className={`${estilos.botaoAcao} ${estilos.botaoEditar}`} onClick={() => abrirEditar(registro)}>Editar</button>
                    <button
                      className={`${estilos.botaoAcao} ${registro.ativo ? estilos.botaoDesativar : estilos.botaoAtivar}`}
                      onClick={() => alternarStatus(registro.id, registro.ativo)}
                    >
                      {registro.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalAberto && (
        <div className={estilos.modalOverlay} onClick={() => setModalAberto(false)}>
          <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={estilos.modalTitulo}>{editandoId ? `Editar ${entidade}` : `Novo ${entidade}`}</h3>
            {erro && <div className={estilos.erro}>{erro}</div>}
            <div className={estilos.formulario}>
              {campos.map((campo) => (
                <div key={campo.nome} className={estilos.campo}>
                  <label>{campo.rotulo}</label>
                  {campo.tipo === 'select' ? (
                    <select
                      value={formulario[campo.nome]}
                      onChange={(e) => setFormulario((f) => ({ ...f, [campo.nome]: e.target.value }))}
                    >
                      {campo.opcoes?.map((op) => <option key={op} value={op}>{op}</option>)}
                    </select>
                  ) : (
                    <input
                      type={campo.tipo ?? 'text'}
                      value={formulario[campo.nome]}
                      onChange={(e) => setFormulario((f) => ({ ...f, [campo.nome]: e.target.value }))}
                      required
                    />
                  )}
                </div>
              ))}
              <div className={estilos.botoesModal}>
                <button className={estilos.botaoCancelar} onClick={() => setModalAberto(false)}>Cancelar</button>
                <button className={estilos.botaoSalvar} onClick={salvar}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
