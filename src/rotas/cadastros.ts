import { Router } from 'express';
import {
  ControladorMotorista,
  ControladorVeiculo,
  ControladorPosto,
} from '../controladores/cadastros';

const router = Router();

// Motoristas
router.get('/motoristas', ControladorMotorista.listar);
router.get('/motoristas/:id', ControladorMotorista.buscarPorId);
router.post('/motoristas', ControladorMotorista.cadastrar);
router.put('/motoristas/:id', ControladorMotorista.editar);
router.patch('/motoristas/:id/status', ControladorMotorista.alternarStatus);

// Veiculos
router.get('/veiculos', ControladorVeiculo.listar);
router.get('/veiculos/:id', ControladorVeiculo.buscarPorId);
router.post('/veiculos', ControladorVeiculo.cadastrar);
router.put('/veiculos/:id', ControladorVeiculo.editar);
router.patch('/veiculos/:id/status', ControladorVeiculo.alternarStatus);

// Postos
router.get('/postos', ControladorPosto.listar);
router.get('/postos/:id', ControladorPosto.buscarPorId);
router.post('/postos', ControladorPosto.cadastrar);
router.put('/postos/:id', ControladorPosto.editar);
router.patch('/postos/:id/status', ControladorPosto.alternarStatus);

export default router;
