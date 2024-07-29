# Blog-de-profesor-app

Arquitetura da Aplicação

server.js: Arquivo principal do servidor, responsável por configurar e iniciar a aplicação.

models/Post.js: Modelo de dados para as postagens.

controllers/postController.js: Controladores para gerenciar as operações CRUD de postagens.

routes/postRoutes.js: Definição das rotas para as postagens.

Dockerfile: Configuração para containerização da aplicação.

docker-compose.yml: Configuração do Docker Compose para gerenciar múltiplos containers.

tests/post.test.js: Testes automatizados para os endpoints da aplicação.


Endpoints da API

GET /posts: Lista de postagens.

GET /posts/
: Leitura de uma postagem específica.

POST /posts: Criação de postagens.

PUT /posts/
: Edição de postagens.

DELETE /posts/
: Exclusão de postagens.

GET /posts/search: Busca de postagens por palavras-chave.

GET /posts/admin: Listagem de todas as postagens (visão administrativa).

Cobertura de Testes
A cobertura de testes deve ser de pelo menos 30%. Utilize Jest e Supertest para implementar e rodar os testes.

Autenticação e Autorização
Os endpoints que modificam dados (POST, PUT, DELETE) devem incluir autenticação e autorização adequadas.
