-- =====================================================================
-- V1 — Schema inicial do Sistema de Moeda Estudantil
-- Estrategia de heranca JOINED: tabela `usuario` (pai) + uma tabela por
-- subtipo (`aluno`, `professor`, `empresa_parceira`, `administrador`)
-- compartilhando o mesmo id por FK.
-- Soft-delete: coluna `deleted_at` nas entidades de dominio. `transacao`
-- e log imutavel e nao recebe soft-delete.
-- =====================================================================

CREATE TABLE instituicao (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    cnpj        VARCHAR(14) UNIQUE,
    endereco    TEXT,
    deleted_at  TIMESTAMP
);

CREATE TABLE usuario (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    deleted_at  TIMESTAMP
);

CREATE TABLE aluno (
    id              BIGINT PRIMARY KEY REFERENCES usuario(id),
    cpf             VARCHAR(11) NOT NULL UNIQUE,
    rg              VARCHAR(255) NOT NULL,
    nome            VARCHAR(255) NOT NULL,
    endereco        TEXT,
    curso           VARCHAR(255) NOT NULL,
    saldo_moedas    INTEGER NOT NULL DEFAULT 0,
    instituicao_id  BIGINT NOT NULL REFERENCES instituicao(id)
);

CREATE TABLE professor (
    id              BIGINT PRIMARY KEY REFERENCES usuario(id),
    cpf             VARCHAR(11) NOT NULL UNIQUE,
    nome            VARCHAR(255) NOT NULL,
    departamento    VARCHAR(255) NOT NULL,
    saldo_moedas    INTEGER NOT NULL DEFAULT 0,
    instituicao_id  BIGINT NOT NULL REFERENCES instituicao(id)
);

CREATE TABLE empresa_parceira (
    id              BIGINT PRIMARY KEY REFERENCES usuario(id),
    cnpj            VARCHAR(14) NOT NULL UNIQUE,
    nome_fantasia   VARCHAR(255) NOT NULL,
    descricao       TEXT
);

CREATE TABLE administrador (
    id      BIGINT PRIMARY KEY REFERENCES usuario(id),
    nome    VARCHAR(255) NOT NULL
);

CREATE TABLE vantagem (
    id              BIGSERIAL PRIMARY KEY,
    nome            VARCHAR(255) NOT NULL,
    descricao       TEXT,
    custo_moedas    INTEGER NOT NULL,
    foto_url        VARCHAR(500),
    empresa_id      BIGINT NOT NULL REFERENCES empresa_parceira(id),
    deleted_at      TIMESTAMP
);

CREATE TABLE transacao (
    id                  BIGSERIAL PRIMARY KEY,
    tipo                VARCHAR(30) NOT NULL,
    quantidade_moedas   INTEGER NOT NULL,
    data_hora           TIMESTAMP NOT NULL,
    mensagem            TEXT,
    codigo_cupom        VARCHAR(50),
    professor_id        BIGINT REFERENCES professor(id),
    aluno_id            BIGINT NOT NULL REFERENCES aluno(id),
    vantagem_id         BIGINT REFERENCES vantagem(id)
);

CREATE INDEX idx_usuario_email             ON usuario (email);
CREATE INDEX idx_usuario_deleted_at        ON usuario (deleted_at);
CREATE INDEX idx_aluno_instituicao         ON aluno (instituicao_id);
CREATE INDEX idx_professor_instituicao     ON professor (instituicao_id);
CREATE INDEX idx_vantagem_empresa          ON vantagem (empresa_id);
CREATE INDEX idx_vantagem_deleted_at       ON vantagem (deleted_at);
CREATE INDEX idx_instituicao_deleted_at    ON instituicao (deleted_at);
CREATE INDEX idx_transacao_aluno           ON transacao (aluno_id);
CREATE INDEX idx_transacao_professor       ON transacao (professor_id);
CREATE INDEX idx_transacao_vantagem        ON transacao (vantagem_id);
CREATE INDEX idx_transacao_data_hora       ON transacao (data_hora);
