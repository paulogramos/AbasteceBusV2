import bcrypt from 'bcrypt';
import { buscarUsuarioPorLogin } from '../dados/usuarios';
import { gerarToken } from './auth';
import { DadosAutenticacao } from '../tipos';

export interface DadosLogin {
  login: string;
  senha: string;
}

export interface RespostaLogin {
  token: string;
  usuario: DadosAutenticacao;
}

export function autenticar(dados: DadosLogin): RespostaLogin | null {
  const usuario = buscarUsuarioPorLogin(dados.login);

  if (!usuario || !usuario.ativo) {
    return null;
  }

  const senhaConfere = bcrypt.compareSync(dados.senha, usuario.hashSenha);
  if (!senhaConfere) {
    return null;
  }

  return {
    token: gerarToken({ idUsuario: usuario.id, perfil: usuario.perfil }),
    usuario: { idUsuario: usuario.id, perfil: usuario.perfil },
  };
}