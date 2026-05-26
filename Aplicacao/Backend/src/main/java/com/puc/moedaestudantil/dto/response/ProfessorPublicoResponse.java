package com.puc.moedaestudantil.dto.response;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record ProfessorPublicoResponse(
    Long id,
    String nome
) {}
