-- =====================================================================
-- V2 -- Lab04: adicoes para CEP, telefone, cupom (resgate) e WhatsApp.
-- =====================================================================

-- Endereco estruturado em aluno (mantemos a coluna `endereco` legada
-- preenchida por concatenacao no service para nao quebrar leitores antigos).
ALTER TABLE aluno
    ADD COLUMN telefone     VARCHAR(20),
    ADD COLUMN cep          VARCHAR(8),
    ADD COLUMN logradouro   VARCHAR(255),
    ADD COLUMN numero       VARCHAR(20),
    ADD COLUMN complemento  VARCHAR(100),
    ADD COLUMN bairro       VARCHAR(100),
    ADD COLUMN cidade       VARCHAR(100),
    ADD COLUMN uf           VARCHAR(2);

ALTER TABLE instituicao
    ADD COLUMN cep          VARCHAR(8),
    ADD COLUMN logradouro   VARCHAR(255),
    ADD COLUMN numero       VARCHAR(20),
    ADD COLUMN complemento  VARCHAR(100),
    ADD COLUMN bairro       VARCHAR(100),
    ADD COLUMN cidade       VARCHAR(100),
    ADD COLUMN uf           VARCHAR(2);

-- Cupom: garantir unicidade do codigo + adicionar expiracao
ALTER TABLE transacao
    ADD COLUMN data_expiracao TIMESTAMP,
    ADD COLUMN cupom_usado_em TIMESTAMP;

CREATE UNIQUE INDEX uq_transacao_codigo_cupom
    ON transacao (codigo_cupom)
    WHERE codigo_cupom IS NOT NULL;