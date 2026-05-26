# Sistema de Moeda Estudantil

Sistema que estimula o reconhecimento do mérito estudantil através de uma moeda virtual. Professores distribuem moedas a alunos como reconhecimento; empresas parceiras oferecem vantagens em troca dessas moedas.

> Projeto da disciplina **Laboratório de Desenvolvimento de Software** — Engenharia de Software, PUC Minas. Prof. **João Paulo Carneiro Aramuni**. Lab03 — Release 1 (concluída) · Lab04 — Release 2 (em andamento).

---

## Sumário
- [Visão geral](#visão-geral)
- [Status atual](#status-atual)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Subindo o projeto](#subindo-o-projeto)
- [Credenciais e perfis de teste](#credenciais-e-perfis-de-teste)
- [Roadmap de testes por perfil](#roadmap-de-testes-por-perfil)
- [Como validar mensageria e e-mail](#como-validar-mensageria-e-e-mail)
- [Documentação adicional](#documentação-adicional)
- [Cronograma das sprints](#cronograma-das-sprints)
- [Integrantes](#integrantes)

---

## Visão geral

A plataforma centraliza a economia interna de mérito de uma instituição de ensino:

- **Alunos** cadastram-se com seus dados, recebem moedas dos professores e consultam saldo/extrato. Trocam moedas por vantagens das empresas parceiras (geração de cupom + QR Code).
- **Professores** são cadastrados pelo administrador. Recebem **1.000 moedas iniciais** para distribuir como reconhecimento, com uma mensagem aberta e obrigatória. Podem fazer login pelo formulário normal ou por um **seletor com o próprio nome**.
- **Empresas parceiras** cadastram-se livremente, mantêm seu catálogo de vantagens e visualizam o histórico de resgates dos alunos.
- **Administrador** gerencia todos os atores (alunos, professores, empresas) e **ajusta saldos** quando necessário.
- Toda distribuição/resgate é registrada como **transação** consultável em extrato.
- Notificações de envio de moedas e de cupons são entregues **assincronamente via RabbitMQ + SMTP** (e WhatsApp opcional).

---

## Status atual

| User Story | Status |
|---|---|
| US01 — Autenticação JWT por papel (Aluno, Professor, Empresa, Admin) | ✅ |
| US01b — Login de professor por seletor (lista de nomes + senha) | ✅ |
| US02 — Cadastro de Aluno (CRUD final) | ✅ |
| US03 — Aluno consulta extrato e saldo | ✅ |
| US04 — Resgate de vantagens pelo aluno (com geração de cupom + QR Code) | ✅ |
| US05 — Professor distribui moedas (mensagem obrigatória, transação atômica) | ✅ |
| US06 — Professor consulta extrato e saldo | ✅ |
| US07 — CRUD de Vantagens pela empresa | ✅ |
| US08 — Crédito automático de 1.000 moedas/semestre | 🛠 em andamento |
| US09 — Notificação por e-mail de envio de moedas e cupons | ✅ |
| US10 — Notificação no WhatsApp do cupom de resgate | ✅ (Meta Cloud API opt-in) |
| CRUD admin de Empresa Parceira | ✅ |
| **CRUD admin de Professor** (novo) | ✅ |
| **Ajuste de saldo pelo admin** (alunos e professores, +/-) | ✅ |
| Infra de mensageria (RabbitMQ + exchange tópica + filas + DLQ) | ✅ |
| Toasts globais no canto superior direito (boas práticas Angular) | ✅ |

---

## Tecnologias

**Backend**
- Java 21
- Micronaut 4.10
- Hibernate / Micronaut Data JPA (ORM) + Flyway (migrations)
- Padrão DAO com `EntityManager`
- Micronaut Security JWT (Bearer, 4h) + BCrypt (custo 12)
- PostgreSQL 14+ (local via Docker ou Neon serverless)
- RabbitMQ 3 (mensageria de notificações) via `micronaut-rabbitmq`
- Jakarta Mail (SMTP) e Google ZXing 3.5.3 (geração de QR Code)
- `dotenv-java` para carregar `.env` em desenvolvimento
- Maven 3.9+

**Frontend**
- Angular 18 (standalone components, signals, lazy routes)
- Angular Material (snackbar) configurado em **canto superior direito** via `MAT_SNACK_BAR_DEFAULT_OPTIONS`
- TypeScript 5
- Design system próprio (tokens CSS, sem dependência de UI kit externo para os formulários)
- Node.js 20+ / npm

---

## Arquitetura

Arquitetura MVC com camadas bem separadas:

```
Controller (HTTP)  →  DTO  →  Service (regra)  →  Repository/DAO  →  Entity (JPA)  →  PostgreSQL
                                ↑                      ↓
                          JWT + RBAC          NotificationProducer
                                                       ↓
                                  RabbitMQ (exchange tópica → email.queue / whatsapp.queue / DLQ)
                                                       ↓
                                       Consumer → SmtpEmailService / WhatsAppService
```

Detalhes:
- **Login**: e-mail/senha (todos os papéis) OU seletor de professor (`GET /api/auth/professores` → `POST /api/auth/login-professor`).
- **Notificações**: produtor publica numa exchange tópica `notifications.exchange`; consumer assina as filas `email.queue` e `whatsapp.queue`. Falhas vão para `notifications.dlq`.

---

## Pré-requisitos

- **Java 21** (JDK)
- **Maven 3.9+** (o projeto já inclui `mvnw`)
- **Node.js 20+** e **npm**
- **Docker Desktop** (para subir PostgreSQL e RabbitMQ localmente)
- _Opcional:_ conta no **[Neon](https://neon.tech)** caso queira hospedar o Postgres na nuvem em vez de localmente.
- _Opcional (e-mail real):_ Conta Google com **App Password** (2FA ativo).

---

## Subindo o projeto

O backend lê configuração de um arquivo **`.env`** localizado em `Aplicacao/Backend/.env`. O arquivo **não** é versionado; use `.env.example` como template.

### 1. Configurar variáveis de ambiente

```powershell
cd Aplicacao\Backend
Copy-Item .env.example .env
```

Edite o `.env` com seus valores. Os blocos principais:

| Bloco | Variáveis | Quando preencher |
|---|---|---|
| Banco de dados | `DB_URL`, `DB_USER`, `DB_PASSWORD`, `DB_SKIP_BOOTSTRAP` | Sempre |
| JWT | `JWT_SECRET` | Sempre (use um segredo aleatório ≥ 256 bits) |
| CORS | `CORS_ALLOWED_ORIGIN` | Sempre (default: `http://localhost:4200`) |
| RabbitMQ | `RABBITMQ_URI` | Sempre — usado para notificações assíncronas |
| E-mail (SMTP) | `MAIL_ENABLED`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` | Quando ligar notificações por e-mail |
| WhatsApp | `WHATSAPP_ENABLED`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_TEMPLATE` | Quando ligar notificações no WhatsApp |

#### Postgres — Opção A (local via Docker)

```dotenv
DB_URL=jdbc:postgresql://localhost:5432/moedaestudantil
DB_USER=postgres
DB_PASSWORD=postgres
DB_SKIP_BOOTSTRAP=false
```

Com `DB_SKIP_BOOTSTRAP=false`, o backend tenta criar o database `moedaestudantil` automaticamente no primeiro startup.

#### Postgres — Opção B (Neon gerenciado)

```dotenv
DB_URL="jdbc:postgresql://ep-xxxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
DB_USER=neondb_owner
DB_PASSWORD=<senha-do-neon>
DB_SKIP_BOOTSTRAP=true
```

`DB_SKIP_BOOTSTRAP=true` é obrigatório no Neon — o banco já existe e a conta não tem permissão de `CREATE DATABASE`.

#### E-mail real via Gmail (opcional, recomendado pra demonstração)

1. Ative 2FA em https://myaccount.google.com/security
2. Gere uma **App Password** em https://myaccount.google.com/apppasswords (16 caracteres).
3. No `.env`:

```dotenv
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu.email@gmail.com
MAIL_PASSWORD=abcdefghijklmnop          # App Password sem espaços
MAIL_FROM=seu.email@gmail.com           # tem que ser igual ao USERNAME
MAIL_FROM_NAME=Sistema de Moeda Estudantil
MAIL_STARTTLS=true
```

> Se `MAIL_ENABLED=false`, o sistema simula o envio (apenas loga "[mail.enabled=false]") — o fluxo de fila continua funcionando.

### 2. Subir a infraestrutura local (RabbitMQ + opcionalmente Postgres)

```powershell
cd Aplicacao\Backend
docker compose up -d              # sobe Postgres + RabbitMQ
# OU, se estiver usando Neon, apenas o RabbitMQ:
docker compose up -d rabbitmq
```

Painel do RabbitMQ: `http://localhost:15672` (login `guest` / `guest`).

### 3. Backend

```powershell
cd Aplicacao\Backend
.\mvnw mn:run
```

Backend em `http://localhost:8080`. Endpoints REST sob `/api/*`. O Flyway roda as migrations automaticamente; o `DataSeeder` cria os perfis de teste no primeiro startup.

Swagger UI: `http://localhost:8080/swagger-ui` (clique em **Authorize** e cole o JWT obtido em `/api/auth/login`).

### 4. Frontend

```powershell
cd Aplicacao\Frontend
npm install
npm start
```

Frontend em `http://localhost:4200`.

---

## Credenciais e perfis de teste

O `DataSeeder` cria, no primeiro startup, os seguintes registros:

| Papel | E-mail | Senha | Observações |
|---|---|---|---|
| **Administrador** | `admin@studentcoins.com` | `admin123` | Acesso ao painel admin (alunos, professores, empresas, ajuste de saldo). |
| **Professor** | `joao.aramuni@puc.br` | `senha123` | CPF `11122233344`, vinculado à PUC Minas (Eng. de Software), saldo inicial **1.000 moedas**. Pode logar pelo seletor também. |
| **Aluno** | _(criar via /alunos/novo)_ | _(definida no cadastro)_ | Saldo inicial **0** — receberá moedas quando o professor distribuir ou pelo ajuste admin. |
| **Empresa Parceira** | _(criar via /empresas/novo)_ | _(definida no cadastro)_ | Cadastro aberto. |

**Instituições pré-cadastradas pelo seed:** PUC Minas, UFMG, CEFET-MG.

> Para usar e-mails reais, recadastre o professor seed via tela admin (Professores → Editar → trocar e-mail) ou edite `DataSeeder.java`.

---

## Roadmap de testes por perfil

Este roteiro percorre **todos os fluxos do sistema do zero**, simulando cada perfil de usuário. Executado em ordem, demonstra ponta a ponta: cadastro → distribuição → resgate → notificação por e-mail → ajuste administrativo.

> **Antes de começar:** certifique-se de que backend (`:8080`), frontend (`:4200`), RabbitMQ e Postgres estão no ar. Use 4 navegadores (ou janelas anônimas) para alternar entre perfis sem deslogar.

### Etapa 0 — Conferir que tudo está no ar

```powershell
# Containers Docker rodando
docker ps

# Filas declaradas e consumer conectado (consumers >= 1 em email.queue)
docker exec moedaestudantil-rabbitmq rabbitmqctl list_queues name messages consumers

# Backend respondendo
curl http://localhost:8080/api/auth/professores
```

A última chamada deve retornar pelo menos `[{"id":1,"nome":"Joao Paulo Aramuni"}]`.

### Etapa 1 — Administrador prepara o ambiente

Demonstra: **autenticação JWT, CRUD admin de aluno/professor/empresa, ajuste de saldo**.

**Pela UI** (`http://localhost:4200`):
1. Login: `admin@studentcoins.com` / `admin123`.
2. Menu **Professores** → "Novo professor" → preencha seu nome e seu **e-mail real** (ex: `seu.email+prof@gmail.com`) → senha `prof123` → salvar.
3. Menu **Alunos** → vai precisar de um aluno cadastrado. Crie pelo fluxo público (Etapa 3) ou volte aqui depois.
4. Menu **Empresas** → também criada pelo fluxo público (Etapa 2).
5. Após existirem alunos e professores: clique no ícone **moeda** (paid) de qualquer linha → modal abre → digite `+500` ou `-100` → confirmar → toast aparece no canto superior direito.

**Pela API** — pegando token primeiro:

```powershell
# Login admin (PowerShell, captura o token na variável $token)
$resp = curl -s -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@studentcoins.com\",\"senha\":\"admin123\"}'
$token = ($resp | ConvertFrom-Json).token
$token   # confira que aparece um JWT
```

```powershell
# Cadastrar um professor com SEU e-mail real
curl -X POST http://localhost:8080/api/professores `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{\"nome\":\"Professor Teste\",\"email\":\"seu.email+prof@gmail.com\",\"senha\":\"prof123\",\"cpf\":\"99988877766\",\"departamento\":\"Computação\",\"instituicaoId\":1}'
```

```powershell
# Ajustar saldo do aluno id=2: +500 moedas
curl -X POST http://localhost:8080/api/alunos/2/saldo `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{\"quantidade\":500}'

# Tirar 200 moedas do professor id=1
curl -X POST http://localhost:8080/api/professores/1/saldo `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{\"quantidade\":-200}'
```

✅ **O que validar:**
- UI: badge "M$" da linha muda imediatamente após o ajuste; toast verde no canto superior direito.
- API: retorna 200 com o objeto atualizado. Se tentar tirar mais do que o saldo, recebe 409 com `SaldoInsuficienteException`.

### Etapa 2 — Empresa Parceira cadastra-se e cria vantagens

Demonstra: **cadastro público, login, CRUD de vantagens**.

**Pela UI:**
1. Em `/login`, clique em "Criar agora" → "Sou Empresa Parceira".
2. Preencha CNPJ, nome fantasia, e-mail (use outro alias seu, ex: `seu.email+empresa@gmail.com`), senha `empresa123`.
3. Após cadastro, faça login com o e-mail/senha cadastrados.
4. Menu **Vantagens** → "Nova vantagem" → preencha nome, descrição, preço (ex: 200 moedas), foto opcional → salvar.
5. Crie 2-3 vantagens diferentes (cinema, livro, brinde).

**Pela API:**

```powershell
# Cadastrar empresa (sem token — endpoint público)
curl -X POST http://localhost:8080/api/empresas `
  -H "Content-Type: application/json" `
  -d '{\"nomeFantasia\":\"Loja Teste\",\"cnpj\":\"12345678000999\",\"email\":\"seu.email+empresa@gmail.com\",\"senha\":\"empresa123\",\"telefone\":\"+5531999999999\"}'

# Login empresa
$resp = curl -s -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"seu.email+empresa@gmail.com\",\"senha\":\"empresa123\"}'
$tokenEmpresa = ($resp | ConvertFrom-Json).token

# Criar vantagem (vou supor que a empresa criada tem id=1; ajuste se necessário)
curl -X POST http://localhost:8080/api/vantagens `
  -H "Authorization: Bearer $tokenEmpresa" `
  -H "Content-Type: application/json" `
  -d '{\"nome\":\"Cinema CineSystem\",\"descricao\":\"1 ingresso comum\",\"precoMoedas\":200,\"empresaId\":1}'
```

✅ **O que validar:**
- Aluno verá essa vantagem no catálogo em `/alunos/vantagens`.

### Etapa 3 — Aluno cadastra-se e ganha o primeiro saldo

Demonstra: **cadastro de aluno, recebimento de moedas via professor, extrato**.

**Pela UI:**
1. Em `/login`, "Criar agora" → "Sou Aluno".
2. Preencha tudo (use CEP real, ele preenche o endereço automaticamente). E-mail: `seu.email+aluno@gmail.com`. Senha `aluno123`.
3. Login com essas credenciais → cai no painel `/alunos/painel`. Saldo inicial: 0.

### Etapa 4 — Professor distribui moedas (gatilho de notificação)

Demonstra: **login por seletor, transação atômica, mensageria, e-mail**.

**Pela UI — login pelo seletor (novo):**
1. Em `/login`, clique em "**Sou professor — entrar pelo seletor**".
2. Lista carrega via `GET /api/auth/professores` (público, retorna só id+nome).
3. Selecione "Professor Teste" (o que você criou na Etapa 1), digite a senha (`prof123`) → entrar.

**Distribuir moedas:**
1. Menu **Distribuir**.
2. Selecione o aluno cadastrado, quantidade `87`, mensagem `Excelente participação na aula de hoje`.
3. Enviar.

**Pela API:**

```powershell
# Login professor pelo seletor (professorId=2 — ajuste se necessário)
$resp = curl -s -X POST http://localhost:8080/api/auth/login-professor `
  -H "Content-Type: application/json" `
  -d '{\"professorId\":2,\"senha\":\"prof123\"}'
$tokenProf = ($resp | ConvertFrom-Json).token

# Distribuir 87 moedas pro aluno id=2
curl -X POST http://localhost:8080/api/professores/2/distribuir `
  -H "Authorization: Bearer $tokenProf" `
  -H "Content-Type: application/json" `
  -d '{\"alunoId\":2,\"quantidade\":87,\"mensagem\":\"Excelente participação em aula.\"}'
```

✅ **O que validar:**
- **Saldos atualizados atomicamente**: o saldo do professor cai 87; o do aluno sobe 87.
- **Logs do backend** (no terminal do `mvnw`):
  ```
  EmailNotificationConsumer - Consumindo mensagem de e-mail: ... para=seu.email+aluno@gmail.com
  SmtpEmailService          - E-mail enviado para seu.email+aluno@gmail.com (assunto='Voce recebeu 87 moedas!')
  EmailNotificationConsumer - Consumindo mensagem de e-mail: ... para=seu.email+prof@gmail.com
  SmtpEmailService          - E-mail enviado para seu.email+prof@gmail.com (assunto='Confirmacao: 87 moedas enviadas')
  ```
- **Caixa de entrada** do `+aluno` recebe "Você recebeu 87 moedas!" e a do `+prof` recebe a confirmação.
- **Extrato** do professor (`/professor/extrato`) e do aluno (`/alunos/extrato`) mostram a transação.

### Etapa 5 — Aluno resgata uma vantagem (cupom + QR Code + e-mail anexo)

Demonstra: **resgate, geração de QR Code (ZXing), notificação ao aluno e à empresa, opcional WhatsApp**.

**Pela UI:**
1. Login como o aluno.
2. Menu **Vantagens** → escolha a vantagem cadastrada na Etapa 2 → "Resgatar".
3. Confirmar → toast de sucesso.
4. Menu **Meus cupons** → cupom aparece com código + QR Code embutido.

**Pela API:**

```powershell
# Login aluno
$resp = curl -s -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"seu.email+aluno@gmail.com\",\"senha\":\"aluno123\"}'
$tokenAluno = ($resp | ConvertFrom-Json).token

# Resgatar vantagem id=1
curl -X POST http://localhost:8080/api/resgates `
  -H "Authorization: Bearer $tokenAluno" `
  -H "Content-Type: application/json" `
  -d '{\"vantagemId\":1}'
```

A resposta retorna o cupom: `{ "codigoCupom": "ABC123", "qrCodeBase64": "iVBORw0...", ... }`.

✅ **O que validar:**
- **Saldo do aluno**: caiu o preço da vantagem.
- **E-mail do aluno** chega com o QR Code **inline** (embutido na imagem, não link).
- **E-mail da empresa** chega notificando "Cupom resgatado: <vantagem>".
- **Filas no Rabbit** durante o resgate:
  ```powershell
  docker exec moedaestudantil-rabbitmq rabbitmqctl list_queues name messages
  ```
  Mostra `email.queue` com `messages > 0` por uma fração de segundo antes do consumer processar.

### Etapa 6 — Empresa valida o cupom apresentado pelo aluno

Demonstra: **fluxo de validação no comércio físico**.

**Pela UI:**
1. Login empresa.
2. Menu **Trocas** (relatório) → lista os cupons resgatados, status (válido/usado/expirado).

**Pela API:**

```powershell
# Listar cupons da empresa (id=1 — autenticada)
curl -H "Authorization: Bearer $tokenEmpresa" http://localhost:8080/api/empresas/1/cupons
```

### Etapa 7 — Admin ajusta saldo (reset / brinde)

Demonstra: **operação administrativa direta de saldo**.

**Pela UI:**
1. Login admin.
2. Menu **Alunos** → ícone moeda na linha do aluno → +1000 → confirmar.
3. Volte no aluno (login) → saldo atualizado.

✅ **O que validar:** valida a regra que **impede saldo negativo**. Tente tirar mais do que o aluno tem → toast vermelho no canto superior direito com mensagem do back: "Saldo insuficiente".

---

## Como validar mensageria e e-mail

### Confirmar que a fila está funcionando (sem o painel)

```powershell
# Quantas mensagens em cada fila + quantos consumers
docker exec moedaestudantil-rabbitmq rabbitmqctl list_queues name messages messages_ready consumers

# Topologia declarada pelo MessagingConfig do backend
docker exec moedaestudantil-rabbitmq rabbitmqctl list_exchanges
docker exec moedaestudantil-rabbitmq rabbitmqctl list_bindings
```

### Publicar uma mensagem direto pelo CLI (sem usar o backend produtor)

Prova ponta a ponta da topologia:

```powershell
docker exec moedaestudantil-rabbitmq rabbitmqadmin publish `
  exchange=notifications.exchange `
  routing_key=notification.email.aluno-moeda `
  payload='{\"tipo\":\"teste\",\"para\":\"seu.email@gmail.com\",\"assunto\":\"Teste CLI\",\"template\":\"moeda-recebida-aluno\",\"variaveis\":{\"nomeAluno\":\"Teste\",\"nomeProfessor\":\"CLI\",\"quantidade\":\"1\",\"mensagem\":\"oi\",\"saldoAtual\":\"10\",\"dataHora\":\"26/05/2026 15:30\"}}' `
  properties='{\"content_type\":\"application/json\"}'
```

O consumidor processa e o e-mail chega. Os logs do backend mostrarão `Consumindo mensagem...` e `E-mail enviado para...`.

### Forçar falha pra demonstrar a DLQ

1. Edite `.env`, troque `MAIL_PASSWORD` por algo inválido. Restart no backend.
2. Distribua moedas pela UI → SMTP falha → mensagem é nack-ada → cai na `notifications.dlq`.
3. Verifique:
   ```powershell
   docker exec moedaestudantil-rabbitmq rabbitmqctl list_queues name messages
   ```
   `notifications.dlq` agora tem `messages > 0`. Sua topologia tem resiliência ✅.

---

## Documentação adicional

- **[Descrição do problema (PDF)](Descrição%20Problema%20Lab%2003%20Release1.pdf)** — Especificação original da Release 1.
- **[Histórias de Usuário (PDF)](docs/Histórias-de-Usuário.pdf)** — US01 a US10.
- Diagramas UML em `docs/` (Caso de Uso, Classes, Componentes, ER).
- Coleção Insomnia em `docs/insomnia-collection.json` (chamadas prontas).

---

## Cronograma das sprints

| Sprint | Entrega | Status |
|---|---|---|
| **Lab03S01** | Diagrama de Casos de Uso, Histórias de Usuário, Diagrama de Classes, Diagrama de Componentes | ✅ |
| **Lab03S02** | Modelo ER, estratégia ORM + DAO, CRUDs iniciais de Aluno e Empresa Parceira | ✅ |
| **Lab03S03** | CRUDs versão final + camada de persistência + arquitetura + feature de Professor | ✅ |
| **Lab04S01** | Infra base (RabbitMQ + Mail + ZXing), notificação de envio de moedas, job semestral | ✅ (job 🛠) |
| **Lab04S02** | CRUD de Vantagem + listagem para aluno + diagramas de sequência | ✅ |
| **Lab04S03** | Resgate + geração de QR Code + WhatsApp Cloud API + diagrama geral | ✅ |
| **Lab05S01** | Deploy cloud (Render + Vercel + Neon + CloudAMQP) + diagramas de Comunicação e Implantação | ⏸ pendente |
| **Lab05S02** | Análise crítica de outro grupo + 3 PRs de refatoração | ⏸ pendente |

---

## Integrantes

- [Henrique Carvalho](https://github.com/henriquegdc)
- [João Pedro Moura Santos](https://github.com/JoaoMouraS)
- [Miguel Gomes](https://github.com/Miguelgdn1)

## Professor

[João Paulo Aramuni](https://github.com/joaopauloaramuni)
