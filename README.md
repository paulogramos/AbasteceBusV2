# Abastece Bus

Sistema de gestão de frota de ônibus com cadastros e painel de controle.

## Sprint 1 - Esboço Inicial do Projeto

### Objetivo
Levantar os requisitos e estruturar a base do sistema Abastece Bus, definindo a arquitetura, stack tecnológica e funcionalidades essenciais.

### O que foi feito
- Definição do escopo: sistema de gestão de frota de ônibus (veículos, motoristas, postos)
- Escolha das tecnologias: React + Vite no frontend, Express + TypeScript no backend
- Configuração do projeto com arquitetura em camadas (rotas, controladores, dados, middlewares)
- Criação do backend com endpoints REST para autenticação, usuários e cadastros (veículos, motoristas, postos)
- Desenvolvimento do frontend com páginas de login, painel de controle e formulários de cadastro

### Funcionalidades implementadas
- Login
- Cadastro e listagem de veículos, motoristas e postos
- Cadastro e gestão de usuários (apenas gestores)
- Registro de abastecimento (litros, valor, quilometragem, motorista, veículo) com comprovante
- Painel de controle
- Integração frontend-backend via API REST

## Sprint 2 - Relatórios, Denúncias e Rastreabilidade

### Objetivo
Transformar os cards do Trello a partir do S04 em funcionalidades de verdade: relatórios
filtrados pro gestor, custo médio em tempo real, denúncia com protocolo pro cidadão e
rastreabilidade de quem registrou cada abastecimento.

### API (8 itens)

1. `GET /api/relatorios` — relatório filtrado (período, veículo, posto, motorista), só pro gestor
2. `GET /api/relatorios/csv` — exportação do relatório em planilha (abre direto no Excel)
3. `GET /api/relatorios/custo-medio` — custo médio por veículo do mês, com comparativo do mês anterior
4. `POST /api/publico/denuncias` — registro público de denúncia com protocolo `DEN-AAAAMMDD-NNNN`
5. `GET /api/denuncias` — listagem das denúncias pro gestor (sem a foto)
6. `GET /api/abastecimentos?pagina=&limite=` — paginação opt-in nas listagens
7. `POST /api/abastecimentos` — agora grava quem registrou (`usuarioId` do usuário logado)
8. `GET /api/abastecimentos` — com `?pagina=` devolve `{ dados, total, pagina, totalPaginas }`; sem o parâmetro continua o array puro (compatibilidade)

### UI (11 itens)

1. Nova rota pública `/denuncia` no frontend (sem login)
2. Formulário de denúncia: descrição obrigatória, foto opcional e opção de anônimo
3. Tela de sucesso mostrando o protocolo que o cidadão guarda
4. Nova aba **"Relatórios"** no painel, visível só pro gestor
5. Filtros de relatório: período (diário/semanal/mensal/anual), veículo, posto e motorista
6. Tabela consolidada com resumo de litros, valor gasto e médias
7. Paginação **Anterior / Próxima** nas listagens
8. Botão de baixar o relatório em planilha (CSV)
9. Card de **custo médio** por veículo, atualizando a cada 10 segundos
10. Usabilidade: botões ≥44px, fonte base 16px, contraste AA e tabela com scroll interno no celular
11. Ícone do sistema (favicon.svg) no lugar do genérico

### Como ver o resultado das denúncias
A listagem das denúncias ainda **não tem tela no frontend** (entra na Sprint 3 aba
"Denúncias" pro gestor). Por enquanto o resultado se vê pela API, usando o
[Insomnia](https://insomnia.rest/) (ou qualquer cliente REST) em duas etapas:

**1. Logar como gestor** (`admin` é o usuário semente do banco)

- Método: `POST` · URL: `http://localhost:3001/api/autenticacao/login`
- Body (JSON):

  ```json
  { "login": "admin", "senha": "admin123" }
  ```

- Na resposta, copie o valor do campo `token`:

  ```json
  { "token": " ", "usuario": { "idUsuario": 1, "perfil": "gestor" } }
  ```

**2. Listar as denúncias** (volta protocolo, descrição, se é anônima e a data — sem a foto)

- Método: `GET` · URL: `http://localhost:3001/api/denuncias`
- Header: `Authorization: Bearer <token copiado acima>`

Fluxo completo do cidadão: entrar em `/denuncia`, preencher e enviar → a tela de sucesso
mostra o protocolo → o gestor consulta a denúncia pelo protocolo nas etapas acima.
(A consulta pública de protocolo `GET /api/publico/denuncias/:protocolo` está prevista
na Sprint 3.)

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v22+ — o backend usa o módulo nativo `node:sqlite`)

## Backend

```bash
# Na raiz do projeto
npm install
npm run dev
```

O servidor rodará em `http://localhost:3001` (configurável via variável de ambiente `PORTA`).

Os dados ficam em `data/abastecebus.db` (SQLite, criado automaticamente no primeiro
boot, com registros semente). Use `DB_ARQUIVO` para apontar para outro arquivo.

## Testes

```bash
python3 testes.py
```

Sobe o backend com um banco descartável, roda os checks de API e faz a checagem
da 1ª etapa de `estoria.md`. Sai com código de saída `0` quando tudo passa.

## Frontend

```bash
# Dentro da pasta frontend
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Estrutura do Projeto

```
bus-main/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── componentes/
│       ├── contextos/
│       ├── paginas/
│       └── servicos/
└── src/               # Backend Express + TypeScript
    ├── autenticacao/
    ├── controladores/
    ├── dados/
    ├── middlewares/
    └── rotas/
```

## Tecnologias

- **Backend:** Express, TypeScript, SQLite (`node:sqlite`), bcrypt, JWT
- **Frontend:** React, Vite, Axios, React Router
