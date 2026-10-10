export type Perfil = 'gestor' | 'motorista' | 'frentista';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  hashSenha: string;
  perfil: Perfil;
  ativo: boolean;
}

export interface DadosAutenticacao {
  idUsuario: number;
  perfil: Perfil;
}

export interface Abastecimento {
  id: number;
  dataHora: string;
  litros: number;
  valorTotal: number;
  quilometragem: number;
  motoristaId: number;
  veiculoId: number;
  postoId?: number | null;
  /** sprint 2 (S14): quem registrou o abastecimento */
  usuarioId?: number | null;
}
