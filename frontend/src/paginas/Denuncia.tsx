import { useState, type FormEvent } from 'react';
import api from '../servicos/api';
import estilos from './Denuncia.module.css';

// sprint 2 (S08): denúncia sem login — "Denúncia Já".
// rota fora do RotaProtegida, mesmo esquema do /painel-publico.

export default function Denuncia() {
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [anonima, setAnonima] = useState(false);
  const [protocolo, setProtocolo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) {
      setFoto(null);
      return;
    }
    // converte em base64 simples de enviar no JSON (limite ~700k chars)
    const leitor = new FileReader();
    leitor.onload = () => setFoto(String(leitor.result));
    leitor.readAsDataURL(arquivo);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (!descricao.trim()) {
      setErro('Escreva a descrição da denúncia.');
      return;
    }

    setEnviando(true);
    try {
      const { data } = await api.post('/publico/denuncias', {
        descricao: descricao.trim(),
        foto,
        anonima,
      });
      setProtocolo(data.protocolo);
    } catch (erroResposta: any) {
      setErro(erroResposta.response?.data?.mensagem ?? 'Não foi possível registrar a denúncia.');
    } finally {
      setEnviando(false);
    }
  }

  // tela de sucesso com o protocolo (S08: gera número após envio)
  if (protocolo) {
    return (
      <div className={estilos.pagina}>
        <div className={estilos.cartao}>
          <h1>Denúncia registrada</h1>
          <p className={estilos.protocolo}>{protocolo}</p>
          <p>
            Guarde este número de protocolo — é com ele que você acompanha a denúncia.
          </p>
          <button
            className={estilos.botao}
            onClick={() => {
              setProtocolo('');
              setDescricao('');
              setFoto(null);
              setAnonima(false);
            }}
          >
            Registrar outra denúncia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <form className={estilos.cartao} onSubmit={enviar}>
        <h1>Denúncia Já</h1>
        <p className={estilos.subtitulo}>
          Viu uma irregularidade no abastecimento da frota? Conte pra gente. Não precisa entrar
          com login.
        </p>

        {erro && <div className={estilos.erro}>{erro}</div>}

        <label className={estilos.campo}>
          Descrição da irregularidade <b>(obrigatória)</b>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={5}
            placeholder="Ex.: o motorista abasteceu fora do posto combinado"
            required
          />
        </label>

        <label className={estilos.campo}>
          Foto (opcional)
          <input type="file" accept="image/*" onChange={aoEscolherFoto} />
        </label>
        {foto && <img className={estilos.miniatura} src={foto} alt="Pré-visualização da foto" />}

        <label className={estilos.check}>
          <input
            type="checkbox"
            checked={anonima}
            onChange={(e) => setAnonima(e.target.checked)}
          />
          Enviar como anônimo
        </label>

        <button className={estilos.botao} type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar denúncia'}
        </button>
      </form>
    </div>
  );
}
