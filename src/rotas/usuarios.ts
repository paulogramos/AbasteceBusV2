import { Router, Request, Response } from 'express';
import {
  listarUsuarios,
  criarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  atualizarStatusUsuario,
  removerUsuario,
  loginEhUnico,
} from '../dados/usuarios';
import type { Perfil } from '../tipos';

const router = Router();

const perfisValidos: Perfil[] = ['gestor', 'motorista', 'frentista'];

function exigirId(req: Request, res: Response): number | null {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ mensagem: 'ID inválido' });
    return null;
  }
  return id;
}

router.get('/', (req: Request, res: Response) => {
  const lista = listarUsuarios().map(({ hashSenha, ...resto }) => resto);
  res.status(200).json(lista);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = exigirId(req, res);
  if (id === null) return;

  const usuario = buscarUsuarioPorId(id);
  if (!usuario) {
    res.status(404).json({ mensagem: 'Usuário não encontrado' });
    return;
  }

  const { hashSenha, ...resto } = usuario;
  res.status(200).json(resto);
});

router.post('/', (req: Request, res: Response) => {
  const { nome, login, senha, perfil } = req.body;

  if (!nome || !login || !senha || !perfil) {
    res.status(400).json({ mensagem: 'Nome, login, senha e perfil são obrigatórios' });
    return;
  }

  if (!perfisValidos.includes(perfil)) {
    res.status(400).json({ mensagem: 'Perfil inválido. Use: gestor, motorista ou frentista' });
    return;
  }

  if (senha.length < 6) {
    res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres' });
    return;
  }

  if (!loginEhUnico(login)) {
    res.status(409).json({ mensagem: 'Este login já está em uso' });
    return;
  }

  const novo = criarUsuario({ nome, login, senha, perfil, ativo: true });
  const { hashSenha, ...resto } = novo;
  res.status(201).json(resto);
});

router.put('/:id', (req: Request, res: Response) => {
  const id = exigirId(req, res);
  if (id === null) return;

  const { nome, login, perfil } = req.body;

  if (!nome && !login && !perfil) {
    res.status(400).json({ mensagem: 'Envie ao menos um campo para atualizar' });
    return;
  }

  const existente = buscarUsuarioPorId(id);
  if (!existente) {
    res.status(404).json({ mensagem: 'Usuário não encontrado' });
    return;
  }

  if (login && login !== existente.login && !loginEhUnico(login)) {
    res.status(409).json({ mensagem: 'Este login já está em uso' });
    return;
  }

  const atualizacoes: Record<string, any> = {};
  if (nome) atualizacoes.nome = nome;
  if (login) atualizacoes.login = login;
  if (perfil) {
    if (!perfisValidos.includes(perfil)) {
      res.status(400).json({ mensagem: 'Perfil inválido' });
      return;
    }
    atualizacoes.perfil = perfil;
  }

  const atualizado = atualizarUsuario(id, atualizacoes);
  if (!atualizado) {
    res.status(404).json({ mensagem: 'Usuário não encontrado' });
    return;
  }

  const { hashSenha, ...resto } = atualizado;
  res.status(200).json(resto);
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const id = exigirId(req, res);
  if (id === null) return;

  const { ativo } = req.body;

  if (typeof ativo !== 'boolean') {
    res.status(400).json({ mensagem: 'O campo "ativo" deve ser true ou false' });
    return;
  }

  const atualizado = atualizarStatusUsuario(id, ativo);
  if (!atualizado) {
    res.status(404).json({ mensagem: 'Usuário não encontrado' });
    return;
  }

  const { hashSenha, ...resto } = atualizado;
  res.status(200).json(resto);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = exigirId(req, res);
  if (id === null) return;

  if (!removerUsuario(id)) {
    res.status(404).json({ mensagem: 'Usuário não encontrado' });
    return;
  }

  res.status(200).json({ mensagem: 'Usuário removido com sucesso' });
});

export default router;
