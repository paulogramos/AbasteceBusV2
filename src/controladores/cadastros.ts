import { Request, Response } from 'express';
import { Repositorio, motoristas, veiculos, postos } from '../dados/cadastros';

interface Opcoes {
  rotulo: string;
  repo: Repositorio;
  campos: string[];
  obrigatorios: string;
  campoUnico?: { campo: string; mensagem: string };
  transformar?: (dados: any) => any;
}

export function criarControlador(opcoes: Opcoes) {
  const { rotulo, repo, campos, obrigatorios, campoUnico, transformar } = opcoes;

  function idDe(req: Request, res: Response): number | null {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ mensagem: 'ID inválido' });
      return null;
    }
    return id;
  }

  function naoEncontrado(res: Response) {
    res.status(404).json({ mensagem: `${rotulo} não encontrado` });
  }

  function conferirUnico(req: Request, res: Response, ignorarId?: number): boolean {
    if (!campoUnico) return true;
    const valor = req.body[campoUnico.campo];
    if (!valor) return true;
    if (!repo.unico(campoUnico.campo, valor, ignorarId)) {
      res.status(409).json({ mensagem: campoUnico.mensagem });
      return false;
    }
    return true;
  }

  function dadosDe(req: Request) {
    const dados: any = {};
    for (const campo of campos) if (req.body[campo]) dados[campo] = req.body[campo];
    return transformar ? transformar(dados) : dados;
  }

  return {
    listar: (req: Request, res: Response) => {
      res.status(200).json(repo.listar());
    },

    buscarPorId: (req: Request, res: Response) => {
      const id = idDe(req, res);
      if (id === null) return;

      const registro = repo.porId(id);
      if (!registro) {
        naoEncontrado(res);
        return;
      }
      res.status(200).json(registro);
    },

    cadastrar: (req: Request, res: Response) => {
      if (campos.some((campo) => !req.body[campo])) {
        res.status(400).json({ mensagem: obrigatorios });
        return;
      }
      if (!conferirUnico(req, res)) return;

      res.status(201).json(repo.criar(dadosDe(req)));
    },

    editar: (req: Request, res: Response) => {
      const id = idDe(req, res);
      if (id === null) return;

      if (!campos.some((campo) => req.body[campo])) {
        res.status(400).json({ mensagem: 'Envie ao menos um campo para atualizar' });
        return;
      }
      if (!conferirUnico(req, res, id)) return;

      const atualizado = repo.editar(id, dadosDe(req));
      if (!atualizado) {
        naoEncontrado(res);
        return;
      }
      res.status(200).json(atualizado);
    },

    alternarStatus: (req: Request, res: Response) => {
      const id = idDe(req, res);
      if (id === null) return;

      if (typeof req.body.ativo !== 'boolean') {
        res.status(400).json({ mensagem: 'O campo "ativo" deve ser true ou false' });
        return;
      }

      const atualizado = repo.alternarStatus(id, req.body.ativo);
      if (!atualizado) {
        naoEncontrado(res);
        return;
      }
      res.status(200).json(atualizado);
    },
  };
}

export const ControladorMotorista = criarControlador({
  rotulo: 'Motorista',
  repo: motoristas,
  campos: ['nome', 'cnh', 'telefone'],
  obrigatorios: 'Nome, CNH e telefone são obrigatórios',
  campoUnico: { campo: 'cnh', mensagem: 'Esta CNH já está cadastrada' },
});

export const ControladorVeiculo = criarControlador({
  rotulo: 'Veículo',
  repo: veiculos,
  campos: ['placa', 'modelo', 'tipo', 'ano'],
  obrigatorios: 'Placa, modelo, tipo e ano são obrigatórios',
  campoUnico: { campo: 'placa', mensagem: 'Esta placa já está cadastrada' },
  transformar: (dados) => ('ano' in dados ? { ...dados, ano: Number(dados.ano) } : dados),
});

export const ControladorPosto = criarControlador({
  rotulo: 'Posto',
  repo: postos,
  campos: ['nome', 'endereco', 'cnpj'],
  obrigatorios: 'Nome, endereço e CNPJ são obrigatórios',
  campoUnico: { campo: 'cnpj', mensagem: 'Este CNPJ já está cadastrada' },
});
