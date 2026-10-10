import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import api from '../servicos/api';
import { isAxiosError } from 'axios';

export type Perfil = 'gestor' | 'motorista' | 'frentista';

interface Sessao {
  token: string;
  idUsuario: number;
  perfil: Perfil;
}

interface ContextoAuth {
  sessao: Sessao | null;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
  estaLogado: boolean;
  erroMensagem: string | null;
  limparErro: () => void;
}

const AuthContexto = createContext<ContextoAuth | null>(null);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('perfil') as Perfil | null;
    const idUsuario = localStorage.getItem('idUsuario');
    if (token && perfil && idUsuario) {
      return { token, perfil, idUsuario: Number(idUsuario) };
    }
    return null;
  });

  const [erroMensagem, setErroMensagem] = useState<string | null>(null);

  const entrar = useCallback(async (login: string, senha: string) => {
    try {
      setErroMensagem(null);
      const { data } = await api.post('/autenticacao/login', { login, senha });
      const novaSessao: Sessao = {
        token: data.token,
        idUsuario: data.usuario.idUsuario,
        perfil: data.usuario.perfil,
      };
      localStorage.setItem('token', novaSessao.token);
      localStorage.setItem('perfil', novaSessao.perfil);
      localStorage.setItem('idUsuario', String(novaSessao.idUsuario));
      setSessao(novaSessao);
    } catch (erro: unknown) {
      if (isAxiosError(erro) && erro.response) {
        setErroMensagem(erro.response.data?.mensagem || 'Erro ao fazer login');
      } else {
        setErroMensagem('Servidor indisponível');
      }
      throw erro;
    }
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    localStorage.removeItem('idUsuario');
    setSessao(null);
  }, []);

  const limparErro = useCallback(() => setErroMensagem(null), []);

  return (
    <AuthContexto.Provider
      value={{
        sessao,
        entrar,
        sair,
        estaLogado: sessao !== null,
        erroMensagem,
        limparErro,
      }}
    >
      {children}
    </AuthContexto.Provider>
  );
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(AuthContexto);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de ProvedorAuth');
  }
  return contexto;
}