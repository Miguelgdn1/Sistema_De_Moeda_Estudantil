# Sistema de Moeda Estudantil

Sistema que estimula o reconhecimento do mérito estudantil através de uma moeda virtual. Professores distribuem moedas a alunos como reconhecimento; empresas parceiras oferecem vantagens em troca dessas moedas.

> Projeto da disciplina **Laboratório de Desenvolvimento de Software** — Engenharia de Software, PUC Minas. Prof. **João Paulo Carneiro Aramuni**. Release 1 (Lab03) · Release 2 (Lab04) · Release 3 (Lab05).

---

## Sumário
- [Visão geral](#visão-geral)
- [Status atual](#status-atual)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Guia de instalação para iniciantes (Windows · macOS · Linux)](#guia-de-instalação-para-iniciantes-windows--macos--linux)
  - [1. Instalar os programas necessários](#1-instalar-os-programas-necessários)
  - [2. Baixar o projeto](#2-baixar-o-projeto)
  - [3. Configurar o arquivo `.env`](#3-configurar-o-arquivo-env)
  - [4. Subir a infraestrutura (Docker)](#4-subir-a-infraestrutura-docker)
  - [5. Rodar o backend](#5-rodar-o-backend)
  - [6. Rodar o frontend](#6-rodar-o-frontend)
  - [7. Abrir o sistema](#7-abrir-o-sistema)
- [Integração com WhatsApp (API não oficial)](#integração-com-whatsapp-api-não-oficial)
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
- **Professores** são cadastrados pelo administrador. Recebem **1.000 moedas por semestre** para distribuir como reconhecimento, com uma mensagem aberta e obrigatória. Podem fazer login pelo formulário normal ou por um **seletor com o próprio nome**.
- **Empresas parceiras** cadastram-se livremente, mantêm seu catálogo de vantagens e visualizam o histórico de resgates dos alunos.
- **Administrador** gerencia todos os atores (alunos, professores, empresas) e **ajusta saldos** quando necessário.
- Toda distribuição/resgate é registrada como **transação** consultável em extrato.
- Notificações de envio de moedas e de cupons são entregues **assincronamente via RabbitMQ**, por **e-mail (SMTP)** e por **WhatsApp (API não oficial, opcional)**.

---

## Status atual

| User Story / Recurso | Status |
|---|---|
| US01 — Autenticação JWT por papel (Aluno, Professor, Empresa, Admin) | ✅ |
| US01b — Login de professor por seletor (lista de nomes + senha) | ✅ |
| US02 — Cadastro de Aluno (CRUD final) | ✅ |
| US03 — Aluno consulta extrato e saldo | ✅ |
| US04 — Resgate de vantagens pelo aluno (cupom + QR Code) | ✅ |
| US05 — Professor distribui moedas (mensagem obrigatória, transação atômica) | ✅ |
| US06 — Professor consulta extrato e saldo | ✅ |
| US07 — CRUD de Vantagens pela empresa | ✅ |
| US08 — Crédito automático de 1.000 moedas/semestre (job agendado fev/ago) | ✅ |
| US09 — Notificação por e-mail de envio de moedas e cupons | ✅ |
| US10 — Notificação no WhatsApp do cupom de resgate (**API não oficial / Evolution API**) | ✅ (opt-in) |
| CRUD admin de Empresa Parceira | ✅ |
| CRUD admin de Professor | ✅ |
| Ajuste de saldo pelo admin (alunos e professores, +/-) | ✅ |
| Infra de mensageria (RabbitMQ + exchange tópica + filas + DLQ) | ✅ |
| Toasts globais no canto superior direito (Angular Material) | ✅ |
| **Lab05S01** — Deploy em nuvem (Render + Vercel) + Diagramas de Comunicação e Implantação | ⏸ pendente |
| **Lab05S02** — Análise crítica de outro grupo + 3 PRs de refatoração | ⏸ pendente |

---

## Tecnologias

**Backend**
- Java 21
- Micronaut 4.10
- Hibernate / Micronaut Data JPA (ORM) + Flyway (migrations)
- Padrão DAO com `EntityManager`
- Micronaut Security JWT (Bearer, 4h) + BCrypt (custo 12)
- PostgreSQL 16 (local via Docker ou Neon serverless)
- RabbitMQ 3 (mensageria de notificações) via `micronaut-rabbitmq`
- Jakarta Mail (SMTP) e Google ZXing 3.5.3 (geração de QR Code)
- WhatsApp via **Evolution API** (gateway não oficial, self-hosted)
- `dotenv-java` para carregar `.env` em desenvolvimento
- Maven 3.9+ (incluso via `mvnw`)

**Frontend**
- Angular 18 (standalone components, signals, lazy routes)
- Angular Material (snackbar) no **canto superior direito**
- TypeScript 5
- Design system próprio (tokens CSS)
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
                       Consumer → SmtpEmailService / WhatsAppService (Evolution API)
```

Detalhes:
- **Login**: e-mail/senha (todos os papéis) OU seletor de professor (`GET /api/auth/professores` → `POST /api/auth/login-professor`).
- **Notificações**: o produtor publica numa exchange tópica `notifications.exchange`; consumidores assinam as filas `email.queue` e `whatsapp.queue`. Falhas vão para `notifications.dlq` (Dead Letter Queue).

---

## Guia de instalação para iniciantes (Windows · macOS · Linux)

Esta seção é para quem **nunca rodou o projeto**. Siga na ordem. Tudo que você precisa instalar está no passo 1.

> **Resumo do que você vai instalar:** Git, Java (JDK 21), Node.js 20+ e Docker Desktop. Depois é só copiar um arquivo de configuração e rodar dois comandos.

### 1. Instalar os programas necessários

Você precisa de **4 programas**. Escolha o seu sistema operacional abaixo.

#### 🪟 Windows

A forma mais fácil é usar o **winget** (já vem no Windows 10/11). Abra o **PowerShell** (tecla Windows → digite "PowerShell" → Enter) e rode:

```powershell
winget install --id Git.Git -e
winget install --id EclipseAdoptium.Temurin.21.JDK -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Docker.DockerDesktop -e
```

Depois **feche e reabra o PowerShell** (para o sistema reconhecer os novos programas) e **abra o Docker Desktop** uma vez (ele precisa estar rodando — ícone da baleia na barra de tarefas).

> Sem winget? Baixe manualmente: [Git](https://git-scm.com/download/win) · [JDK 21 (Temurin)](https://adoptium.net/temurin/releases/?version=21) · [Node.js LTS](https://nodejs.org/) · [Docker Desktop](https://www.docker.com/products/docker-desktop/).

#### 🍎 macOS

A forma mais fácil é usar o **Homebrew**. Se não tiver, instale-o em https://brew.sh e depois rode no **Terminal**:

```bash
brew install git
brew install --cask temurin@21
brew install node@20
brew install --cask docker
```

Depois **abra o Docker Desktop** uma vez (ícone da baleia na barra de menus precisa estar ativo).

> Em Macs com Apple Silicon (M1/M2/M3) todos os comandos acima funcionam normalmente.

#### 🐧 Linux (Ubuntu/Debian)

```bash
# Git
sudo apt update && sudo apt install -y git

# JDK 21 (Temurin) — via apt do Adoptium
sudo apt install -y wget apt-transport-https gpg
wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo gpg --dearmor -o /etc/apt/keyrings/adoptium.gpg
echo "deb [signed-by=/etc/apt/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/adoptium.list
sudo apt update && sudo apt install -y temurin-21-jdk

# Node.js 20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # faça logout/login depois deste comando
```

> Em outras distros (Fedora, Arch, etc.), use o gerenciador de pacotes equivalente ou os instaladores oficiais linkados na seção Windows.

#### ✅ Conferir se instalou tudo

Abra um terminal novo e rode (vale para os 3 sistemas):

```bash
git --version       # ex: git version 2.45.0
java -version       # ex: openjdk version "21.x.x"
node --version      # ex: v20.x.x
docker --version    # ex: Docker version 27.x.x
```

Se os 4 responderem com uma versão, está tudo certo. **O Docker Desktop precisa estar aberto/rodando** antes de continuar.

### 2. Baixar o projeto

```bash
git clone https://github.com/henriquegdc/Sistema_De_Moeda_Estudantil.git
cd Sistema_De_Moeda_Estudantil
```

> Se você já recebeu a pasta do projeto (zip), basta abrir um terminal dentro dela.

### 3. Configurar o arquivo `.env`

O backend lê suas configurações de um arquivo `.env` em `Aplicacao/Backend/.env`. Ele **não** vem pronto (por segurança); você o cria a partir do modelo `.env.example`.

**Windows (PowerShell):**
```powershell
cd Aplicacao\Backend
Copy-Item .env.example .env
```

**macOS / Linux (bash):**
```bash
cd Aplicacao/Backend
cp .env.example .env
```

Para apenas **rodar o sistema localmente**, os valores padrão do `.env` já funcionam (Postgres e RabbitMQ locais; e-mail e WhatsApp ficam em modo "simulado"). Você só precisa editar se quiser ligar e-mail real ou WhatsApp (veja as seções específicas).

> **E-mail real (opcional):** no `.env`, troque `MAIL_ENABLED=true`, use `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587` e gere uma **App Password** do Gmail em https://myaccount.google.com/apppasswords (precisa de 2FA ativo). Coloque-a em `MAIL_PASSWORD` e use seu e-mail em `MAIL_USERNAME` e `MAIL_FROM`. Com `MAIL_ENABLED=false`, o envio é só simulado nos logs — o fluxo de fila continua funcionando.

### 4. Subir a infraestrutura (Docker)

Dentro de `Aplicacao/Backend`, com o Docker rodando:

```bash
docker compose up -d
```

Isso sobe o **PostgreSQL** (porta 5432) e o **RabbitMQ** (portas 5672 e 15672). Confira:

```bash
docker ps
```

Painel do RabbitMQ: http://localhost:15672 (login `guest` / senha `guest`).

> Usando **Neon** (Postgres na nuvem) em vez do local? Suba só o RabbitMQ: `docker compose up -d rabbitmq` e ajuste `DB_URL`, `DB_USER`, `DB_PASSWORD` e `DB_SKIP_BOOTSTRAP=true` no `.env`.

### 5. Rodar o backend

Ainda em `Aplicacao/Backend`:

**Windows (PowerShell):**
```powershell
.\mvnw.bat mn:run
```

**macOS / Linux (bash):**
```bash
./mvnw mn:run
```

Na primeira vez o Maven baixa as dependências (pode levar alguns minutos). Quando aparecer `Startup completed`, o backend está no ar em **http://localhost:8080**.

- O Flyway cria as tabelas automaticamente.
- O `DataSeeder` cria os perfis de teste (ver [Credenciais](#credenciais-e-perfis-de-teste)).
- Documentação interativa (Swagger): http://localhost:8080/swagger-ui

> Deixe este terminal aberto — ele é o backend rodando.

### 6. Rodar o frontend

Abra **outro terminal** na raiz do projeto:

**Windows / macOS / Linux:**
```bash
cd Aplicacao/Frontend
npm install      # só na primeira vez (baixa as dependências)
npm start
```

O frontend sobe em **http://localhost:4200**.

### 7. Abrir o sistema

Acesse **http://localhost:4200** no navegador. Faça login com `admin@studentcoins.com` / `admin123` e explore. Para um roteiro guiado de ponta a ponta, veja [Roadmap de testes por perfil](#roadmap-de-testes-por-perfil).

---

## Integração com WhatsApp (API não oficial)

A notificação de cupom por WhatsApp é **opcional** e usa a **[Evolution API](https://github.com/EvolutionAPI/evolution-api)** — um gateway **não oficial**, self-hosted, que conversa com o WhatsApp Web pareando um número real por **QR Code**. Diferente da API oficial da Meta, **não exige** conta Meta Business, número verificado nem aprovação de templates.

> ⚠️ **Aviso:** APIs não oficiais usam automação sobre o WhatsApp Web e violam os Termos de Uso do WhatsApp; há risco de bloqueio do número. Use **apenas** um número de teste/descartável e **nunca** seu número pessoal. Este recurso é didático.

### Como funciona no projeto

```
ResgateService → RabbitMQ (whatsapp.queue) → WhatsAppNotificationConsumer → WhatsAppService → Evolution API → WhatsApp do aluno
```

Quando um aluno resgata uma vantagem e tem **telefone cadastrado**, o sistema publica uma mensagem na fila `whatsapp.queue`. O `WhatsAppService` faz um `POST` HTTP para a Evolution API enviando o **QR Code do cupom como imagem** com uma legenda contendo o código e a validade. Com `WHATSAPP_ENABLED=false` (padrão), o envio é apenas simulado nos logs.

### Passo a passo para habilitar

**1. Suba a Evolution API** (e o Postgres/Redis dela) usando o profile `whatsapp` do docker-compose, em `Aplicacao/Backend`:

```bash
docker compose --profile whatsapp up -d
```

Isso sobe a Evolution API em **http://localhost:8081**. (Os serviços padrão Postgres/RabbitMQ continuam separados; este profile só adiciona os containers do WhatsApp.)

**2. Defina a chave de API.** No `.env`, mantenha `WHATSAPP_API_KEY` e `EVOLUTION_API_KEY` com **o mesmo valor** (troque o padrão por uma chave sua). Recrie o container da Evolution se mudar a chave:

```bash
docker compose --profile whatsapp up -d --force-recreate evolution-api
```

**3. Crie uma instância e pareie seu número.** A Evolution expõe um painel/manager. Crie a instância chamada `moedaestudantil` (mesmo valor de `WHATSAPP_INSTANCE`) e gere o QR Code:

```bash
# Criar a instância (use a sua chave no header apikey)
curl -X POST http://localhost:8081/instance/create \
  -H "apikey: SUA_CHAVE_EVOLUTION" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"moedaestudantil","integration":"WHATSAPP-BAILEYS","qrcode":true}'
```

A resposta traz um QR Code (campo `qrcode`/`base64`). Você também pode abrir o **Manager** em http://localhost:8081/manager (informe a API key) e clicar para exibir o QR Code da instância. **Abra o WhatsApp no celular → Aparelhos conectados → Conectar um aparelho → escaneie o QR.**

**4. Ligue o WhatsApp no backend.** No `.env`:

```dotenv
WHATSAPP_ENABLED=true
WHATSAPP_BASE_URL=http://localhost:8081
WHATSAPP_INSTANCE=moedaestudantil
WHATSAPP_API_KEY=SUA_CHAVE_EVOLUTION
WHATSAPP_COUNTRY_CODE=55
WHATSAPP_SEND_QR=true
```

Reinicie o backend (`mvnw mn:run`).

**5. Teste.** Cadastre um aluno com um **telefone real** (com DDD, ex: `(31) 99999-9999`) e faça um resgate de vantagem. O cupom (QR Code + código) chega no WhatsApp do número cadastrado. Acompanhe os logs do backend:

```
WhatsAppNotificationConsumer - Consumindo mensagem WhatsApp: tipo=cupom-aluno-wa para=...
WhatsAppService              - WhatsApp (media) enviado para 5531999999999 via Evolution API (HTTP 201)
```

### Variáveis de ambiente do WhatsApp

| Variável | Default | Descrição |
|---|---|---|
| `WHATSAPP_ENABLED` | `false` | Liga/desliga o envio real. `false` = simula nos logs. |
| `WHATSAPP_BASE_URL` | `http://localhost:8081` | URL da Evolution API. |
| `WHATSAPP_INSTANCE` | `moedaestudantil` | Nome da instância pareada na Evolution. |
| `WHATSAPP_API_KEY` | _(vazio)_ | Chave de API da Evolution (header `apikey`). |
| `WHATSAPP_COUNTRY_CODE` | `55` | Código do país, prefixado a números sem DDI. |
| `WHATSAPP_SEND_QR` | `true` | Envia o QR do cupom como imagem (`true`) ou só texto (`false`). |
| `EVOLUTION_API_KEY` | _(docker-compose)_ | Chave que a **própria** Evolution exige. Mantenha igual à `WHATSAPP_API_KEY`. |

---

## Credenciais e perfis de teste

O `DataSeeder` cria, no primeiro startup, os seguintes registros:

| Papel | E-mail | Senha | Observações |
|---|---|---|---|
| **Administrador** | `admin@studentcoins.com` | `admin123` | Acesso ao painel admin (alunos, professores, empresas, ajuste de saldo). |
| **Professor** | `joao.aramuni@puc.br` | `senha123` | CPF `11122233344`, vinculado à PUC Minas (Eng. de Software), saldo inicial **1.000 moedas**. Pode logar pelo seletor. |
| **Aluno** | _(criar via /alunos/novo)_ | _(definida no cadastro)_ | Saldo inicial **0** — recebe moedas via distribuição ou ajuste admin. |
| **Empresa Parceira** | _(criar via /empresas/novo)_ | _(definida no cadastro)_ | Cadastro aberto. |

**Instituições pré-cadastradas pelo seed:** PUC Minas, UFMG, CEFET-MG.

> Para usar e-mails/WhatsApp reais, recadastre o professor seed via tela admin (Professores → Editar) ou edite `DataSeeder.java`.

---

## Roadmap de testes por perfil

Este roteiro percorre **todos os fluxos do sistema do zero**, simulando cada perfil. Executado em ordem, demonstra ponta a ponta: cadastro → distribuição → resgate → notificação → ajuste administrativo.

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
2. Menu **Professores** → "Novo professor" → preencha nome e **e-mail real** (ex: `seu.email+prof@gmail.com`) → senha `prof123` → salvar.
3. Menu **Alunos** e **Empresas** → criados pelo fluxo público (Etapas 2 e 3) ou aqui.
4. Após existirem alunos/professores: clique no ícone **moeda** de uma linha → modal → digite `+500` ou `-100` → confirmar → toast no canto superior direito.

**Pela API** — pegando o token primeiro:

```powershell
$resp = curl -s -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@studentcoins.com\",\"senha\":\"admin123\"}'
$token = ($resp | ConvertFrom-Json).token
$token   # confira que aparece um JWT
```

```powershell
# Cadastrar professor com SEU e-mail real
curl -X POST http://localhost:8080/api/professores `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{\"nome\":\"Professor Teste\",\"email\":\"seu.email+prof@gmail.com\",\"senha\":\"prof123\",\"cpf\":\"99988877766\",\"departamento\":\"Computação\",\"instituicaoId\":1}'

# Ajustar saldo do aluno id=2: +500 moedas
curl -X POST http://localhost:8080/api/alunos/2/saldo `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{\"quantidade\":500}'
```

✅ **O que validar:** UI atualiza o badge "M$" na hora; toast verde. API retorna 200. Tirar mais que o saldo → 409 `SaldoInsuficienteException`.

### Etapa 2 — Empresa Parceira cadastra-se e cria vantagens

**Pela UI:**
1. Em `/login`, "Criar agora" → "Sou Empresa Parceira". Preencha CNPJ, nome fantasia, e-mail (ex: `seu.email+empresa@gmail.com`), senha `empresa123`.
2. Login → Menu **Vantagens** → "Nova vantagem" → nome, descrição, preço (ex: 200 moedas), foto opcional → salvar. Crie 2-3.

**Pela API:**
```powershell
curl -X POST http://localhost:8080/api/empresas `
  -H "Content-Type: application/json" `
  -d '{\"nomeFantasia\":\"Loja Teste\",\"cnpj\":\"12345678000999\",\"email\":\"seu.email+empresa@gmail.com\",\"senha\":\"empresa123\",\"telefone\":\"+5531999999999\"}'

$resp = curl -s -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"seu.email+empresa@gmail.com\",\"senha\":\"empresa123\"}'
$tokenEmpresa = ($resp | ConvertFrom-Json).token

curl -X POST http://localhost:8080/api/vantagens `
  -H "Authorization: Bearer $tokenEmpresa" `
  -H "Content-Type: application/json" `
  -d '{\"nome\":\"Cinema CineSystem\",\"descricao\":\"1 ingresso comum\",\"precoMoedas\":200,\"empresaId\":1}'
```

### Etapa 3 — Aluno cadastra-se

**Pela UI:**
1. Em `/login`, "Criar agora" → "Sou Aluno".
2. Preencha tudo (use **CEP real** — preenche o endereço automaticamente) e um **telefone real** (para testar WhatsApp). E-mail: `seu.email+aluno@gmail.com`. Senha `aluno123`.
3. Login → painel `/alunos/painel`. Saldo inicial: 0.

### Etapa 4 — Professor distribui moedas (gatilho de notificação)

**Pela UI — login pelo seletor:**
1. Em `/login`, "**Sou professor — entrar pelo seletor**". Selecione "Professor Teste", senha `prof123`.
2. Menu **Distribuir** → selecione o aluno, quantidade `87`, mensagem obrigatória → enviar.

**Pela API:**
```powershell
$resp = curl -s -X POST http://localhost:8080/api/auth/login-professor `
  -H "Content-Type: application/json" `
  -d '{\"professorId\":2,\"senha\":\"prof123\"}'
$tokenProf = ($resp | ConvertFrom-Json).token

curl -X POST http://localhost:8080/api/professores/2/distribuir `
  -H "Authorization: Bearer $tokenProf" `
  -H "Content-Type: application/json" `
  -d '{\"alunoId\":2,\"quantidade\":87,\"mensagem\":\"Excelente participação em aula.\"}'
```

✅ **O que validar:** saldos atualizados atomicamente (prof -87, aluno +87); logs mostram `E-mail enviado para...`; caixas de entrada recebem; extratos mostram a transação.

### Etapa 5 — Aluno resgata vantagem (cupom + QR Code + e-mail + WhatsApp)

**Pela UI:** Login aluno → Menu **Vantagens** → "Resgatar" → confirmar → Menu **Meus cupons** mostra o cupom com QR Code.

**Pela API:**
```powershell
$resp = curl -s -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"seu.email+aluno@gmail.com\",\"senha\":\"aluno123\"}'
$tokenAluno = ($resp | ConvertFrom-Json).token

curl -X POST http://localhost:8080/api/resgates `
  -H "Authorization: Bearer $tokenAluno" `
  -H "Content-Type: application/json" `
  -d '{\"vantagemId\":1}'
```

✅ **O que validar:** saldo cai; e-mail do aluno chega com QR **inline**; e-mail da empresa chega; **se WhatsApp habilitado e o aluno tem telefone**, o cupom chega no WhatsApp.

### Etapa 6 — Empresa valida o cupom

**Pela UI:** Login empresa → Menu **Trocas** (relatório) → lista cupons com status.
**Pela API:** `curl -H "Authorization: Bearer $tokenEmpresa" http://localhost:8080/api/empresas/1/cupons`

### Etapa 7 — Admin ajusta saldo

Login admin → Menu **Alunos** → ícone moeda → +1000 → confirmar. Valida a regra que **impede saldo negativo** (tente tirar mais que o saldo → toast vermelho "Saldo insuficiente").

---

## Como validar mensageria e e-mail

### Conferir filas (sem o painel)

```powershell
docker exec moedaestudantil-rabbitmq rabbitmqctl list_queues name messages messages_ready consumers
docker exec moedaestudantil-rabbitmq rabbitmqctl list_exchanges
docker exec moedaestudantil-rabbitmq rabbitmqctl list_bindings
```

### Publicar uma mensagem direto pelo CLI (prova da topologia)

```powershell
docker exec moedaestudantil-rabbitmq rabbitmqadmin publish `
  exchange=notifications.exchange `
  routing_key=notification.email.aluno-moeda `
  payload='{\"tipo\":\"teste\",\"para\":\"seu.email@gmail.com\",\"assunto\":\"Teste CLI\",\"template\":\"moeda-recebida-aluno\",\"variaveis\":{\"nomeAluno\":\"Teste\",\"nomeProfessor\":\"CLI\",\"quantidade\":\"1\",\"mensagem\":\"oi\",\"saldoAtual\":\"10\",\"dataHora\":\"26/05/2026 15:30\"}}' `
  properties='{\"content_type\":\"application/json\"}'
```

### Forçar falha pra demonstrar a DLQ

1. Edite `.env`, troque `MAIL_PASSWORD` por algo inválido. Reinicie o backend.
2. Distribua moedas → SMTP falha → mensagem é rejeitada → cai na `notifications.dlq`.
3. `docker exec moedaestudantil-rabbitmq rabbitmqctl list_queues name messages` → `notifications.dlq` com `messages > 0`. Resiliência ✅.

---

## Documentação adicional

- **[Descrição do problema (PDFs)](.)** — Especificações das Releases 1, 2 e 3 na raiz do repositório.
- **[Histórias de Usuário (PDF)](docs/Histórias-de-Usuário.pdf)** — US01 a US10.
- Diagramas UML em `docs/diagramas/` e fontes PlantUML em `docs/códigos/` (Caso de Uso, Classes, Componentes, ER, Sequência).
- Coleção Insomnia em `docs/insomnia-collection.json` (chamadas prontas).

---

## Cronograma das sprints

| Sprint | Entrega | Status |
|---|---|---|
| **Lab03S01** | Diagrama de Casos de Uso, Histórias de Usuário, Diagrama de Classes, Diagrama de Componentes | ✅ |
| **Lab03S02** | Modelo ER, estratégia ORM + DAO, CRUDs iniciais de Aluno e Empresa Parceira | ✅ |
| **Lab03S03** | CRUDs versão final + camada de persistência + arquitetura + feature de Professor | ✅ |
| **Lab04S01** | Infra base (RabbitMQ + Mail + ZXing), notificação de envio de moedas, job semestral | ✅ |
| **Lab04S02** | CRUD de Vantagem + listagem para aluno + diagramas de sequência | ✅ |
| **Lab04S03** | Resgate + geração de QR Code + WhatsApp + diagrama geral | ✅ |
| **Lab05S01** | Deploy cloud (Render + Vercel) + diagramas de Comunicação e Implantação | ⏸ pendente |
| **Lab05S02** | Análise crítica de outro grupo + 3 PRs de refatoração | ⏸ pendente |

---

## Integrantes

- [Henrique Carvalho](https://github.com/henriquegdc)
- [João Pedro Moura Santos](https://github.com/JoaoMouraS)
- [Miguel Gomes](https://github.com/Miguelgdn1)

## Professor

[João Paulo Aramuni](https://github.com/joaopauloaramuni)
