import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../servicos/api';
import estilosBase from '../cadastros/Cadastro.module.css';
import estilosProprios from './ListaUsuarios.module.css';

// Mescla o CSS compartilhado (Cadastro) com os ajustes desta tela.
const estilos = { ...estilosBase, ...estilosProprios };

interface Usuario {
  id: number;
  nome: string;
  login: string;
  perfil: string;
  ativo: boolean;
}

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navegacao = useNavigate();

  async function carregarDados() {
    try {
      const { data } = await api.get<Usuario[]>('/usuarios');
      setUsuarios(data);
    } catch {
      // silencioso
    } finally {
      setCarregando(false);
    }
  }

  async function alternarStatus(id: number, ativoAtual: boolean) {
    try {
      await api.patch(`/usuarios/${id}/status`, { ativo: !ativoAtual });
      setUsuarios((antigos) =>
        antigos.map((u) => (u.id === id ? { ...u, ativo: !ativoAtual } : u))
      );
    } catch {
      // silencioso
    }
  }

  async function excluir(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios((antigos) => antigos.filter((u) => u.id !== id));
    } catch {
      // silencioso
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  if (carregando) {
    return <div className={`${estilos.container} ${estilos.vazio}`}>Carregando...</div>;
  }

  return (
    <div className={estilos.container}>
      <div className={estilos.topo}>
        <h2 className={estilos.titulo}>Usuários</h2>
        <button className={estilos.botaoNovo} onClick={() => navegacao('/usuarios/novo')}>
          + Novo Usuário
        </button>
      </div>

      {usuarios.length === 0 ? (
        <p className={estilos.vazio}>Nenhum usuário cadastrado.</p>
      ) : (
        <table className={estilos.tabela}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Login</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nome}</td>
                <td>{u.login}</td>
                <td className={estilos.perfil}>{u.perfil}</td>
                <td>
                  <span className={`${estilos.badge} ${u.ativo ? estilos.badgeAtivo : estilos.badgeInativo}`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div className={estilos.acoes}>
                    <button
                      className={`${estilos.botaoAcao} ${estilos.botaoEditar}`}
                      onClick={() => navegacao(`/usuarios/editar/${u.id}`)}
                    >
                      Editar
                    </button>
                    <button
                      className={`${estilos.botaoAcao} ${u.ativo ? estilos.botaoDesativar : estilos.botaoAtivar}`}
                      onClick={() => alternarStatus(u.id, u.ativo)}
                    >
                      {u.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      className={`${estilos.botaoAcao} ${estilos.botaoExcluir}`}
                      onClick={() => excluir(u.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
