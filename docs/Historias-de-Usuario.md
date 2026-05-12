# Histórias de Usuário — Sistema de Moeda Estudantil (Release 1)

> Formato: **Como** [ator], **quero** [ação], **para** [valor de negócio].
> Cada história inclui **Critérios de aceitação** verificáveis.

---

## 👤 Aluno

### HU-01 — Cadastro de aluno
**Como** aluno,
**quero** me cadastrar no sistema informando nome, email, CPF, RG, endereço, instituição e curso,
**para** participar do programa de mérito e receber moedas.

**Critérios de aceitação:**
- O sistema apresenta uma lista de instituições pré-cadastradas para seleção.
- Campos obrigatórios: nome, email, CPF, RG, curso, instituição, senha.
- CPF é único no sistema (não permite duplicidade).
- Email é único no sistema (não permite duplicidade entre alunos, professores e empresas).
- A senha é armazenada com hash (BCrypt), nunca em texto claro.
- Após cadastro, o aluno é redirecionado para a tela de login.

---

### HU-02 — Login do aluno
**Como** aluno cadastrado,
**quero** fazer login com email e senha,
**para** acessar minhas funcionalidades no sistema.

**Critérios de aceitação:**
- Credenciais inválidas exibem mensagem de erro ("Credenciais inválidas").
- Login bem-sucedido emite um token JWT válido por 4 horas.
- Após login, o aluno é direcionado ao painel inicial.

---

### HU-03 — Consultar saldo e extrato
**Como** aluno autenticado,
**quero** visualizar o total de moedas que possuo e o histórico de transações (recebimentos e resgates),
**para** acompanhar minha pontuação e gastos.

**Critérios de aceitação:**
- O saldo atual é exibido em destaque.
- O extrato lista cada transação com data/hora, tipo (recebimento de moedas / resgate de vantagem), quantidade e mensagem/motivo.
- As transações são ordenadas da mais recente para a mais antiga.

---

### HU-04 — Receber notificação ao ganhar moedas
**Como** aluno,
**quero** ser notificado por email quando um professor me enviar moedas,
**para** saber que fui reconhecido e por qual motivo.

**Critérios de aceitação:**
- O email é disparado automaticamente no momento do envio.
- O email contém: nome do professor, quantidade de moedas recebidas e a mensagem (motivo) escrita pelo professor.

---

### HU-05 — Resgatar uma vantagem
**Como** aluno autenticado,
**quero** trocar minhas moedas por uma das vantagens cadastradas (desconto em restaurante, mensalidade, materiais, etc.),
**para** usufruir do programa de mérito.

**Critérios de aceitação:**
- O sistema lista todas as vantagens disponíveis com nome, descrição, custo em moedas e foto do produto.
- O resgate só é permitido se o saldo do aluno for ≥ ao custo da vantagem.
- Ao confirmar, o valor é descontado do saldo do aluno.
- O sistema gera um **código de cupom** único.
- Um email com o cupom é enviado ao aluno (para uso na troca presencial).
- Um email com o mesmo código é enviado à empresa parceira (para conferência).
- A transação é registrada no extrato.

---

## 👨‍🏫 Professor

### HU-06 — Login do professor
**Como** professor pré-cadastrado,
**quero** fazer login com email e senha,
**para** acessar a área de envio de moedas.

**Critérios de aceitação:**
- Professores são pré-cadastrados no momento da parceria (lista enviada pela instituição).
- Cada professor tem nome, CPF, departamento e está vinculado a uma instituição.
- Após login, o professor é direcionado ao painel com saldo de moedas visível.

---

### HU-07 — Receber moedas semestrais
**Como** professor,
**quero** receber automaticamente 1.000 moedas a cada semestre,
**para** distribuí-las como reconhecimento aos meus alunos.

**Critérios de aceitação:**
- O saldo é adicionado automaticamente no início do semestre.
- O saldo é **acumulável**: se sobrarem moedas do semestre anterior, elas permanecem.

---

### HU-08 — Enviar moedas a um aluno
**Como** professor autenticado,
**quero** enviar moedas a um aluno indicando a quantidade e uma mensagem de reconhecimento,
**para** premiar bom comportamento, participação em aula etc.

**Critérios de aceitação:**
- O envio só é permitido se o professor tiver saldo suficiente.
- A **mensagem (motivo)** é **obrigatória**.
- Ao confirmar, a quantidade é debitada do professor e creditada ao aluno.
- O aluno é notificado por email (HU-04).
- A transação é registrada no extrato do professor e do aluno.

---

### HU-09 — Consultar extrato do professor
**Como** professor autenticado,
**quero** visualizar meu saldo atual e o histórico de moedas enviadas,
**para** acompanhar minha distribuição ao longo do semestre.

**Critérios de aceitação:**
- O saldo atual é exibido em destaque.
- O extrato lista cada envio com data/hora, aluno destinatário, quantidade e mensagem.
- As transações são ordenadas da mais recente para a mais antiga.

---

## 🏢 Empresa Parceira

### HU-10 — Cadastro de empresa parceira
**Como** empresa interessada em participar do programa,
**quero** me cadastrar no sistema informando CNPJ, nome fantasia, descrição, email e senha,
**para** oferecer vantagens aos alunos.

**Critérios de aceitação:**
- CNPJ é único no sistema.
- Email é único no sistema.
- A senha é armazenada com hash (BCrypt).
- Após cadastro, a empresa é redirecionada para o login.

---

### HU-11 — Login da empresa parceira
**Como** empresa parceira cadastrada,
**quero** fazer login com email e senha,
**para** gerenciar minhas vantagens e conferir cupons resgatados.

**Critérios de aceitação:**
- Credenciais inválidas exibem mensagem de erro.
- Após login, a empresa acessa o painel com lista de vantagens cadastradas.

---

### HU-12 — Cadastrar uma vantagem
**Como** empresa parceira autenticada,
**quero** cadastrar uma vantagem com nome, descrição, custo em moedas e foto do produto,
**para** disponibilizá-la para resgate pelos alunos.

**Critérios de aceitação:**
- Campos obrigatórios: nome, descrição, custo em moedas, foto.
- O custo é um inteiro positivo.
- A foto pode ser um arquivo de imagem ou URL.
- Após cadastro, a vantagem aparece imediatamente na listagem disponível aos alunos.

---

### HU-13 — Receber notificação de resgate
**Como** empresa parceira,
**quero** ser notificada por email quando um aluno resgatar uma vantagem minha,
**para** conferir o cupom no momento da troca presencial.

**Critérios de aceitação:**
- O email é enviado no momento do resgate.
- O email contém: nome do aluno, vantagem resgatada e o **código de cupom** gerado pelo sistema (mesmo código recebido pelo aluno).

---

## 🔒 Histórias transversais (segurança / acesso)

### HU-14 — Autenticação obrigatória
**Como** sistema,
**quero** exigir autenticação válida para todos os requisitos (exceto os cadastros iniciais e login),
**para** garantir que apenas usuários autorizados utilizem suas respectivas funcionalidades.

**Critérios de aceitação:**
- Requisições sem token JWT válido a endpoints protegidos retornam HTTP 401.
- O token expirado força novo login.

---

### HU-15 — Logout
**Como** usuário autenticado (aluno, professor ou empresa),
**quero** poder sair do sistema,
**para** encerrar minha sessão de forma segura.

**Critérios de aceitação:**
- Ao sair, o token é removido do armazenamento local do navegador.
- O usuário é redirecionado para a tela de login.
- Tentativas subsequentes de acesso a rotas protegidas redirecionam para o login.

---

## 📊 Tabela-resumo

| ID | História | Ator | Sprint |
|---|---|---|---|
| HU-01 | Cadastro de aluno | Aluno | S02 |
| HU-02 | Login do aluno | Aluno | S02 |
| HU-03 | Consultar saldo e extrato | Aluno | Release 2 |
| HU-04 | Receber notificação ao ganhar moedas | Aluno | Release 2 |
| HU-05 | Resgatar uma vantagem | Aluno | Release 2 |
| HU-06 | Login do professor | Professor | S02 |
| HU-07 | Receber moedas semestrais | Professor | Release 2 |
| HU-08 | Enviar moedas a um aluno | Professor | Release 2 |
| HU-09 | Consultar extrato do professor | Professor | Release 2 |
| HU-10 | Cadastro de empresa parceira | Empresa | S02 |
| HU-11 | Login da empresa parceira | Empresa | S02 |
| HU-12 | Cadastrar uma vantagem | Empresa | Release 2 |
| HU-13 | Receber notificação de resgate | Empresa | Release 2 |
| HU-14 | Autenticação obrigatória | Sistema | S02 |
| HU-15 | Logout | Todos | S02 |
