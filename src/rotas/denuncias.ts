import { Router, Request, Response } from 'express';
import { criarDenuncia, listarDenuncias } from '../dados/denuncias';

// sprint 2 (S08): denúncia sem login (público) + listagem do gestor.
// os dois handlers ficam em routers separados em app.ts por causa da proteção.

export const denunciasPublicoRouter = Router();

// ~700k chars: foto em base64 no corpo JSON, teto generoso mas limitado
const LIMITE_FOTO = 700_000;

denunciasPublicoRouter.post('/', (req: Request, res: Response) => {
  const descricao = typeof req.body.descricao === 'string' ? req.body.descricao.trim() : '';
  if (!descricao) {
    res.status(400).json({ mensagem: 'A descrição da denúncia é obrigatória' });
    return;
  }

  const foto =
    typeof req.body.foto === 'string' && req.body.foto !== '' ? req.body.foto : null;
  if (foto && foto.length > LIMITE_FOTO) {
    res.status(400).json({ mensagem: 'A foto é muito grande (máximo aproximado de 700KB)' });
    return;
  }

  const anonima = req.body.anonima === true || req.body.anonima === 'true';

  const denuncia = criarDenuncia({ descricao, foto, anonima });

  // TODO sprint 3: notificação automática pro órgão de controle (S08).
  // devolve o protocolo — é ele que o cidadão guarda (S08)
  res.status(201).json({
    protocolo: denuncia.protocolo,
    mensagem: 'Denúncia registrada com sucesso',
  });
});

export const denunciasGestorRouter = Router();

// listagem pro gestor: sem a foto na lista (pesada; fica só no registro completo)
denunciasGestorRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json(listarDenuncias());
});
