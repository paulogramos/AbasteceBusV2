import ListaCadastro from './ListaCadastro';

export default function ListaVeiculos() {
  return (
    <ListaCadastro
      titulo="Veículos"
      entidade="Veículo"
      rota="/cadastros/veiculos"
      colunas={[
        { chave: 'id', rotulo: 'ID' },
        { chave: 'placa', rotulo: 'Placa' },
        { chave: 'modelo', rotulo: 'Modelo' },
        { chave: 'tipo', rotulo: 'Tipo' },
        { chave: 'ano', rotulo: 'Ano' },
      ]}
      campos={[
        { nome: 'placa', rotulo: 'Placa' },
        { nome: 'modelo', rotulo: 'Modelo' },
        { nome: 'tipo', rotulo: 'Tipo', tipo: 'select', opcoes: ['Leve', 'Pesado', 'Moto'] },
        { nome: 'ano', rotulo: 'Ano', tipo: 'number' },
      ]}
    />
  );
}
