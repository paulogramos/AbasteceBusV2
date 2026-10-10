import { Usuario } from '../tipos';
import bcrypt from 'bcrypt';
import { db, consultar, buscar, executar } from './banco';

const hashPadrao = bcrypt.hashSync('admin123', 10);

const sementes = [
  { id: 1, nome: 'Admin Gestor', login: 'admin', perfil: 'gestor' },
  { id: 2, nome: 'João Motorista', login: 'joao', perfil: 'motorista' },
  { id: 3, nome: 'Maria Frentista', login: 'maria', perfil: 'frentista' },
];

const gravarSemente = db.prepare(
  'insert or ignore into usuarios (id, nome, login, hashSenha, perfil, ativo) values (?, ?, ?, ?, ?, 1)'
);
for (const s of sementes) {
  gravarSemente.run(s.id, s.nome, s.login, hashPadrao, s.perfil);
}

export function listarUsuarios(): Usuario[] {
  return consultar<Usuario>('select * from usuarios order by id');
}

export function buscarUsuarioPorLogin(login: string): Usuario | undefined {
  return buscar<Usuario>('select * from usuarios where login = ?', login);
}

export function buscarUsuarioPorId(id: number): Usuario | undefined {
  return buscar<Usuario>('select * from usuarios where id = ?', id);
}

export function criarUsuario(
  dados: Omit<Usuario, 'id' | 'hashSenha'> & { senha: string }
): Usuario {
  const id = executar(
    'insert into usuarios (nome, login, hashSenha, perfil, ativo) values (?, ?, ?, ?, ?)',
    dados.nome,
    dados.login,
    bcrypt.hashSync(dados.senha, 10),
    dados.perfil,
    dados.ativo ? 1 : 0
  );
  return buscarUsuarioPorId(id)!;
}

const colunasAtualizaveis = ['nome', 'login', 'perfil', 'ativo'] as const;

export function atualizarUsuario(
  usuarioId: number,
  atualizacoes: Partial<Omit<Usuario, 'id' | 'hashSenha'>>
): Usuario | undefined {
  // whitelist: nunca interpolamos o nome da coluna vindo do req.body
  const colunas = colunasAtualizaveis.filter((c) => atualizacoes[c] !== undefined);
  if (colunas.length > 0) {
    const params = colunas.map((c) => {
      const v = atualizacoes[c];
      return typeof v === 'boolean' ? (v ? 1 : 0) : String(v);
    });
    executar(
      `update usuarios set ${colunas.map((c) => `${c} = ?`).join(', ')} where id = ?`,
      ...params,
      usuarioId
    );
  }
  return buscarUsuarioPorId(usuarioId);
}

export function atualizarStatusUsuario(usuarioId: number, ativo: boolean): Usuario | undefined {
  executar('update usuarios set ativo = ? where id = ?', ativo ? 1 : 0, usuarioId);
  return buscarUsuarioPorId(usuarioId);
}

export function removerUsuario(usuarioId: number): boolean {
  const { changes } = db.prepare('delete from usuarios where id = ?').run(usuarioId);
  return changes > 0;
}

export function loginEhUnico(login: string): boolean {
  return buscar('select id from usuarios where login = ?', login) === undefined;
}
