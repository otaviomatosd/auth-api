Auth API

API REST para autenticação de usuários desenvolvida com Node.js.

                                                        ---------Sobre o projeto----------

Esta API permite o cadastro e login de usuários com autenticação baseada em JSON Web Token (JWT). As senhas são armazenadas de forma segura utilizando criptografia com bcrypt.
Este projeto faz parte de um sistema completo de autenticação com frontend em Vue.js e backend em Node.js.

 Tecnologias

* Node.js
* Express
* JSON Web Token (JWT)
* Bcrypt

 Funcionalidades

* Registro de usuário
* Login com geração de token
* Proteção de rotas com middleware de autenticação
* CRUD de usuários

 Estrutura do projeto

controllers/
models/
routes/
middleware/
database/

Como executar o projeto

1. Clone o repositório:

git clone https://github.com/otaviomatosd/auth-api.git
cd auth-api

2. Instale as dependências:

npm install

3. Crie um arquivo `.env` na raiz do projeto com as variáveis:

PORT=3000
JWT_SECRET=sua_chave_secreta

4. Execute a aplicação:

npm run dev

## Autenticação

Para acessar rotas protegidas, envie o token no header:

Authorization: Bearer SEU_TOKEN

 Rotas principais

* POST /register
* POST /login
* GET /users
* GET /users/:id
* PUT /users/:id
* DELETE /users/:id

Observações

* O arquivo `.env` não deve ser versionado.
* A pasta `node_modules` é ignorada pelo Git.

 Frontend

Interface disponível em:
https://github.com/otaviomatosd/auth-vue

Autor

Otávio Matos

