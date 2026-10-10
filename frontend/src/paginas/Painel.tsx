import { useState } from 'react';
import { useAuth } from '../contextos/Autenticacao';
import { useNavigate } from 'react-router-dom';
import ListaUsuarios from './usuarios/ListaUsuarios';
import ListaMotoristas from './cadastros/ListaMotoristas';
import ListaVeiculos from './cadastros/ListaVeiculos';
import ListaPostos from './cadastros/ListaPostos';
import Abastecimento from './Abastecimento';
import Relatorios from './Relatorios';
import estilos from './Painel.module.css';

type Aba = 'usuarios' | 'motoristas' | 'veiculos' | 'postos' | 'abastecimento' | 'relatorios';

const abasGestor: { chave: Aba; rotulo: string }[] = [
  { chave: 'usuarios', rotulo: 'Usuários' },
  { chave: 'motoristas', rotulo: 'Motoristas' },
  { chave: 'veiculos', rotulo: 'Veículos' },
  { chave: 'postos', rotulo: 'Postos' },
  { chave: 'abastecimento', rotulo: 'Abastecimento' },
  // sprint 2 (S06): relatórios é exclusivo do gestor
  { chave: 'relatorios', rotulo: 'Relatórios' },
];

const abasDemais: { chave: Aba; rotulo: string }[] = [
  { chave: 'abastecimento', rotulo: 'Abastecimento' },
];

const componentesAba: Record<Aba, React.FC> = {
  usuarios: ListaUsuarios,
  motoristas: ListaMotoristas,
  veiculos: ListaVeiculos,
  postos: ListaPostos,
  abastecimento: Abastecimento,
  relatorios: Relatorios,
};

export default function PaginaPainel() {
  const { sessao, sair } = useAuth();
  const navegacao = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<Aba>('usuarios');

  function aoSair() {
    sair();
    navegacao('/login');
  }

  const titulos: Record<string, string> = {
    gestor: 'Painel do Gestor',
    motorista: 'Painel do Motorista',
    frentista: 'Painel do Frentista',
  };

  const abas = sessao?.perfil === 'gestor' ? abasGestor : abasDemais;
  // se a aba ativa não existir pro perfil, cai na primeira disponível
  const chaveAtiva = abas.some((a) => a.chave === abaAtiva) ? abaAtiva : abas[0].chave;
  const ComponenteAba = componentesAba[chaveAtiva];

  return (
    <div className={estilos.telaPainel}>
      <header className={estilos.cabecalhoPainel}>
        <h1>{sessao ? titulos[sessao.perfil] || 'Painel' : 'Painel'}</h1>
        <div className={estilos.infoUsuario}>
          <span className={estilos.etiquetaPerfil}>{sessao?.perfil}</span>
          <button onClick={aoSair} className={estilos.botaoSair}>
            Sair
          </button>
        </div>
      </header>
      <main className={estilos.conteudoPainel}>
        <nav className={estilos.barraAbas}>
          {abas.map((aba) => (
            <button
              key={aba.chave}
              className={`${estilos.aba} ${chaveAtiva === aba.chave ? estilos.abaAtiva : ''}`}
              onClick={() => setAbaAtiva(aba.chave)}
            >
              {aba.rotulo}
            </button>
          ))}
        </nav>
        <ComponenteAba />
      </main>
    </div>
  );
}
