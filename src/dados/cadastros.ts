import { db, consultar, buscar, executar } from './banco';

export interface Repositorio {
  listar(): any[];
  porId(id: number): any;
  criar(dados: any): any;
  editar(id: number, dados: any): any;
  alternarStatus(id: number, ativo: boolean): any;
  unico(campo: string, valor: string | number, ignorarId?: number): boolean;
}

function criarRepositorio(tabela: string, colunas: string[]): Repositorio {
  const porId = (id: number) => buscar(`select * from ${tabela} where id = ?`, id);

  return {
    listar: () => consultar(`select * from ${tabela} order by id`),
    porId,

    criar: (dados) => {
      const id = executar(
        `insert into ${tabela} (${colunas.join(', ')}, ativo) values (${colunas.map(() => '?').join(', ')}, 1)`,
        ...colunas.map((c) => dados[c])
      );
      return porId(id);
    },

    editar: (id, dados) => {
      const alvos = colunas.filter((c) => dados[c] !== undefined);
      if (alvos.length > 0) {
        executar(
          `update ${tabela} set ${alvos.map((c) => `${c} = ?`).join(', ')} where id = ?`,
          ...alvos.map((c) => dados[c]),
          id
        );
      }
      return porId(id);
    },

    alternarStatus: (id, ativo) => {
      executar(`update ${tabela} set ativo = ? where id = ?`, ativo ? 1 : 0, id);
      return porId(id);
    },

    // ids são autoincrement a partir de 1, então -1 nunca casa com um registro real
    unico: (campo, valor, ignorarId) =>
      buscar(`select id from ${tabela} where ${campo} = ? and id != ?`, valor, ignorarId ?? -1) ===
      undefined,
  };
}

export const motoristas = criarRepositorio('motoristas', ['nome', 'cnh', 'telefone']);

export const veiculos = criarRepositorio('veiculos', ['placa', 'modelo', 'tipo', 'ano']);

export const postos = criarRepositorio('postos', ['nome', 'endereco', 'cnpj']);

const sementes = [
  "insert or ignore into motoristas (id, nome, cnh, telefone, ativo) values (1, 'Carlos Silva', '12345678901', '11999990001', 1), (2, 'Ana Souza', '12345678902', '11999990002', 1), (3, 'Pedro Lima', '12345678903', '11999990003', 1)",
  "insert or ignore into veiculos (id, placa, modelo, tipo, ano, ativo) values (1, 'ABC1D23', 'Fiat Uno', 'Leve', 2020, 1), (2, 'EFG4H56', 'Volkswagen Gol', 'Leve', 2021, 1), (3, 'IJK7L89', 'Mercedes Atego', 'Pesado', 2019, 1)",
  "insert or ignore into postos (id, nome, endereco, cnpj, ativo) values (1, 'Posto Ipiranga', 'Rua A, 100', '12345678000190', 1), (2, 'Posto Shell', 'Rua B, 200', '12345678000271', 1), (3, 'Posto Petrobras', 'Rua C, 300', '12345678000352', 1)",
];

for (const sql of sementes) db.exec(sql);
