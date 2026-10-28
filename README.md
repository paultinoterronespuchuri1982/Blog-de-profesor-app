# Blog de Professor

API REST em Node.js e Express para criar, ler, editar, apagar e buscar postagens de um blog.
Os dados ficam em MongoDB (Mongoose).

## Endpoints

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/posts` | não | Lista as postagens. |
| GET | `/posts/search?...` | não | Busca por palavras-chave. |
| GET | `/posts/:id` | não | Lê uma postagem. |
| POST | `/posts` | token | Cria uma postagem. |
| PUT | `/posts/:id` | token | Edita uma postagem. |
| DELETE | `/posts/:id` | token | Apaga uma postagem. |

As rotas que alteram dados exigem o cabeçalho `Authorization: Bearer <token>`, com um JWT assinado
com `ACCESS_TOKEN_SECRET`. Sem token, a resposta é `401`. Com token inválido, é `403`.

## Como rodar

Requisitos: Node.js 18 ou superior e MongoDB.

Crie um arquivo `.env` na pasta `src/` (não versione):

```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/blog
ACCESS_TOKEN_SECRET=troque-por-um-valor-secreto
```

```bash
npm install
node src/index.js
```

## Testes

Os testes usam Jest e Supertest, e precisam de um MongoDB em `127.0.0.1:27017`.

```bash
npm test
```

O CI sobe um MongoDB como serviço antes de rodar os testes.

## Estrutura

- `src/index.js`: inicia o servidor e conecta ao banco.
- `src/routes/posts.js`: rotas das postagens.
- `src/controllers/postcontroller.js`: lógica das rotas.
- `src/models/Post.js`: modelo do Mongoose.
- `src/middlewares/auth.js`: verifica o token JWT.
- `src/tests/post.test.js`: testes dos endpoints.
- `dockerfile`: imagem Docker da aplicação.

## Pendências

- A rota `GET /posts/admin`, que o README anterior descrevia, não existe. Decida se precisa dela.
- Não há rota de login que emita o token. Por enquanto, o token deve vir de outro serviço.
