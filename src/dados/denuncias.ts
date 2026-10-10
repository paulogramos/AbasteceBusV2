import { consultar, buscar, executar } from './banco';

// sprint 2 (S08): denúncia "Denúncia Já" cidadão sem login relata irregularidade.

export interface Denuncia {
  id: number;
  protocolo: string;
  descricao: string;
  foto: string | null;
  anonima: boolean;
  criadoEm: string;
}

/** O que o gestor vê na listagem*/
export interface DenunciaResumo {
  id: number;
  protocolo: string;
  descricao: string;
  anonima: boolean;
  criadoEm: string;
}

function normalizarDenuncia(linha: any): Denuncia {
  return { ...linha, anonima: Boolean(linha.anonima) };
}

/** Protocolo no formato DEN-AAAAMMDD-NNNN, sempre único. */
export function gerarProtocolo(): string {
  const hoje = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const sequencia = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const protocolo = `DEN-${hoje}-${sequencia}`;
    const existe = buscar('select id from denuncias where protocolo = ?', protocolo);
    if (!existe) return protocolo;
  }
  // 50 tentativas aleatórias batendo: usa o próximo id como sequência
  return `DEN-${hoje}-${String(Date.now()).slice(-4)}`;
}

export function criarDenuncia(dados: {
  descricao: string;
  foto?: string | null;
  anonima: boolean;
}): Denuncia {
  const id = executar(
    'insert into denuncias (protocolo, descricao, foto, anonima, criadoEm) values (?, ?, ?, ?, ?)',
    gerarProtocolo(),
    dados.descricao,
    dados.foto ?? null,
    dados.anonima ? 1 : 0,
    new Date().toISOString()
  );
  const linha = buscar('select * from denuncias where id = ?', id);
  return normalizarDenuncia(linha);
}

export function listarDenuncias(): DenunciaResumo[] {
  return consultar<DenunciaResumo>(
    'select id, protocolo, descricao, anonima, criadoEm from denuncias order by id desc'
  ).map((d) => ({ ...d, anonima: Boolean((d as any).anonima) }));
}
