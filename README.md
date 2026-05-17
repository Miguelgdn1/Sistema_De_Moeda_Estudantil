# 🪙 Sistema de Moeda Estudantil 👨‍🎓

Sistema para estimular o reconhecimento do mérito estudantil através de uma moeda virtual. Professores distribuem moedas aos alunos como reconhecimento; alunos trocam moedas por vantagens (descontos, materiais) oferecidas por empresas parceiras.

> Projeto desenvolvido na disciplina **Laboratório de Desenvolvimento de Software** (Engenharia de Software — PUC Minas), sob orientação do Prof. **João Paulo Carneiro Aramuni**. Avaliação Lab03 — Release 1.

## 📝 Sobre o Projeto

A plataforma centraliza a economia interna de mérito de uma instituição de ensino:

- **Professores** recebem 1.000 moedas a cada semestre (saldo acumulável) e enviam montantes a alunos junto com uma mensagem obrigatória de reconhecimento.
- **Alunos** recebem moedas, consultam extrato e resgatam vantagens cadastradas por empresas parceiras.
- **Empresas parceiras** se cadastram, oferecem vantagens (com descrição, custo em moedas e foto do produto) e recebem os cupons de resgate por email para conferência presencial.
- Toda transação (envio ou resgate) gera notificação por email com código de cupom gerado pelo sistema.

## ✨ Funcionalidades Principais

- 🔐 **Autenticação** — login com email e senha (BCrypt + JWT) para alunos, professores e empresas parceiras.
- 👤 **Gestão de Alunos** — cadastro com nome, email, CPF, RG, endereço, instituição e curso.
- 🏢 **Gestão de Empresas Parceiras** — cadastro com CNPJ, nome fantasia, descrição e credenciais.
- 🎓 **Instituições e Professores** — pré-cadastrados via seed (envio da instituição no momento da parceria).
- 🎁 **Vantagens** *(Release 2)* — cadastro com nome, descrição, custo em moedas e foto.
- 💸 **Distribuição de moedas** *(Release 2)* — professores enviam moedas a alunos com mensagem obrigatória.
- 🛒 **Resgate de vantagens** *(Release 2)* — aluno resgata, recebe cupom por email; empresa também é notificada.
- 📊 **Extrato** *(Release 2)* — saldo atual e histórico de transações.

## 🛠️ Tecnologias Utilizadas

**Backend**
- Java 21
- Micronaut 4.10
- Hibernate / Micronaut Data JPA (ORM)
- Padrão DAO (`EntityManager`)
- Micronaut Security JWT + BCrypt
- PostgreSQL 14+
- Maven

**Frontend**
- Angular 17+ (standalone components)
- Angular Material
- TypeScript
- Node.js 20+ / npm

## 📦 Dependências

- Backend: gerenciadas pelo **Maven** em `Aplicacao/Backend/pom.xml`
- Frontend: gerenciadas pelo **npm** em `Aplicacao/Frontend/package.json`

## 🏗️ Arquitetura

Arquitetura **MVC** com camadas bem separadas:

```
Controller (HTTP)  →  DTO  →  Service (regra)  →  DAO (persistência)  →  Entity (JPA)  →  PostgreSQL
```

## 📂 Estrutura de Pastas

```
Sistema_De_Moeda_Estudantil/
├── CLAUDE.md                         # Contexto do projeto para sessões Claude Code
├── README.md                         # Este arquivo
├── docs/                             # Documentação, diagramas UML e descrição do problema
│   ├── Descrição Problema Lab 03 Release1.pdf
│   ├── Diagrama-de-Caso-de-uso.png
│   ├── Diagrama-de-Classes.png
│   ├── Diagrama-de-ComponentesV2.png
│   ├── Histórias-de-Usuário.pdf
│   └── Modelo_ER.png                 # (a gerar no S02)
├── TemplatesDiagrams/                # Templates PlantUML para os diagramas
└── Aplicacao/
    ├── Backend/                      # Micronaut (Java)
    │   ├── pom.xml
    │   └── src/main/java/com/puc/moedaestudantil/
    │       ├── Application.java
    │       ├── config/               # CORS, seeds
    │       ├── controller/           # Endpoints REST
    │       ├── dto/                  # Request/Response DTOs
    │       ├── exception/            # Tratamento global de erros
    │       ├── model/                # Entidades JPA
    │       ├── repository/           # DAOs
    │       ├── security/             # BCrypt, JwtService
    │       └── service/              # Regras de negócio
    └── Frontend/                     # Angular
        └── src/app/
            ├── core/                 # services, guards, interceptors
            ├── shared/               # componentes reutilizáveis
            └── features/
                ├── auth/             # tela de login
                ├── alunos/           # CRUD aluno
                └── empresas/         # CRUD empresa parceira
```

## 🚀 Instalação e Execução

### Pré-requisitos

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+** e **npm**
- **PostgreSQL 14+** rodando em `localhost:5432` com usuário `postgres`/`postgres`

> O backend cria automaticamente o database `moedaestudantil` no primeiro start, se ainda não existir.

### Passos

1. Suba o backend a partir da raiz do repositório:

   ```powershell
   cd Aplicacao\Backend
   .\mvnw mn:run
   ```

2. Em outro terminal, suba o frontend:

   ```powershell
   cd Aplicacao\Frontend
   npm install gsap snapsvg snapsvg-cjs
   npm install @types/snapsvg -D
   npm install
   npm start
   ```

3. Acesse:

   - Frontend: <http://localhost:4200>
   - Backend (API): <http://localhost:8080/api>

## 📅 Cronograma das Sprints

| Sprint | Entrega | Status |
|---|---|---|
| **Lab03S01** | Diagrama de Casos de Uso, Histórias de Usuário, Diagrama de Classes, Diagrama de Componentes | ✅ |
| **Lab03S02** | Modelo ER, estratégia de acesso a banco (ORM + DAO), CRUDs iniciais de Aluno e Empresa Parceira | 🔄 em andamento |
| **Lab03S03** | CRUDs versão final, apresentação da arquitetura e camada de persistência, tutorial de tecnologias | ⏳ |

## 👥 Integrantes

[![GitHub](https://img.shields.io/badge/GitHub-Henrique_Carvalho-181717?logo=github)](https://github.com/henriquegdc)

[![GitHub](https://img.shields.io/badge/GitHub-João_Pedro_Moura_Santos-181717?logo=github)](https://github.com/JoaoMouraS)

[![GitHub](https://img.shields.io/badge/GitHub-Miguel_Gomes-181717?logo=github)](https://github.com/Miguelgdn1)

## 👨‍🏫 Professor Responsável

[![GitHub](https://img.shields.io/badge/GitHub-João_Paulo_Aramuni-181717?logo=github)](https://github.com/joaopauloaramuni)
