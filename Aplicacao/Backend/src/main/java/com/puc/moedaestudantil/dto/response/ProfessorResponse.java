package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record ProfessorResponse(
    Long id,
    String nome,
    String email,
    String cpf,
    String departamento,
    Long instituicaoId,
    String instituicaoNome,
    Integer saldoMoedas
) {}
