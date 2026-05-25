package com.puc.moedaestudantil.dto.request;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Serdeable
public record AlunoUpdateRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 3, max = 150) String nome,
    @Nullable String endereco,
    @Nullable @Size(min = 6, max = 100) String senha
) {}
