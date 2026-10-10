import { Request, Response, NextFunction } from 'express';
import { extrairTokenDoHeader, verificarToken } from '../autenticacao/auth';
import { buscarUsuarioPorId } from '../dados/usuarios';
import type { Perfil } from '../tipos';

// sprint 2 (S14): o middleware deixa o usuário logado disponível na requisição,
// para as rotas gravarem quem registrou cada abastecimento (rastreabilidade)
declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; perfil: Perfil };
    }
  }
}

export function exigirPerfil(...perfisAceitos: Perfil[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = extrairTokenDoHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({ mensagem: 'Token não fornecido' });
      return;
    }

    let dadosToken;
    try {
      dadosToken = verificarToken(token);
    } catch {
      res.status(401).json({ mensagem: 'Token inválido ou expirado' });
      return;
    }

    const usuario = buscarUsuarioPorId(dadosToken.idUsuario);
    if (!usuario || !usuario.ativo) {
      res.status(401).json({ mensagem: 'Usuário não encontrado ou inativo' });
      return;
    }

    if (!perfisAceitos.includes(usuario.perfil)) {
      res.status(403).json({ mensagem: 'Sem permissão para acessar este recurso' });
      return;
    }

    // deixa o usuário na requisição pras rotas usarem (ex.: gravar quem registrou)
    req.usuario = { id: usuario.id, perfil: usuario.perfil };

    next();
  };
}
