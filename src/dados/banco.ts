import { DatabaseSync, type SQLInputValue, type SQLOutputValue } from 'node:sqlite';
import { mkdirSync } from 'fs';
import path from 'path';

const arquivo =
  process.env.DB_ARQUIVO ??
  path.join(__dirname, '..', '..', 'data', 'abastecebus.db');

mkdirSync(path.dirname(arquivo), { recursive: true });

export const db = new DatabaseSync(arquivo);

db.exec(`
  create table if not exists usuarios (
    id integer primary key autoincrement,
    nome text not null,
    login text not null unique,
    hashSenha text not null,
    perfil text not null,
    ativo integer not null default 1
  );
  create table if not exists motoristas (
    id integer primary key autoincrement,
    nome text not null,
    cnh text not null unique,
    telefone text not null,
    ativo integer not null default 1
  );
  create table if not exists veiculos (
    id integer primary key autoincrement,
    placa text not null unique,
    modelo text not null,
    tipo text not null,
    ano integer not null,
    ativo integer not null default 1
  );
  create table if not exists postos (
    id integer primary key autoincrement,
    nome text not null,
    endereco text not null,
    cnpj text not null unique,
    ativo integer not null default 1
  );
  create table if not exists abastecimentos (
    id integer primary key autoincrement,
    dataHora text not null,
    litros real not null,
    valorTotal real not null,
    quilometragem real not null,
    motoristaId integer not null,
    veiculoId integer not null,
    postoId integer,
    usuarioId integer
  );
  create table if not exists denuncias (
    id integer primary key autoincrement,
    protocolo text not null unique,
    descricao text not null,
    foto text,
    anonima integer not null default 0,
    criadoEm text not null
  );
`);

// sprint 2 (S14): banco de dev antigo não tem a coluna usuarioId — tenta add e ignora se já existir
try {
  db.exec('alter table abastecimentos add column usuarioId integer');
} catch {
  
}

// o SQLite guarda booleano como 0/1; devolve como booleano.
function normalizar(linha: Record<string, SQLOutputValue>) {
  return 'ativo' in linha ? { ...linha, ativo: Boolean(linha.ativo) } : linha;
}

export function consultar<T>(sql: string, ...params: SQLInputValue[]): T[] {
  return db.prepare(sql).all(...params).map(normalizar) as T[];
}

export function buscar<T>(sql: string, ...params: SQLInputValue[]): T | undefined {
  const linha = db.prepare(sql).get(...params);
  return linha ? (normalizar(linha) as T) : undefined;
}

/** Roda insert/update/delete e devolve o id da linha inserida (0 se não for insert). */
export function executar(sql: string, ...params: SQLInputValue[]): number {
  const r = db.prepare(sql).run(...params);
  return Number(r.lastInsertRowid);
}
