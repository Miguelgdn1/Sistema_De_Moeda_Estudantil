package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AlunoResponse(
    Long id,
    String email,
    String cpf,
    String rg,
    String nome,
    String endereco,
    String curso,
    Integer saldoMoedas,
    Long instituicaoId,
    String instituicaoNome
) {}
