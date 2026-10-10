import ListaCadastro from './ListaCadastro';

export default function ListaMotoristas() {
  return (
    <ListaCadastro
      titulo="Motoristas"
      entidade="Motorista"
      rota="/cadastros/motoristas"
      colunas={[
        { chave: 'id', rotulo: 'ID' },
        { chave: 'nome', rotulo: 'Nome' },
        { chave: 'cnh', rotulo: 'CNH' },
        { chave: 'telefone', rotulo: 'Telefone' },
      ]}
      campos={[
        { nome: 'nome', rotulo: 'Nome' },
        { nome: 'cnh', rotulo: 'CNH' },
        { nome: 'telefone', rotulo: 'Telefone' },
      ]}
    />
  );
}
