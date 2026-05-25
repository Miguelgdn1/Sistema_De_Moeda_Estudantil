# Arquitetura — Sistema de Moeda Estudantil

Este documento descreve a arquitetura **vigente** do projeto após a refatoração de Maio/2026, que alinhou o código ao guia em [`padrão arquitetural.md`](../padrão arquitetural.md).

Stack e princípios continuam os do guia (camadas isoladas, DTOs imutáveis, erros tipados, JWT stateless, frontend por feature). Este arquivo destaca as decisões concretas e os pontos onde o projeto se afasta intencionalmente do padrão.

---

## 1. Estrutura

```
Aplicacao/
├── Backend/
│   ├── pom.xml                                    # Java 21 + Micronaut 4.10 + Flyway + OpenAPI
│   ├── openapi.properties                         # habilita geração do Swagger UI estático
│   └── src/main/
│       ├── java/com/puc/moedaestudantil/
│       │   ├── Application.java                   # bootstrap + cria DB se ausente
│       │   ├── config/
│       │   │   ├── DataSeeder.java                # @EventListener StartupEvent: institui­ções + admin + 1 professor
│       │   │   └── OpenApiConfig.java             # @OpenAPIDefinition + @SecurityScheme BearerAuth
│       │   ├── controller/                        # 1 controller por agregado, só HTTP+delegação
│       │   ├── service/                           # @Singleton, construtor, @Transactional em escritas
│       │   ├── repository/                        # interfaces @Repository : CrudRepository (Micronaut Data)
│       │   ├── model/                             # @Entity JPA + soft-delete (deleted_at)
│       │   ├── dto/
│       │   │   ├── request/                       # records imutáveis com Bean Validation
│       │   │   └── response/                      # records imutáveis (inclui ErroResponse)
│       │   ├── exception/                         # BusinessException base + 9 exceções de domínio
│       │   │   └── handler/                       # um @Singleton handler por exceção
│       │   └── security/                          # JwtService, PasswordEncoder (BCrypt), AuthenticatedUser
│       └── resources/
│           ├── application.yml                    # config externalizada via ${VAR}
│           ├── logback.xml
│           └── db/migration/
│               └── V1__inicial.sql                # schema base com deleted_at e índices
└── Frontend/
    ├── angular.json                               # fileReplacements para environment.development.ts
    └── src/
        ├── app/
        │   ├── app.component.{ts,html,scss}       # shell raiz (apenas <router-outlet>)
        │   ├── app.config.ts                      # providers (router, http, animations, 2 interceptors)
        │   └── app.routes.ts                      # 1 array de rotas com lazy loading
        ├── environments/
        │   ├── environment.ts                     # produção
        │   └── environment.development.ts         # dev (apiUrl: localhost:8080)
        ├── guards/                                # 3 CanActivateFn funcionais
        ├── interceptors/                          # authInterceptor + errorInterceptor (separados)
        ├── models/                                # 1 arquivo por recurso, sufixos Item/Payload
        ├── services/                              # @Injectable({providedIn:'root'}) + inject() + map(toItem)
        ├── pages/                                 # 1 pasta por feature, <feature>-page.{ts,html,css}
        │   ├── intro/
        │   ├── home/
        │   ├── auth/login-page.{ts,html,css}
        │   ├── alunos/{aluno-dashboard,aluno-form,aluno-list,profile-edit}-page.{ts,html,css}
        │   │   └── extrato/aluno-extrato-page.{ts,html,css}
        │   ├── empresas/{empresa-form,empresa-list,empresa-relatorio,empresa-vantagens}-page.{ts,html,css}
        │   └── professor/{professor-dashboard,distribuir-moedas,professor-extrato}-page.{ts,html,css}
        ├── shared/components/                     # 8 componentes reutilizáveis (button, card, app-shell, ...)
        ├── styles/_tokens.scss · _reset.scss · _utilities.scss
        ├── styles.scss
        ├── index.html
        └── main.ts
```

**Backend organizado por camada técnica; frontend por feature** — assimetria intencional do padrão.

---

## 2. Backend

### 2.1 Fluxo de uma requisição

```
HTTP → Controller → Service → Repository → @Entity
                              ↑
                          mapeia Entity → ResponseDTO
                              ↓
HTTP ← Controller ← Service (devolve já um Response record)
```

- **Controller**: valida DTO (`@Body @Valid`), checa autorização (`@Secured` + `AuthenticatedUser.requireOwnerOrAdmin`) e delega.
- **Service**: regra de negócio, transação (`@Transactional`), conversão Entity → Response via método privado `toResponse(entity)`, lança exceções tipadas.
- **Repository**: interface `extends CrudRepository<Entity, Long>` com métodos derivados (`findByIdAndDeletedAtIsNull`, `existsByCpf`) e `@Query` JPQL para joins.
- **Entity**: `@Entity` + `@Table` + colunas em `snake_case` + `deleted_at LocalDateTime` (exceto `Transacao`, que é log imutável).

### 2.2 DTOs (records imutáveis)

Separados por direção em `dto/request/` e `dto/response/`:

| Recurso | Request                             | Response                       |
|---------|-------------------------------------|--------------------------------|
| Aluno   | `AlunoRequest`, `AlunoUpdateRequest`| `AlunoResponse`                |
| Empresa | `EmpresaParceiraRequest`, `*UpdateRequest` | `EmpresaParceiraResponse` |
| Professor | `DistribuirMoedasRequest`         | `ProfessorResponse`            |
| Auth    | `LoginRequest`                      | `LoginResponse`                |
| Transação | —                                 | `TransacaoResponse`, `ExtratoResponse` |
| Erro    | —                                   | `ErroResponse` (timestamp, status, error, message, path, camposInvalidos?) |

Todos com `@Serdeable` (a aplicação usa `micronaut-serde-jackson`, não Jackson reflexivo — o padrão menciona `@Introspected`, este é o equivalente do Serde).

### 2.3 Exceções tipadas + handlers individuais

Um arquivo por exceção, agrupados em handlers por status:

| Exceção                              | Status | Handler                          |
|--------------------------------------|--------|----------------------------------|
| `AlunoNaoEncontradoException`        | 404    | `NotFoundExceptionHandler`       |
| `ProfessorNaoEncontradoException`    | 404    | `NotFoundExceptionHandler`       |
| `EmpresaNaoEncontradaException`      | 404    | `NotFoundExceptionHandler`       |
| `InstituicaoNaoEncontradaException`  | 404    | `NotFoundExceptionHandler`       |
| `CpfDuplicadoException`              | 409    | `ConflictExceptionHandler`       |
| `CnpjDuplicadoException`             | 409    | `ConflictExceptionHandler`       |
| `EmailDuplicadoException`            | 409    | `ConflictExceptionHandler`       |
| `SaldoInsuficienteException`         | 409    | `ConflictExceptionHandler`       |
| `CredenciaisInvalidasException`      | 401    | `CredenciaisInvalidasExceptionHandler` |
| `AcessoNegadoException`              | 403    | `AcessoNegadoExceptionHandler`   |
| `ConstraintViolationException`       | 400    | `ConstraintViolationExceptionHandler` (devolve `camposInvalidos`) |
| `Throwable` (fallback)               | 500    | `GlobalExceptionHandler`         |

Todas estendem `BusinessException extends RuntimeException` (com exceção do `AcessoNegadoException`, que tem o mesmo papel).

### 2.4 Segurança

- **JWT bearer** — `micronaut.security.authentication: bearer`. Token assinado por `${JWT_SECRET}`.
- **Login customizado** em `POST /api/auth/login` (não usa o `/login` padrão do Micronaut). `AuthService` valida credenciais, identifica subtipo de `Usuario` (`instanceof Aluno|Professor|EmpresaParceira|Administrador`) e o `JwtService` emite token com claim `roles: ["ROLE_<TIPO>"]`.
- **BCrypt** via `at.favre.lib:bcrypt`, cost 12.
- **Autorização**: `@Secured("ROLE_X")` por endpoint. Para "dono ou admin": `AuthenticatedUser.requireOwnerOrAdmin(authentication, recursoId)`.
- **Senhas**: hash armazenado em `usuario.senha_hash`; nunca expostas em `Response DTOs`.

### 2.5 Persistência e migrations

- **Flyway** ativo (`flyway.datasources.default.enabled=true`). Migrations em `db/migration/V<n>__<descricao>.sql`. **Imutáveis** — para corrigir, criar nova versão.
- **Hibernate `hbm2ddl.auto=validate`** (não `update`): se as entidades divergirem do schema versionado, a aplicação **falha no startup**. Esse é o contrato com o Flyway.
- **Soft-delete**: `deleted_at LocalDateTime` em `Usuario`, `Instituicao`, `Vantagem` (não em `Transacao`). Repositórios filtram com `findByIdAndDeletedAtIsNull` / `findAllByDeletedAtIsNull`; `delete()` em Service grava `setDeletedAt(now())` em vez de remover.

### 2.6 Configuração externalizada

`application.yml` consome variáveis de ambiente. Defaults para dev:

| Variável             | Default                                                     |
|----------------------|-------------------------------------------------------------|
| `DB_NAME`            | `moedaestudantil`                                           |
| `DB_HOST`            | `localhost`                                                 |
| `DB_PORT`            | `5432`                                                      |
| `DB_URL`             | `jdbc:postgresql://localhost:5432/moedaestudantil`          |
| `DB_USER`            | `postgres`                                                  |
| `DB_PASSWORD`        | `postgres`                                                  |
| `JWT_SECRET`         | placeholder (substituir em produção, ≥256 bits)             |
| `CORS_ALLOWED_ORIGIN`| `http://localhost:4200`                                     |

`Application.java` faz **auto-create** do database (com `DB_NAME` validado por regex) antes do Micronaut subir.

### 2.7 Documentação OpenAPI

- Spec gerado em build via `micronaut-openapi` (annotation processor). Disponível em `GET /swagger/sistema-de-moeda-estudantil-1.0.yml`.
- **Swagger UI** estático servido em `GET /swagger-ui/index.html` (gerado por `openapi.properties` → `views.spec=swagger-ui.enabled=true`).
- `@OpenAPIDefinition` + `@SecurityScheme(BearerAuth)` em `config/OpenApiConfig.java`; controllers anotados com `@Tag`, `@Operation`, `@ApiResponse`.

---

## 3. Frontend

### 3.1 Princípios

- **Standalone components** (sem `NgModule`).
- **Co-localização**: cada page é `<feature>-page.{ts,html,css}` — sem template/style inline. Componentes em `shared/components/` seguem `<x>.component.{ts,html,css}`.
- **Lazy loading** por rota em `app.routes.ts`.
- **Signals** para estado local + RxJS para HTTP.
- **Reactive Forms** com `FormBuilder.nonNullable.group(...)`.

### 3.2 Camadas

```
Page Component (consome Item/Payload)
    ↓ inject(Service)
Service (Observable<XApiResponse> → map(toItem) → Observable<XItem>)
    ↓ HttpClient
HTTP → backend
```

Services definem `<X>ApiResponse` (formato cru do backend) **internamente** e mapeiam para `<X>Item` (modelo de domínio do frontend) via método privado `toItem()`. Componentes consomem **apenas** os tipos de `src/models/`.

Mesmo quando o shape é idêntico (caso atual: backend já devolve camelCase), a indireção existe para que mudanças futuras no backend fiquem locais ao service.

### 3.3 Tipos por recurso

Em `src/models/<recurso>.model.ts`, com sufixos do padrão:

| Sufixo            | Significado                          | Exemplo                        |
|-------------------|--------------------------------------|--------------------------------|
| `<X>Item`         | item de leitura (modelo de domínio)  | `AlunoItem`, `ProfessorItem`   |
| `<X>Payload`      | criação                              | `AlunoPayload`, `EmpresaPayload` |
| `<X>UpdatePayload`| atualização (campos opcionais)       | `AlunoProfileUpdatePayload`    |

### 3.4 Roteamento e autorização

- `app.routes.ts` declara tudo em um único array. Lazy: `loadComponent: () => import('...').then(m => m.Page)`.
- Guards funcionais em `src/guards/`:
  - `authGuard` — exige token; redireciona pra `/login`.
  - `adminGuard` — exige `tipoUsuario === 'ADMIN'`; redireciona conforme papel.
  - `professorGuard` — exige `tipoUsuario === 'PROFESSOR'`.
- Aplicados por rota: `canActivate: [authGuard, adminGuard]`.

### 3.5 HTTP — interceptors funcionais

Registrados em `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`:

- **`authInterceptor`** — anexa `Authorization: Bearer <token>` quando há token.
- **`errorInterceptor`** — captura `401` (exceto na rota de login) e dispara `auth.logout()` + redirect.

### 3.6 Autenticação no frontend

- Token e usuário corrente em **`sessionStorage`** (chaves `moedaestudantil.token` e `moedaestudantil.user`). Limpa ao fechar aba.
- `AuthService` expõe `login()`, `logout()`, `getToken()`, `getCurrentUser()`, `updateCurrentUserName()`, `isAuthenticated()`.
- Mapeamento `LoginApiResponse → LoginResult` interno ao service.

### 3.7 UI

- **Angular Material `MatSnackBar`** para feedback global (toasts de sucesso/erro). O padrão recomenda PrimeNG; o projeto mantém Material por decisão explícita — toda a interação visual já usa Material.
- Componentes próprios em `shared/components/` (button, card, app-shell com topbar, form-field, empty-state, page-header, transaction-item, transaction-list) — todos `standalone`, `OnPush`, com templates/estilos co-localizados.
- Tokens visuais em `src/styles/_tokens.scss`; reset e utilitários separados; `styles.scss` global mínimo.

### 3.8 Configuração

- `src/environments/environment.ts` (produção) e `environment.development.ts` (dev) com `apiUrl`. Trocados em build pelo `fileReplacements` em `angular.json` (config `development`).
- Cada service usa `${environment.apiUrl}/<recurso>` — zero URL hardcoded.

---

## 4. Desvios conscientes do padrão

| Item do padrão                       | Decisão                                              | Motivo |
|--------------------------------------|------------------------------------------------------|--------|
| PrimeNG + lucide-angular             | Mantido Angular Material + `material-icons` (CDN)    | Toda a tela já estava construída com Material; trocar é churn de UI sem ganho funcional. |
| `@Introspected` nos DTOs             | `@Serdeable` (Micronaut Serde)                       | Projeto usa `micronaut-serde-jackson`; `@Serdeable` é o equivalente nessa runtime, sem refletir. |
| `app/`, `pages/`, `services/`... na raiz | `app/` mantém `app.component`/`app.config`/`app.routes`; outras pastas na raiz de `src/` | Estrutura de bootstrap padrão do Angular CLI; o resto da árvore segue o padrão. |
| `AuthenticationProvider` do Micronaut Security | Login em controller próprio (`AuthService` + `JwtService`) | Atendido funcionalmente; refatorar para o `AuthenticationProvider` formal seria mecânico mas não muda a interface HTTP nem a segurança. |
| `application.yml` com chaves planas  | YAML aninhado                                        | Equivalente; YAML aninhado é mais legível. |

---

## 5. Como rodar

### Backend

Pré-requisitos: JDK 21, PostgreSQL escutando em `localhost:5432` com credenciais `postgres/postgres` (ou ajustar env vars).

```powershell
cd Aplicacao\Backend
./mvnw -DskipTests package
$env:JWT_SECRET = "ThisIsAVeryLongDevSecretForJwtSigningPleaseDoNotUseInProductionOk123"
java -jar target/MoedaEstudantil-0.1.jar
```

Endpoints expostos:
- Aplicação: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Spec: `http://localhost:8080/swagger/sistema-de-moeda-estudantil-1.0.yml`

Usuários do seeder:
- Admin: `admin@studentcoins.com` / `admin123`
- Professor: `joao.aramuni@puc.br` / `senha123`

### Frontend

```bash
cd Aplicacao/Frontend
npm install
npm start          # ng serve em http://localhost:4200
```

Build de produção: `npm run build`.
