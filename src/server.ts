import app from './app';

const PORTA = process.env.PORTA || 3001;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});