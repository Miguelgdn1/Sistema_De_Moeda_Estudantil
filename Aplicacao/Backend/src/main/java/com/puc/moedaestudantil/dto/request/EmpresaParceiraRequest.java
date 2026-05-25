package com.puc.moedaestudantil.dto.request;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Serdeable
public record EmpresaParceiraRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6, max = 100) String senha,
    @NotBlank @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter exatamente 14 digitos numericos") String cnpj,
    @NotBlank String nomeFantasia,
    @Nullable String descricao
) {}
