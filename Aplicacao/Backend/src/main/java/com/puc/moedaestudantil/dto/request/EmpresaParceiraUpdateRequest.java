package com.puc.moedaestudantil.dto.request;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Serdeable
public record EmpresaParceiraUpdateRequest(
    @NotBlank @Email String email,
    @Nullable @Pattern(regexp = "^$|.{6,100}", message = "Senha deve ter no minimo 6 caracteres") String senha,
    @NotBlank @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter exatamente 14 digitos numericos") String cnpj,
    @NotBlank String nomeFantasia,
    @Nullable String descricao
) {}
