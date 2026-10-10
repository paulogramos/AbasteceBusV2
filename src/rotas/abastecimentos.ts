import { Router, Request, Response } from 'express';
import {
  listarAbastecimentos,
  listarAbastecimentosPaginado,
  criarAbastecimento,
} from '../dados/abastecimentos';
import { motoristas, veiculos, postos } from '../dados/cadastros';

const router = Router();

const camposNumericos = ['litros', 'valorTotal', 'quilometragem', 'motoristaId', 'veiculoId'];

// opções pro formulário: /cadastros é exclusivo do gestor
router.get('/opcoes', (req: Request, res: Response) => {
  res.status(200).json({
    motoristas: motoristas.listar().filter((m: any) => m.ativo),
    veiculos: veiculos.listar().filter((v: any) => v.ativo),
    postos: postos.listar().filter((p: any) => p.ativo),
  });
});

router.get('/', (req: Request, res: Response) => {
  // sprint 2 (S10): sem ?pagina= continua voltando a lista pura (os testes contam com isso);
  if (req.query.pagina !== undefined) {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 20));
    res.status(200).json(listarAbastecimentosPaginado(pagina, limite));
    return;
  }
  res.status(200).json(listarAbastecimentos());
});

router.post('/', (req: Request, res: Response) => {
  if (camposNumericos.some((campo) => req.body[campo] === undefined || req.body[campo] === '')) {
    res.status(400).json({
      mensagem: 'Litros, valor total, quilometragem, motorista e veículo são obrigatórios',
    });
    return;
  }

  const valores: Record<string, number> = {};
  for (const campo of camposNumericos) {
    const valor = Number(req.body[campo]);
    if (!Number.isFinite(valor) || valor <= 0) {
      res.status(400).json({ mensagem: `O campo "${campo}" deve ser um número maior que zero` });
      return;
    }
    valores[campo] = valor;
  }

  if (!motoristas.porId(valores.motoristaId)) {
    res.status(404).json({ mensagem: 'Motorista não encontrado' });
    return;
  }
  if (!veiculos.porId(valores.veiculoId)) {
    res.status(404).json({ mensagem: 'Veículo não encontrado' });
    return;
  }

  const postoId =
    req.body.postoId === undefined || req.body.postoId === null || req.body.postoId === ''
      ? null
      : Number(req.body.postoId);
  if (postoId !== null && (!Number.isFinite(postoId) || !postos.porId(postoId))) {
    res.status(404).json({ mensagem: 'Posto não encontrado' });
    return;
  }

  // timestamp gravado pelo servidor, não pelo formulário
  const registro = criarAbastecimento({
    litros: valores.litros,
    valorTotal: valores.valorTotal,
    quilometragem: valores.quilometragem,
    motoristaId: valores.motoristaId,
    veiculoId: valores.veiculoId,
    postoId,
    // sprint 2 (S14): rastreabilidade — quem registrou (o middleware já garante req.usuario)
    usuarioId: req.usuario?.id ?? null,
  });

  res.status(201).json(registro);
});

export default router;
