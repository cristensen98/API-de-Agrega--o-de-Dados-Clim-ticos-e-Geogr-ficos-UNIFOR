# 🌦️ API de Agregação de Dados — Cidades e Clima Brasileiros

API REST que integra dados geográficos e climáticos de municípios brasileiros,
combinando informações da **Brasil API** (IBGE + CPTEC) em respostas padronizadas.

## 👥 Integrantes

| Nome                                  | Matrícula |
|---------------------------------------|-----------|
| Cristensen Ubiratan Moreira Porpino   | 2425258   |
| João Paulo Gomes dos Santos           | 2012346   |

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd api-agregacao

# Instale as dependências
npm install
```

### Iniciar o servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (reinicia ao salvar)
npm run dev
```

A API estará disponível em: **http://localhost:3000**

### Executar os testes

```bash
npm test
```

---

## 📋 Endpoints

### `GET /api/v1/health`

Verifica se a API e os serviços externos estão operacionais.

**Resposta (200 — saudável):**
```json
{
  "status": "healthy",
  "versao": "1.0.0",
  "timestamp": "2025-03-15T14:30:00Z"
}
```

**Resposta (200 — degradado):**
```json
{
  "status": "degraded",
  "versao": "1.0.0",
  "timestamp": "2025-03-15T14:30:00Z",
  "motivo": "Serviço externo indisponível"
}
```

---

### `GET /api/v1/clima/{nome_cidade}`

Retorna dados geográficos e climáticos de uma cidade brasileira.

**Parâmetros:**

| Parâmetro    | Tipo   | Obrigatório | Descrição       |
|--------------|--------|-------------|-----------------|
| `nome_cidade`| String | Sim         | Nome da cidade  |

**Exemplo:**
```
GET /api/v1/clima/Fortaleza
```

**Resposta (200 — sucesso):**
```json
{
  "nome": "Fortaleza",
  "estado": "CE",
  "clima": {
    "temperatura_min": 24,
    "temperatura_max": 32,
    "condicao": "Parcialmente Nublado",
    "unidades": {
      "temperatura": "°C"
    }
  },
  "consultado_em": "2025-03-15T14:30:00Z"
}
```

**Respostas de erro:**

| Código | Status HTTP | Descrição                      |
|--------|-------------|--------------------------------|
| `NOME_INVALIDO`                | 400 | Nome com menos de 2 caracteres |
| `CIDADE_NAO_ENCONTRADA`        | 404 | Cidade não encontrada          |
| `SERVICO_EXTERNO_INDISPONIVEL` | 503 | API externa fora do ar         |

---

### `GET /api/v1/cidades/{sigla_uf}`

Lista municípios de um estado brasileiro.

**Parâmetros de rota:**

| Parâmetro  | Tipo   | Obrigatório | Descrição                       |
|------------|--------|-------------|----------------------------------|
| `sigla_uf` | String | Sim         | Sigla do estado (2 letras maiúsculas) |

**Parâmetros de query:**

| Parâmetro | Tipo    | Default | Descrição                           |
|-----------|---------|---------|-------------------------------------|
| `limite`  | Integer | 10      | Quantidade máxima de cidades (1–100)|

**Exemplo:**
```
GET /api/v1/cidades/CE?limite=5
```

**Resposta (200 — sucesso):**
```json
{
  "uf": "CE",
  "quantidade_retornada": 5,
  "cidades": [
    { "nome": "Abaiara" },
    { "nome": "Acarape" },
    { "nome": "Acaraú" },
    { "nome": "Acopiara" },
    { "nome": "Aiuaba" }
  ],
  "consultado_em": "2025-03-15T14:30:00Z"
}
```

**Respostas de erro:**

| Código | Status HTTP | Descrição               |
|--------|-------------|-------------------------|
| `SIGLA_UF_INVALIDA`            | 400 | Sigla não tem 2 letras  |
| `UF_NAO_ENCONTRADA`            | 404 | Estado não encontrado   |
| `SERVICO_EXTERNO_INDISPONIVEL` | 503 | API externa fora do ar  |

---

## 🔄 Fluxo de Integração

```
Cliente → GET /api/v1/clima/{cidade}
         ↓
     Sua API recebe a requisição
         ↓
     Brasil API CPTEC — busca cidade por nome
     → obtém: código, estado
         ↓
     Brasil API CPTEC — busca previsão pelo código
     → obtém: temp_min, temp_max, condição
         ↓
     Combina dados geográficos + climáticos
         ↓
     Resposta JSON padronizada → Cliente
```

---

## 🌐 APIs Utilizadas

- **Brasil API — CPTEC** (busca de cidades e dados meteorológicos):
  https://brasilapi.com.br/docs#tag/CPTEC
- **Brasil API — IBGE** (listagem de municípios por estado):
  https://brasilapi.com.br/docs#tag/IBGE

---

## 📁 Estrutura do Repositório

```
/
├── README.md                   # Documentação principal
├── INTEGRANTES.md              # Dados da equipe
├── package.json
├── src/
│   ├── index.js                # Entry point da aplicação
│   └── routes/
│       ├── health.js           # Rota /api/v1/health
│       ├── clima.js            # Rota /api/v1/clima/:nome_cidade
│       └── cidades.js          # Rota /api/v1/cidades/:sigla_uf
├── tests/
│   └── api.test.js             # Testes automatizados (Jest + Supertest)
└── docs/
    └── postman_collection.json # Coleção Postman exportada
```

---

## ✅ Checklist de Entrega

- [x] Repositório público no GitHub
- [x] `INTEGRANTES.md` no formato correto
- [x] API responde em `http://localhost:3000`
- [x] `GET /api/v1/health` retorna HTTP 200
- [x] `GET /api/v1/clima/Fortaleza` retorna dados climáticos
- [x] `GET /api/v1/cidades/CE` retorna lista de cidades
- [x] Erros retornam códigos HTTP corretos (400, 404, 503)
- [x] Formato JSON segue a especificação
- [x] Coleção Postman em `docs/postman_collection.json`
- [x] Mínimo 2 testes na pasta `tests/`
