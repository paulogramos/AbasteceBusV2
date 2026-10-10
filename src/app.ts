import express from 'express';
import cors from 'cors';
import autenticacaoRouter from './rotas/auth';
import usuariosRouter from './rotas/usuarios';
import cadastrosRouter from './rotas/cadastros';
import abastecimentosRouter from './rotas/abastecimentos';
import relatoriosRouter from './rotas/relatorios';
import { denunciasPublicoRouter, denunciasGestorRouter } from './rotas/denuncias';
import { listarPublico } from './dados/abastecimentos';
import { exigirPerfil } from './middlewares/verificarPerfil';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/autenticacao', autenticacaoRouter);
app.use('/api/usuarios', exigirPerfil('gestor'), usuariosRouter);
app.use('/api/cadastros', exigirPerfil('gestor'), cadastrosRouter);
// os três perfis autenticados podem registrar/lir abastecimentos
app.use(
  '/api/abastecimentos',
  exigirPerfil('gestor', 'motorista', 'frentista'),
  abastecimentosRouter
);
// sprint 2 (S06/S07): relatórios e custo médio são exclusivos do gestor
app.use('/api/relatorios', exigirPerfil('gestor'), relatoriosRouter);
// sprint 2 (S08): denúncia sem login (só POST neste router) e listagem do gestor
app.use('/api/publico/denuncias', denunciasPublicoRouter);
app.use('/api/denuncias', exigirPerfil('gestor'), denunciasGestorRouter);
// painel público: o cidadão lê a lista sem login (2ª etapa, item 1).
// não dá pra montar o router acima aqui: ele tem POST e liberaria escrita pra qualquer um.
app.get('/api/publico/abastecimentos', (req, res) => {
  res.status(200).json(listarPublico());
});

app.get('/api/saude', (req, res) => {
  res.status(200).json({ mensagem: 'Serviço funcionando' });
});

export default app;
