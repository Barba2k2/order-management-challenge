# Desafio Técnico Backend - Order Management API

**Objetivo:** Avaliar organização de código, domínio de TypeScript e implementação de regras de negócio.
**Stack:** Node.js, NestJS, Mongoose, TypeScript, MongoDB.
**Testes:** Vitest (Diferencial).

### Estrutura de Dados

**1. User**
* `email` (unique), `password`.

**2. Order**
* Campos: `lab`, `patient`, `customer` (strings).
* `state`: `CREATED` -> `ANALYSIS` -> `COMPLETED`.
* `status`: `ACTIVE` | `DELETED`.
* `services` (Array obrigatório): `{ name: string, value: number, status: 'PENDING' | 'DONE' }`.

---

### ETAPA 1: Essencial (Obrigatório)

1. **Autenticação:**
* Registro e Login retornando JWT.
* Middleware de proteção para rotas de pedidos.

2. **Gestão de Pedidos:**
* **POST /orders:** Criação do pedido. Padrão: `state: CREATED`, `status: ACTIVE`.
* **GET /orders:** Listagem com paginação e filtro por `state`.

---

### ETAPA 2: Diferencial (Regras e Qualidade)

1. **Validação de Negócio:**
* Não permitir criação de pedidos sem serviços ou com valor total zerado.

2. **Fluxo de Status:**
* Endpoint `PATCH /orders/:id/advance`.
* A transição deve respeitar a ordem estrita: `CREATED` -> `ANALYSIS` -> `COMPLETED`.
* Bloquear tentativas de pular etapas ou retroceder.

3. **Testes (Vitest):**
* Teste unitário garantindo que a lógica de transição de `state` funciona e bloqueia ações inválidas.

---

### Critérios de Avaliação

* **Arquitetura:** Separação de responsabilidades e clareza.
* **TypeScript:** Uso correto de tipagem.
* **Mongoose:** Modelagem e queries eficientes.
* **Commits:** Histórico e organização no Git.

---

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js (v18 ou superior)
- MongoDB (local ou remoto)
- Docker e Docker Compose (opcional)

### Instalação Local

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd order_management_challenge
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute a aplicação:
```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`

### Execução com Docker

1. Execute o comando:
```bash
docker-compose up -d
```

A API estará disponível em `http://localhost:3000`

---

## ⚙️ Variáveis de Ambiente

O projeto utiliza as seguintes variáveis de ambiente:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/order_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Application Configuration
PORT=3000
```

Para configurar as variáveis de ambiente localmente, crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:

```bash
cp .env.example .env
```

---

## 🧪 Testes

Para executar os testes:

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:e2e

# Testes unitários em modo watch
npm run test:watch
```

## 📦 Postman Collection

Uma coleção do Postman com todos os endpoints da API está disponível na pasta `postman/` para facilitar os testes manuais:

```
postman/
└── Order_Management_API.postman_collection.json
```

Para usar a coleção:
1. Importe o arquivo JSON no Postman
2. Configure uma variável de ambiente com a URL base (ex: `http://localhost:3000/api`)
3. Registre e faça login para obter o token de autenticação
4. Use os endpoints para testar a funcionalidade da API

---

## 📋 Endpoints da API

### Autenticação

- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login de usuário

### Pedidos

- `POST /api/orders` - Criação de pedido (requer autenticação)
- `GET /api/orders` - Listagem de pedidos com paginação e filtro (requer autenticação)
- `PATCH /api/orders/:id/advance` - Avanço de estado do pedido (requer autenticação)

---

## 🏗️ Arquitetura

O projeto segue o padrão de Clean Architecture com as seguintes camadas:

- **Domain Layer**: Entidades e regras de negócio
- **Application Layer**: Casos de uso e DTOs
- **Infrastructure Layer**: Implementações de repositórios, autenticação e configurações
- **Presentation Layer**: Controladores e middleware

---

## 📅 Prazo de Entrega

A data limite para submissão do link do repositório é **04/01**. Envios após essa data não serão considerados. Bom código!

**Entrega:** Link do repositório com instruções de execução no README.
