# Blog de Professor

API REST em Node.js e Express para criar, ler, editar, apagar e buscar postagens de um blog.
Os dados ficam em MongoDB (Mongoose).

## Endpoints

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/login` | não | Recebe `username` e `password` e devolve um token (1 hora). |
| GET | `/posts` | não | Lista as postagens, da mais nova para a mais antiga. |
| GET | `/posts/search?q=termo` | não | Busca por palavras no título e no conteúdo. |
| GET | `/posts/:id` | não | Lê uma postagem. |
| POST | `/posts` | token | Cria uma postagem. |
| PUT | `/posts/:id` | token do dono | Edita uma postagem. |
| DELETE | `/posts/:id` | token do dono | Apaga uma postagem. |

Rotas que alteram dados exigem `Authorization: Bearer <token>`.

- Sem token: `401`.
- Token inválido ou expirado: `403`.
- Post de outro usuário: `403`.

Exemplo de login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"sua-senha"}'
```

## Como rodar

Requisitos: Node.js 18 ou superior e MongoDB.

1. Copie `.env.example` para `src/.env` e preencha os valores.
2. Gere o hash da senha do professor:

   ```bash
   node scripts/hash-password.js < /dev/tty
   ```

   Cole o resultado em `ADMIN_PASSWORD_HASH`.

3. Inicie:

   ```bash
   npm install
   node src/index.js
   ```

## Docker

```bash
docker build -t blog-de-professor-app .
docker run --env-file src/.env -p 3000:3000 blog-de-professor-app
```

A imagem não inclui `.env` (veja `.dockerignore`) e roda como usuário não-root.

## Testes

Os testes usam Jest e Supertest e precisam de MongoDB em `127.0.0.1:27017`.

```bash
npm test
```

O CI sobe um MongoDB como serviço antes de rodar os testes.

## Segurança

- Senhas não ficam em texto puro: o hash usa scrypt, da biblioteca padrão do Node.
- Tokens JWT são assinados com HS256 e expiram em 1 hora.
- Cada post guarda o dono. Só o dono pode editar ou apagar.
- Erros internos não são enviados ao cliente; ficam no log do servidor.
- O corpo das requisições é limitado a 10 KB.
- Entradas são validadas (tamanho e tipo) antes de chegar ao banco.

Ainda não há limite de requisições (rate limit) nem `helmet`. Antes de publicar, adicione os dois.

## Estrutura

- `src/index.js`: inicia o servidor depois de conectar ao banco.
- `src/routes/auth.js`: login.
- `src/routes/posts.js`: rotas das postagens.
- `src/controllers/postcontroller.js`: lógica das rotas e validações.
- `src/models/Post.js`: modelo do Mongoose, com índice de texto para a busca.
- `src/middlewares/auth.js`: verifica o token JWT.
- `src/utils/password.js`: hash e verificação de senha.
- `scripts/hash-password.js`: gera o hash da senha do professor.
- `src/tests/post.test.js`: testes dos endpoints.

## Limitações conhecidas

- Há um único usuário (o professor), configurado por variáveis de ambiente.
- Posts criados antes desta versão não têm dono, então ninguém consegue editá-los ou apagá-los pela API.
