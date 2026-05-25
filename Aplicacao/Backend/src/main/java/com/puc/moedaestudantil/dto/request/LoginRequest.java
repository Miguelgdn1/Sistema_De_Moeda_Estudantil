package com.puc.moedaestudantil.dto.request;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Serdeable
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String senha
) {}
