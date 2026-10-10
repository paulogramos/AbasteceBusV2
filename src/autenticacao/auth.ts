import jwt from 'jsonwebtoken';
import { DadosAutenticacao } from '../tipos';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-do-curso';
const JWT_EXPIRA_EM = '1d';

export function gerarToken(dados: DadosAutenticacao): string {
  return jwt.sign(dados, JWT_SECRET, { expiresIn: JWT_EXPIRA_EM });
}

export function verificarToken(token: string): DadosAutenticacao {
  return jwt.verify(token, JWT_SECRET) as DadosAutenticacao;
}

export function extrairTokenDoHeader(header: string | undefined): string | undefined {
  if (!header || !header.startsWith('Bearer ')) return undefined;
  return header.slice(7);
}