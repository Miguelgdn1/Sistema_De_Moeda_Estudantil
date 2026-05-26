package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AlunoResponse(
    Long id,
    String email,
    String cpf,
    String rg,
    String nome,
    String telefone,
    String endereco,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String uf,
    String curso,
    Integer saldoMoedas,
    Long instituicaoId,
    String instituicaoNome
) {}
