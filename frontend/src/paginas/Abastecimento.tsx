import { useState, useEffect } from 'react';
import api from '../servicos/api';
import estilos from './cadastros/Cadastro.module.css';

interface Motorista {
  id: number;
  nome: string;
}

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
}

interface Posto {
  id: number;
  nome: string;
}

interface Formulario {
  litros: string;
  valorTotal: string;
  quilometragem: string;
  motoristaId: string;
  veiculoId: string;
  postoId: string;
}

interface Comprovante {
  id: number;
  dataHora: string;
  litros: number;
  valorTotal: number;
  quilometragem: number;
  motoristaId: number;
  veiculoId: number;
}

const vazio: Formulario = {
  litros: '',
  valorTotal: '',
  quilometragem: '',
  motoristaId: '',
  veiculoId: '',
  postoId: '',
};

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Abastecimento() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [formulario, setFormulario] = useState<Formulario>(vazio);
  const [agora] = useState(() => new Date().toLocaleString('pt-BR'));
  const [erro, setErro] = useState('');
  const [comprovante, setComprovante] = useState<Comprovante | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api
      .get('/abastecimentos/opcoes')
      .then(({ data }) => {
        setMotoristas(data.motoristas);
        setVeiculos(data.veiculos);
        setPostos(data.postos);
      })
      .catch(() => setErro('Não foi possível carregar motoristas e veículos.'));
  }, []);

  function atualizar(campo: keyof Formulario, valor: string) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setErro('');
  }

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro('');

    try {
      const { data } = await api.post('/abastecimentos', {
        litros: Number(formulario.litros),
        valorTotal: Number(formulario.valorTotal),
        quilometragem: Number(formulario.quilometragem),
        motoristaId: Number(formulario.motoristaId),
        veiculoId: Number(formulario.veiculoId),
        // opcional: sem posto o registro continua válido (regra da 1ª etapa)
        postoId: formulario.postoId ? Number(formulario.postoId) : null,
      });
      setComprovante(data);
      setFormulario(vazio);
    } catch (err: any) {
      setErro(err?.response?.data?.mensagem || 'Erro ao registrar abastecimento');
    } finally {
      setSalvando(false);
    }
  }

  if (comprovante) {
    const motorista = motoristas.find((m) => m.id === comprovante.motoristaId);
    const veiculo = veiculos.find((v) => v.id === comprovante.veiculoId);

    return (
      <div className={estilos.pagina}>
        <div className={estilos.comprovante}>
          <h2>Comprovante de Abastecimento</h2>
          <p className={estilos.comprovanteSub}>Registro nº {comprovante.id}</p>

          <div className={estilos.comprovanteLinha}>
            <span>Data / hora</span>
            <b>{new Date(comprovante.dataHora).toLocaleString('pt-BR')}</b>
          </div>
          <div className={estilos.comprovanteLinha}>
            <span>Motorista</span>
            <b>{motorista?.nome ?? '—'}</b>
          </div>
          <div className={estilos.comprovanteLinha}>
            <span>Veículo</span>
            <b>{veiculo ? `${veiculo.placa} — ${veiculo.modelo}` : '—'}</b>
          </div>
          <div className={estilos.comprovanteLinha}>
            <span>Litros</span>
            <b>{comprovante.litros} L</b>
          </div>
          <div className={estilos.comprovanteLinha}>
            <span>Valor total</span>
            <b>{brl(comprovante.valorTotal)}</b>
          </div>
          <div className={estilos.comprovanteLinha}>
            <span>Quilometragem</span>
            <b>{comprovante.quilometragem} km</b>
          </div>

          <div className={estilos.botoesModal}>
            <button className={estilos.botaoSalvar} onClick={() => setComprovante(null)}>
              Novo registro
            </button>
          </div>
        </div>
      </div>
    );
  }

  const semDados = motoristas.length === 0 || veiculos.length === 0;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.topo}>
        <h2 className={estilos.titulo}>Registrar abastecimento</h2>
      </div>

      {erro && <div className={estilos.erro}>{erro}</div>}
      {semDados && !erro && (
        <div className={estilos.erro}>
          Cadastre ao menos um motorista e um veículo ativos para registrar abastecimentos.
        </div>
      )}

      <form className={estilos.formulario} onSubmit={aoEnviar}>
        <div className={estilos.campo}>
          <label>Data / hora</label>
          <input type="text" value={agora} disabled />
          <small>Gravada automaticamente pelo servidor.</small>
        </div>

        <div className={estilos.campo}>
          <label>Motorista</label>
          <select
            value={formulario.motoristaId}
            onChange={(e) => atualizar('motoristaId', e.target.value)}
            required
          >
            <option value="">Selecione…</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className={estilos.campo}>
          <label>Veículo</label>
          <select
            value={formulario.veiculoId}
            onChange={(e) => atualizar('veiculoId', e.target.value)}
            required
          >
            <option value="">Selecione…</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>{`${v.placa} — ${v.modelo}`}</option>
            ))}
          </select>
        </div>

        <div className={estilos.campo}>
          <label>Posto <small>(opcional)</small></label>
          <select
            value={formulario.postoId}
            onChange={(e) => atualizar('postoId', e.target.value)}
          >
            <option value="">Não informado</option>
            {postos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div className={estilos.campo}>
          <label>Litros</label>
          <input
            type="number"
            step="any"
            min="0.01"
            placeholder="0,00"
            value={formulario.litros}
            onChange={(e) => atualizar('litros', e.target.value)}
            required
          />
        </div>

        <div className={estilos.campo}>
          <label>Valor total (R$)</label>
          <input
            type="number"
            step="any"
            min="0.01"
            placeholder="0,00"
            value={formulario.valorTotal}
            onChange={(e) => atualizar('valorTotal', e.target.value)}
            required
          />
        </div>

        <div className={estilos.campo}>
          <label>Quilometragem (km)</label>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="0"
            value={formulario.quilometragem}
            onChange={(e) => atualizar('quilometragem', e.target.value)}
            required
          />
        </div>

        <div className={estilos.botoesModal}>
          <button className={estilos.botaoSalvar} type="submit" disabled={salvando || semDados}>
            {salvando ? 'Salvando…' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
