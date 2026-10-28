# Blog de Professor

API REST para publicar, editar e buscar postagens de aulas e avisos, pensada para professores. Construída com Node.js, Express e MongoDB, com autenticação JWT nas operações de escrita, testes automatizados e pipeline de CI com publicação de imagem Docker.

## Tecnologias

- **Node.js 18** e **Express 4**
- **MongoDB** com **Mongoose 8** (índice de texto para busca)
- **JWT** (`jsonwebtoken`) para proteger criação, edição e exclusão
- **Jest** e **Supertest** para testes de integração
- **Docker** e **GitHub Actions** (testes, build e publicação no GHCR)

## Arquitetura

```
src/
├── index.js                 # Conecta ao MongoDB e inicia o servidor
├── app.js                   # Configuração do Express (sem listen, testável)
├── routes/posts.js          # Definição das rotas e quais exigem token
├── controllers/postController.js  # Regras de cada operação CRUD e busca
├── middlewares/auth.js      # Validação do token JWT
├── models/Post.js           # Schema e índice de texto
└── tests/posts.test.js      # Testes de integração dos endpoints
```

## Como executar

Requisitos: Node.js 18+ e uma instância do MongoDB (local ou Atlas).

```bash
npm install
cp .env.example .env        # ajuste MONGO_URI e ACCESS_TOKEN_SECRET
npm start
```

Com Docker:

```bash
docker build -t blog-de-professor-app .
docker run --env-file .env -p 3000:3000 blog-de-professor-app
```

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | não | Verificação de saúde do serviço |
| GET | `/posts` | não | Lista as postagens, mais recentes primeiro |
| GET | `/posts/search?q=termo` | não | Busca por palavra-chave no título e conteúdo |
| GET | `/posts/:id` | não | Lê uma postagem pelo ID |
| POST | `/posts` | sim | Cria uma postagem |
| PUT | `/posts/:id` | sim | Atualiza os campos enviados |
| DELETE | `/posts/:id` | sim | Remove uma postagem |

Exemplo de criação:

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Aula 1","content":"Introdução às frações","author":"Prof. Ana"}'
```

Respostas de erro: `400` para dados ou ID inválidos, `401` sem token, `403` com token inválido e `404` quando a postagem não existe.

## Testes

Os testes usam um banco separado definido em `MONGO_URI_TEST`.

```bash
npm test
```

Cobrem criação, leitura, atualização, exclusão, busca e a exigência de autenticação nas rotas de escrita.

## Integração contínua

A pipeline em `.github/workflows/ci.yml`:

1. Sobe um MongoDB 7 como serviço e roda os testes em cada push e pull request para `main`.
2. Só em push para `main`, e apenas se os testes passarem, constrói a imagem Docker e a publica no GitHub Container Registry.

## Decisões técnicas

- **App separada do servidor** (`app.js` e `index.js`): permite testar as rotas com Supertest sem abrir uma porta.
- **Campos editáveis em lista explícita**: o controlador só aceita `title`, `content` e `author`, evitando que o cliente altere campos internos como `_id` ou `createdAt`.
- **Leitura pública e escrita protegida**: qualquer pessoa lê as postagens, mas só quem tem token as altera.
- **Imagem Docker enxuta**: base `node:18-alpine`, apenas dependências de produção e execução com o usuário `node`, sem root.

## Configuração

| Variável | Obrigatória | Descrição |
|---|---|---|
| `MONGO_URI` | sim | String de conexão do MongoDB |
| `ACCESS_TOKEN_SECRET` | sim | Segredo usado para validar os tokens JWT |
| `PORT` | não | Porta do servidor (padrão 3000) |
| `MONGO_URI_TEST` | só para testes | Banco usado pelos testes automatizados |

Nunca versione o arquivo `.env`. Use o `.env.example` como modelo.
