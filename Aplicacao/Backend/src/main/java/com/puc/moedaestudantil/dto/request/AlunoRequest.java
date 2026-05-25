package com.puc.moedaestudantil.dto.request;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Serdeable
public record AlunoRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6, max = 100) String senha,
    @NotBlank @Pattern(regexp = "\\d{11}", message = "CPF deve conter exatamente 11 digitos numericos") String cpf,
    @NotBlank String rg,
    @NotBlank String nome,
    @Nullable String endereco,
    @NotBlank String curso,
    @NotNull Long instituicaoId
) {}
