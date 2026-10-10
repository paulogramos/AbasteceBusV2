import ListaCadastro from './ListaCadastro';

export default function ListaPostos() {
  return (
    <ListaCadastro
      titulo="Postos"
      entidade="Posto"
      rota="/cadastros/postos"
      colunas={[
        { chave: 'id', rotulo: 'ID' },
        { chave: 'nome', rotulo: 'Nome' },
        { chave: 'endereco', rotulo: 'Endereço' },
        { chave: 'cnpj', rotulo: 'CNPJ' },
      ]}
      campos={[
        { nome: 'nome', rotulo: 'Nome' },
        { nome: 'endereco', rotulo: 'Endereço' },
        { nome: 'cnpj', rotulo: 'CNPJ' },
      ]}
    />
  );
}
