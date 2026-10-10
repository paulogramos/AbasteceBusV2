import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contextos/Autenticacao';
import estilos from './Login.module.css';

export default function PaginaLogin() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { entrar, erroMensagem, limparErro } = useAuth();
  const navegacao = useNavigate();

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    try {
      await entrar(login, senha);
      navegacao('/painel');
    } catch {
      // erro ja tratado no contexto
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={estilos.telaLogin}>
      <div className={estilos.cartaoLogin}>
        <h1 className={estilos.tituloLogin}>Entrar no Sistema</h1>
        <p className={estilos.subtituloLogin}>Acesse sua conta para continuar</p>

        {erroMensagem && (
          <div className={estilos.alertaErro}>
            <span>{erroMensagem}</span>
            <button onClick={limparErro} className={estilos.fecharAlerta}>
              ×
            </button>
          </div>
        )}

        <form onSubmit={aoEnviar} className={estilos.formularioLogin}>
          <div className={estilos.campo}>
            <label htmlFor="login">Usuário</label>
            <input
              id="login"
              type="text"
              placeholder="Digite seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className={estilos.campo}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={estilos.botaoEntrar}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}