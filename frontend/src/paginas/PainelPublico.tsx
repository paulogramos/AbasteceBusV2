import { useEffect, useState } from 'react';
import api from '../servicos/api';
import estilos from './cadastros/Cadastro.module.css';

interface Linha {
  id: number;
  dataHora: string;
  litros: number;
  valorTotal: number;
  motorista: string;
  veiculo: string;
  posto: string | null;
}

// ponytail: polling de 10s. Se precisar de push de verdade, o passo é SSE/WebSocket.
const INTERVALO = 10000;

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// YYYY-MM-DD no fuso local — o texto cru do ISO está em UTC e cai no dia anterior
const diaLocal = (iso: string) => new Date(iso).toLocaleDateString('en-CA');

export default function PainelPublico() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [erro, setErro] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroVeiculo, setFiltroVeiculo] = useState('');
  const [filtroPosto, setFiltroPosto] = useState('');

  useEffect(() => {
    const carregar = () =>
      api
        .get('/publico/abastecimentos')
        .then(({ data }) => {
          setLinhas(data);
          setErro('');
        })
        .catch(() => setErro('Não foi possível carregar os abastecimentos.'));

    carregar();
    const timer = setInterval(carregar, INTERVALO);
    return () => clearInterval(timer);
  }, []);

  // as opções dos filtros saem da própria lista — evita um endpoint público de cadastros
  const veiculos = [...new Set(linhas.map((l) => l.veiculo))];
  const postos = [...new Set(linhas.map((l) => l.posto).filter((p): p is string => p !== null))];

  const filtradas = linhas.filter(
    (l) =>
      (!filtroData || diaLocal(l.dataHora) === filtroData) &&
      (!filtroVeiculo || l.veiculo === filtroVeiculo) &&
      (!filtroPosto || l.posto === filtroPosto)
  );

  return (
    <div className={estilos.pagina}>
      <div className={estilos.topo}>
        <h2 className={estilos.titulo}>Abastecimentos da frota</h2>
        <small>Atualiza sozinho a cada {INTERVALO / 1000}s</small>
      </div>

      {erro && <div className={estilos.erro}>{erro}</div>}

      <div className={estilos.filtros}>
        <div className={estilos.campo}>
          <label>Data</label>
          <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
        </div>
        <div className={estilos.campo}>
          <label>Veículo</label>
          <select value={filtroVeiculo} onChange={(e) => setFiltroVeiculo(e.target.value)}>
            <option value="">Todos</option>
            {veiculos.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className={estilos.campo}>
          <label>Posto</label>
          <select value={filtroPosto} onChange={(e) => setFiltroPosto(e.target.value)}>
            <option value="">Todos</option>
            {postos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th>Data / hora</th>
            <th>Motorista</th>
            <th>Veículo</th>
            <th>Posto</th>
            <th>Litros</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {filtradas.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.dataHora).toLocaleString('pt-BR')}</td>
              <td>{l.motorista}</td>
              <td>{l.veiculo}</td>
              <td>{l.posto ?? '—'}</td>
              <td>{l.litros} L</td>
              <td>{brl(l.valorTotal)}</td>
            </tr>
          ))}
          {filtradas.length === 0 && (
            <tr>
              <td className={estilos.vazio} colSpan={6}>
                Nenhum abastecimento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
