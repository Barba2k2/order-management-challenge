# Order Management API

API REST para gerenciamento de pedidos construída com NestJS, MongoDB e TypeScript, seguindo princípios de Clean Architecture.

## Sobre o Desafio

Este projeto foi desenvolvido como solução para um desafio técnico backend, com foco em:

- **Organização de código** - Clean Architecture com separação de responsabilidades
- **TypeScript** - Tipagem estática em toda a aplicação
- **Regras de negócio** - Validações e máquina de estados
- **Testes** - Cobertura com Vitest (unitários e E2E)

### Requisitos Implementados

**Etapa 1 - Essencial:**
- [x] Autenticação com registro/login e JWT
- [x] Middleware de proteção de rotas
- [x] CRUD de pedidos com paginação e filtros

**Etapa 2 - Diferencial:**
- [x] Validação: pedidos sem serviços ou valor zerado são rejeitados
- [x] Máquina de estados com transições estritas
- [x] Testes unitários e E2E com Vitest

## Stack

- **Node.js** (v18+)
- **NestJS** - Framework backend
- **MongoDB** - Banco de dados
- **Mongoose** - ODM
- **TypeScript** - Tipagem estática
- **Vitest** - Testes unitários e E2E
- **JWT** - Autenticação
- **Docker** - Containerização

## Arquitetura

O projeto segue **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── domain/                    # Camada de Domínio
│   ├── entities/              # Entidades de negócio
│   ├── repositories/          # Interfaces de repositórios
│   ├── services/              # Serviços de domínio
│   └── exceptions/            # Exceções de domínio
├── application/               # Camada de Aplicação
│   ├── dtos/                  # Data Transfer Objects
│   ├── use-cases/             # Casos de uso
│   └── validators/            # Validadores de negócio
├── infrastructure/            # Camada de Infraestrutura
│   ├── auth/                  # Serviço de autenticação JWT
│   ├── database/              # Schemas e repositórios MongoDB
│   ├── exceptions/            # Filtros de exceção
│   └── middleware/            # Middlewares
└── presentation/              # Camada de Apresentação
    └── controllers/           # Controllers REST
```

## Funcionalidades

### Autenticação
- Registro de usuários com email/senha
- Login com geração de JWT
- Middleware de proteção de rotas

### Gestão de Pedidos
- Criação de pedidos com serviços
- Listagem com paginação e filtro por estado
- Máquina de estados: `CREATED` → `ANALYSIS` → `COMPLETED`
- Validação de transições (não permite pular etapas ou retroceder)

### Validações de Negócio
- Pedidos devem ter ao menos um serviço
- Valor total não pode ser zero
- Transições de estado seguem ordem estrita

## Instalação

### Com Docker (Recomendado)

```bash
docker-compose up -d
```

A API estará disponível em `http://localhost:3000`

### Local

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Execute a aplicação:
```bash
npm run start:dev
```

## Variáveis de Ambiente

```env
MONGODB_URI=mongodb://localhost:27017/order_management
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

## Testes

```bash
# Todos os testes
npm run test

# Testes E2E
npm run test:e2e

# Modo watch
npm run test:watch

# Coverage
npm run test:cov
```

## Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registro de usuário |
| POST | `/api/auth/login` | Login |

### Pedidos (Autenticado)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/orders` | Criar pedido |
| GET | `/api/orders` | Listar pedidos |
| PATCH | `/api/orders/:id/advance` | Avançar estado |

### Exemplos

**Registro:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Criar Pedido:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "lab": "Lab Test",
    "patient": "Patient Name",
    "customer": "Customer Name",
    "services": [{"name": "Service 1", "value": 100, "status": "PENDING"}]
  }'
```

## Postman

Uma coleção do Postman está disponível em `postman/Order_Management_API.postman_collection.json`.
