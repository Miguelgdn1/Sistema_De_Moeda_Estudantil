package com.puc.moedaestudantil.dto.request;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Serdeable
public record LoginProfessorRequest(
    @NotNull Long professorId,
    @NotBlank String senha
) {}
