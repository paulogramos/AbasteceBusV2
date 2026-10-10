import { Router } from 'express';
import { autenticar, DadosLogin } from '../autenticacao/login';

const router = Router();

router.post('/login', (req, res) => {
  const { login, senha } = req.body as DadosLogin;

  const resultado = autenticar({ login, senha });

  if (!resultado) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas' });
  }

  return res.status(200).json(resultado);
});

export default router;