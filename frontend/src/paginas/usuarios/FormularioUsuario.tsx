import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../servicos/api';
import estilos from './FormularioUsuario.module.css';

interface FormularioDados {
  nome: string;
  login: string;
  senha: string;
  perfil: 'gestor' | 'motorista' | 'frentista';
}

const valoresIniciais: FormularioDados = {
  nome: '',
  login: '',
  senha: '',
  perfil: 'motorista',
};

export default function FormularioUsuario() {
  const { id } = useParams<{ id: string }>();
  const ehEdicao = Boolean(id);
  const navegacao = useNavigate();

  const [formulario, setFormulario] = useState<FormularioDados>(valoresIniciais);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (ehEdicao && id) {
      api.get(`/usuarios/${id}`).then(({ data }) => {
        setFormulario({
          nome: data.nome,
          login: data.login,
          senha: '',
          perfil: data.perfil,
        });
      });
    }
  }, [ehEdicao, id]);

  function atualizarCampo(campo: keyof FormularioDados, valor: string) {
    setFormulario((antigo) => ({ ...antigo, [campo]: valor }));
    setErro('');
  }

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro('');

    try {
      if (ehEdicao) {
        await api.put(`/usuarios/${id}`, {
          nome: formulario.nome,
          login: formulario.login,
          perfil: formulario.perfil,
        });
        setSucesso('Usuário atualizado com sucesso!');
      } else {
        await api.post('/usuarios', formulario);
        setSucesso('Usuário criado com sucesso!');
      }

      setTimeout(() => navegacao('/painel'), 1000);
    } catch (err: any) {
      const mensagem = err?.response?.data?.mensagem || 'Erro ao salvar';
      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={estilos.container}>
      <h2 className={estilos.titulo}>{ehEdicao ? 'Editar Usuário' : 'Novo Usuário'}</h2>

      {erro && <div className={estilos.erro}>{erro}</div>}
      {sucesso && <div className={estilos.sucesso}>{sucesso}</div>}

      <form onSubmit={aoEnviar} className={estilos.form}>
        <div className={estilos.campo}>
          <label className={estilos.label}>Nome</label>
          <input
            className={estilos.input}
            type="text"
            placeholder="Nome completo"
            value={formulario.nome}
            onChange={(e) => atualizarCampo('nome', e.target.value)}
            required
          />
        </div>

        <div className={estilos.campo}>
          <label className={estilos.label}>Login</label>
          <input
            className={estilos.input}
            type="text"
            placeholder="Nome de usuário"
            value={formulario.login}
            onChange={(e) => atualizarCampo('login', e.target.value)}
            required
          />
        </div>

        {!ehEdicao && (
          <div className={estilos.campo}>
            <label className={estilos.label}>Senha</label>
            <input
              className={estilos.input}
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formulario.senha}
              onChange={(e) => atualizarCampo('senha', e.target.value)}
              required
              minLength={6}
            />
          </div>
        )}

        <div className={estilos.campo}>
          <label className={estilos.label}>Perfil</label>
          <select
            className={estilos.select}
            value={formulario.perfil}
            onChange={(e) => atualizarCampo('perfil', e.target.value as FormularioDados['perfil'])}
          >
            <option value="gestor">Gestor</option>
            <option value="motorista">Motorista</option>
            <option value="frentista">Frentista</option>
          </select>
        </div>

        <div className={estilos.botoes}>
          <button type="button" className={estilos.botaoCancelar} onClick={() => navegacao('/painel')}>
            Cancelar
          </button>
          <button type="submit" className={estilos.botaoSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
